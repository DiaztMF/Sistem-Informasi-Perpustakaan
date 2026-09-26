<?php

namespace App\Http\Controllers\Student;

use App\Enums\LoanStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Student\StoreLoanRequest;
use App\Models\Book;
use App\Models\LibrarySetting;
use App\Models\Loan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class LoanController extends Controller
{
    /**
     * Show loan application form for a book.
     */
    public function create(Request $request, Book $book): Response
    {
        $book->load('category');
        $settings = LibrarySetting::first();
        $loanDuration = $settings->loan_duration_days ?? 7;

        $loanDate = Carbon::now();
        $dueDate = Carbon::now()->addDays($loanDuration);

        return Inertia::render('student/loan-form', [
            'book' => [
                'id' => $book->id,
                'title' => $book->title,
                'slug' => $book->slug,
                'author' => $book->author,
                'publisher' => $book->publisher,
                'publication_year' => $book->publication_year,
                'cover_image' => $book->cover_image,
                'stock' => $book->stock,
                'category' => $book->category ? [
                    'id' => $book->category->id,
                    'name' => $book->category->name,
                ] : null,
            ],
            'loanDate' => $loanDate->format('d/m/Y'),
            'dueDate' => $dueDate->format('d/m/Y'),
            'settings' => $settings ? [
                'loan_duration_days' => $settings->loan_duration_days,
                'max_active_loans' => $settings->max_active_loans,
                'fine_per_day' => $settings->fine_per_day,
            ] : [
                'loan_duration_days' => 7,
                'max_active_loans' => 2,
                'fine_per_day' => 1000,
            ],
        ]);
    }

    /**
     * Store a loan application atomically.
     */
    public function store(StoreLoanRequest $request, Book $book): RedirectResponse
    {
        $userId = $request->user()->id;

        DB::transaction(function () use ($book, $request, $userId) {
            /** @var Book $lockedBook */
            $lockedBook = Book::where('id', $book->id)->lockForUpdate()->firstOrFail();

            if ($lockedBook->stock <= 0) {
                throw ValidationException::withMessages([
                    'book' => 'Stok buku sedang habis atau tidak tersedia.',
                ]);
            }

            $settings = LibrarySetting::first();
            $maxActiveLoans = $settings->max_active_loans ?? 2;
            $loanDuration = $settings->loan_duration_days ?? 7;

            $activeCount = Loan::where('user_id', $userId)
                ->whereIn('status', [
                    LoanStatus::DIPROSES,
                    LoanStatus::DIPINJAM,
                    LoanStatus::TERLAMBAT,
                ])
                ->count();

            if ($activeCount >= $maxActiveLoans) {
                throw ValidationException::withMessages([
                    'loan' => "Anda telah mencapai batas maksimal peminjaman aktif ({$maxActiveLoans} buku).",
                ]);
            }

            $loanCode = 'PINJAM-' . date('Ymd') . '-' . strtoupper(Str::random(4));

            Loan::create([
                'user_id' => $userId,
                'book_id' => $lockedBook->id,
                'loan_code' => $loanCode,
                'loan_date' => Carbon::now()->toDateString(),
                'due_date' => Carbon::now()->addDays($loanDuration)->toDateString(),
                'status' => LoanStatus::DIPROSES,
                'notes' => $request->validated('notes'),
                'fine_amount' => 0,
            ]);

            $lockedBook->decrement('stock');
        });

        return redirect()->route('loans.history')->with(
            'success',
            'Pengajuan peminjaman berhasil dibuat. Silakan tunggu konfirmasi petugas perpustakaan.'
        );
    }

    /**
     * Display student's loan history.
     */
    public function history(Request $request): Response
    {
        $user = $request->user();

        $activeLoans = Loan::with(['book.category'])
            ->where('user_id', $user->id)
            ->whereIn('status', [
                LoanStatus::DIPROSES,
                LoanStatus::DIPINJAM,
                LoanStatus::TERLAMBAT,
            ])
            ->latest('id')
            ->get()
            ->map(fn (Loan $loan) => $this->transformLoan($loan));

        $completedLoans = Loan::with(['book.category'])
            ->where('user_id', $user->id)
            ->whereIn('status', [
                LoanStatus::SELESAI,
                LoanStatus::DITOLAK,
            ])
            ->latest('id')
            ->get()
            ->map(fn (Loan $loan) => $this->transformLoan($loan));

        return Inertia::render('student/loan-history', [
            'activeLoans' => $activeLoans,
            'completedLoans' => $completedLoans,
        ]);
    }

    /**
     * Transform loan model to payload array.
     *
     * @return array<string, mixed>
     */
    private function transformLoan(Loan $loan): array
    {
        return [
            'id' => $loan->id,
            'loan_code' => $loan->loan_code,
            'loan_date' => $loan->loan_date ? $loan->loan_date->format('d/m/Y') : null,
            'due_date' => $loan->due_date ? $loan->due_date->format('d/m/Y') : null,
            'return_date' => $loan->return_date ? $loan->return_date->format('d/m/Y') : null,
            'status' => $loan->status instanceof LoanStatus ? $loan->status->value : (string) $loan->status,
            'notes' => $loan->notes,
            'admin_notes' => $loan->admin_notes,
            'fine_amount' => (float) $loan->fine_amount,
            'book' => $loan->book ? [
                'id' => $loan->book->id,
                'title' => $loan->book->title,
                'slug' => $loan->book->slug,
                'author' => $loan->book->author,
                'cover_image' => $loan->book->cover_image,
                'category' => $loan->book->category ? [
                    'id' => $loan->book->category->id,
                    'name' => $loan->book->category->name,
                ] : null,
            ] : null,
        ];
    }
}
