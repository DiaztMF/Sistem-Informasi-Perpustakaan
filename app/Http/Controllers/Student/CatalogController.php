<?php

namespace App\Http\Controllers\Student;

use App\Enums\LoanStatus;
use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\Category;
use App\Models\LibrarySetting;
use App\Models\Loan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CatalogController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->value();
        $categorySlug = $request->string('category')->trim()->value();
        $availability = $request->string('availability')->trim()->value();

        $booksQuery = Book::with('category');

        if (! empty($search)) {
            $booksQuery->where(function ($query) use ($search) {
                $query->where('title', 'like', "%{$search}%")
                    ->orWhere('author', 'like', "%{$search}%")
                    ->orWhere('isbn', 'like', "%{$search}%");
            });
        }

        if (! empty($categorySlug)) {
            $booksQuery->whereHas('category', function ($query) use ($categorySlug) {
                $query->where('slug', $categorySlug);
            });
        }

        if ($availability === 'tersedia') {
            $booksQuery->where('stock', '>', 0);
        }

        $books = $booksQuery->latest('id')
            ->paginate(12)
            ->withQueryString();

        $categories = Category::withCount('books')->get();

        return Inertia::render('student/catalog', [
            'books' => $books,
            'categories' => $categories,
            'filters' => [
                'search' => $search,
                'category' => $categorySlug,
                'availability' => $availability ?: 'semua',
            ],
        ]);
    }

    public function show(string $slug): Response
    {
        $book = Book::with('category')
            ->where('slug', $slug)
            ->firstOrFail();

        $settings = LibrarySetting::first();
        $maxActiveLoans = $settings?->max_active_loans ?? 3;

        $user = auth()->user();
        $canBorrow = true;
        $cannotBorrowReason = null;

        if (! $book->isAvailable()) {
            $canBorrow = false;
            $cannotBorrowReason = 'Stok buku saat ini sedang habis.';
        } elseif ($user && $user->isSiswa()) {
            $activeLoansCount = Loan::where('user_id', $user->id)
                ->whereIn('status', [LoanStatus::DIPROSES, LoanStatus::DIPINJAM, LoanStatus::TERLAMBAT])
                ->count();

            if ($activeLoansCount >= $maxActiveLoans) {
                $canBorrow = false;
                $cannotBorrowReason = 'Anda telah mencapai batas maksimal peminjaman aktif.';
            }
        }

        return Inertia::render('student/book-detail', [
            'book' => $book,
            'settings' => $settings,
            'canBorrow' => $canBorrow,
            'cannotBorrowReason' => $cannotBorrowReason,
        ]);
    }
}
