<?php

namespace App\Http\Controllers\Admin;

use App\Enums\LoanStatus;
use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Loan;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    /**
     * Display library reports with summary metrics and filters.
     */
    public function index(Request $request): Response
    {
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');
        $status = $request->query('status');
        $categoryId = $request->query('category_id');

        $baseQuery = Loan::query();

        if ($startDate) {
            $baseQuery->whereDate('loan_date', '>=', $startDate);
        }

        if ($endDate) {
            $baseQuery->whereDate('loan_date', '<=', $endDate);
        }

        if ($status) {
            $baseQuery->where('status', $status);
        }

        if ($categoryId) {
            $baseQuery->whereHas('book', function (Builder $query) use ($categoryId) {
                $query->where('category_id', $categoryId);
            });
        }

        // Calculate summary metrics on the filtered scope
        $totalLoans = (clone $baseQuery)->count();
        $totalCompleted = (clone $baseQuery)->where('status', LoanStatus::SELESAI)->count();
        $totalFines = (float) (clone $baseQuery)->sum('fine_amount');

        // Most borrowed books in this period/filter
        $mostBorrowedBooks = (clone $baseQuery)
            ->join('books', 'loans.book_id', '=', 'books.id')
            ->selectRaw('books.id, books.title, count(loans.id) as borrow_count')
            ->groupBy('books.id', 'books.title')
            ->orderByDesc('borrow_count')
            ->limit(5)
            ->get()
            ->map(fn ($item) => [
                'id' => $item->id,
                'title' => $item->title,
                'borrow_count' => (int) $item->borrow_count,
            ]);

        $loans = (clone $baseQuery)
            ->with(['user', 'book.category'])
            ->latest('loan_date')
            ->get()
            ->map(fn (Loan $loan) => [
                'id' => $loan->id,
                'loan_code' => $loan->loan_code,
                'loan_date' => $loan->loan_date ? $loan->loan_date->format('Y-m-d') : null,
                'due_date' => $loan->due_date ? $loan->due_date->format('Y-m-d') : null,
                'return_date' => $loan->return_date ? $loan->return_date->format('Y-m-d') : null,
                'status' => $loan->status instanceof LoanStatus ? $loan->status->value : (string) $loan->status,
                'fine_amount' => (float) $loan->fine_amount,
                'user' => $loan->user ? [
                    'id' => $loan->user->id,
                    'name' => $loan->user->name,
                    'nis' => $loan->user->nis,
                    'class_name' => $loan->user->class_name,
                ] : null,
                'book' => $loan->book ? [
                    'id' => $loan->book->id,
                    'title' => $loan->book->title,
                    'category' => $loan->book->category ? [
                        'id' => $loan->book->category->id,
                        'name' => $loan->book->category->name,
                    ] : null,
                ] : null,
            ]);

        $categories = Category::orderBy('name')->get(['id', 'name']);

        return Inertia::render('admin/reports/index', [
            'loans' => $loans,
            'summary' => [
                'totalLoans' => $totalLoans,
                'totalCompleted' => $totalCompleted,
                'totalFines' => $totalFines,
                'mostBorrowedBooks' => $mostBorrowedBooks,
            ],
            'categories' => $categories,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'status' => $status,
                'category_id' => $categoryId,
            ],
        ]);
    }

    /**
     * Export loans as CSV stream with UTF-8 BOM.
     */
    public function exportCsv(Request $request): StreamedResponse
    {
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');
        $status = $request->query('status');
        $categoryId = $request->query('category_id');

        $query = Loan::query()->with(['user', 'book.category']);

        if ($startDate) {
            $query->whereDate('loan_date', '>=', $startDate);
        }

        if ($endDate) {
            $query->whereDate('loan_date', '<=', $endDate);
        }

        if ($status) {
            $query->where('status', $status);
        }

        if ($categoryId) {
            $query->whereHas('book', function (Builder $q) use ($categoryId) {
                $q->where('category_id', $categoryId);
            });
        }

        $filename = 'laporan-peminjaman-perpustakaan-' . date('Y-m-d') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        return response()->streamDownload(function () use ($query) {
            $output = fopen('php://output', 'w');

            // UTF-8 BOM for Microsoft Excel compatibility
            fwrite($output, "\xEF\xBB\xBF");

            // Header Row
            fputcsv($output, [
                'No',
                'Kode Pinjam',
                'Nama Siswa',
                'NIS',
                'Judul Buku',
                'Kategori',
                'Tgl Pinjam',
                'Tgl Kembali',
                'Status',
                'Denda (Rp)',
            ]);

            $index = 1;
            $query->orderBy('loan_date', 'desc')->chunk(200, function ($loans) use ($output, &$index) {
                foreach ($loans as $loan) {
                    $statusStr = $loan->status instanceof LoanStatus ? $loan->status->value : (string) $loan->status;
                    fputcsv($output, [
                        $index++,
                        $loan->loan_code,
                        $loan->user?->name ?? '-',
                        $loan->user?->nis ?? '-',
                        $loan->book?->title ?? '-',
                        $loan->book?->category?->name ?? '-',
                        $loan->loan_date ? $loan->loan_date->format('Y-m-d') : '-',
                        $loan->return_date ? $loan->return_date->format('Y-m-d') : '-',
                        ucfirst($statusStr),
                        (float) $loan->fine_amount,
                    ]);
                }
            });

            fclose($output);
        }, $filename, $headers);
    }
}
