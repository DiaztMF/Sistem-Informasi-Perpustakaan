<?php

namespace App\Http\Controllers\Admin;

use App\Enums\LoanStatus;
use App\Http\Controllers\Controller;
use App\Models\LibrarySetting;
use App\Models\Loan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class LoanManagementController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->string('status')->toString();
        $search = $request->string('search')->toString();

        $query = Loan::with(['user', 'book']);

        if ($status && $status !== 'semua') {
            $query->where('status', $status);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('loan_code', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->where('name', 'like', "%{$search}%")
                            ->orWhere('nis', 'like', "%{$search}%");
                    })
                    ->orWhereHas('book', function ($bq) use ($search) {
                        $bq->where('title', 'like', "%{$search}%");
                    });
            });
        }

        $loans = $query->latest()->paginate(10)->withQueryString();

        $statusCounts = [
            'semua' => Loan::count(),
            'diproses' => Loan::where('status', LoanStatus::DIPROSES)->count(),
            'dipinjam' => Loan::where('status', LoanStatus::DIPINJAM)->count(),
            'selesai' => Loan::where('status', LoanStatus::SELESAI)->count(),
            'terlambat' => Loan::where('status', LoanStatus::TERLAMBAT)->count(),
            'ditolak' => Loan::where('status', LoanStatus::DITOLAK)->count(),
        ];

        return Inertia::render('admin/loans/index', [
            'loans' => $loans,
            'filters' => [
                'status' => $status ?: 'semua',
                'search' => $search,
            ],
            'statusCounts' => $statusCounts,
        ]);
    }

    public function approve(Request $request, Loan $loan): RedirectResponse
    {
        if ($loan->status !== LoanStatus::DIPROSES) {
            return redirect()->back()->with('error', 'Hanya peminjaman berstatus diproses yang dapat disetujui.');
        }

        $setting = LibrarySetting::first();
        $duration = $setting->loan_duration_days ?? 7;

        $loan->update([
            'status' => LoanStatus::DIPINJAM,
            'loan_date' => now()->toDateString(),
            'due_date' => now()->addDays($duration)->toDateString(),
        ]);

        return redirect()->back()->with('success', 'Buku berhasil diserahkan kepada siswa.');
    }

    public function returnBook(Request $request, Loan $loan): RedirectResponse
    {
        if (! in_array($loan->status, [LoanStatus::DIPINJAM, LoanStatus::TERLAMBAT])) {
            return redirect()->back()->with('error', 'Peminjaman tidak dalam masa pinjam aktif.');
        }

        DB::transaction(function () use ($loan) {
            $today = now()->startOfDay();
            $dueDay = $loan->due_date->startOfDay();
            $fine = 0;

            if ($today->gt($dueDay)) {
                $daysLate = $dueDay->diffInDays($today);
                $setting = LibrarySetting::first();
                $finePerDay = $setting->fine_per_day ?? 1000;
                $fine = $daysLate * $finePerDay;
            }

            $loan->update([
                'return_date' => now()->toDateString(),
                'fine_amount' => $fine,
                'status' => LoanStatus::SELESAI,
            ]);

            $loan->book->increment('stock');
        });

        $message = 'Buku berhasil dikembalikan.';
        if ((int) $loan->fine_amount > 0) {
            $message .= ' Denda keterlambatan: Rp '.number_format($loan->fine_amount, 0, ',', '.');
        }

        return redirect()->back()->with('success', $message);
    }

    public function reject(Request $request, Loan $loan): RedirectResponse
    {
        if ($loan->status !== LoanStatus::DIPROSES) {
            return redirect()->back()->with('error', 'Hanya peminjaman berstatus diproses yang dapat ditolak.');
        }

        $validated = $request->validate([
            'admin_notes' => ['required', 'string', 'max:500'],
        ]);

        DB::transaction(function () use ($loan, $validated) {
            $loan->update([
                'status' => LoanStatus::DITOLAK,
                'admin_notes' => $validated['admin_notes'],
            ]);

            $loan->book->increment('stock');
        });

        return redirect()->back()->with('success', 'Peminjaman berhasil ditolak.');
    }
}
