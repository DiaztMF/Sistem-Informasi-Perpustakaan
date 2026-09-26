<?php

namespace App\Http\Controllers\Student;

use App\Enums\LoanStatus;
use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\Category;
use App\Models\LibrarySetting;
use App\Models\Loan;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(): Response
    {
        $stats = [
            'total_books' => Book::count(),
            'total_categories' => Category::count(),
            'total_students' => User::where('role', Role::SISWA)->count(),
            'total_borrowed' => Loan::where('status', LoanStatus::DIPINJAM)->count(),
        ];

        $popularBooks = Book::with('category')
            ->withCount('loans')
            ->orderByDesc('loans_count')
            ->orderByDesc('id')
            ->limit(8)
            ->get();

        $latestBooks = Book::with('category')
            ->latest('id')
            ->limit(8)
            ->get();

        $categories = Category::withCount('books')->get();
        $settings = LibrarySetting::first();

        return Inertia::render('student/home', [
            'stats' => $stats,
            'popularBooks' => $popularBooks,
            'latestBooks' => $latestBooks,
            'categories' => $categories,
            'settings' => $settings,
        ]);
    }
}
