<?php

namespace App\Http\Controllers\Admin;

use App\Enums\LoanStatus;
use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\Category;
use App\Models\Loan;
use App\Models\User;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $totalBooks = (int) (Book::sum('total_stock') ?: Book::count());
        $totalStudents = User::where('role', Role::SISWA)->count();
        $activeLoans = Loan::where('status', LoanStatus::DIPINJAM)->count();
        $totalCategories = Category::count();

        // 7 days loan activity
        $loansChart = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $count = Loan::whereDate('loan_date', $date->toDateString())->count();
            $loansChart[] = [
                'date' => $date->translatedFormat('d M'),
                'count' => $count,
            ];
        }

        $recentBooks = Book::with('category')
            ->latest()
            ->limit(5)
            ->get();

        $recentLoans = Loan::with(['user', 'book'])
            ->whereIn('status', [LoanStatus::DIPROSES, LoanStatus::DIPINJAM, LoanStatus::TERLAMBAT])
            ->latest()
            ->limit(5)
            ->get();

        return Inertia::render('admin/dashboard', [
            'metrics' => [
                'totalBooks' => $totalBooks,
                'totalStudents' => $totalStudents,
                'activeLoans' => $activeLoans,
                'totalCategories' => $totalCategories,
            ],
            'loansChart' => $loansChart,
            'recentBooks' => $recentBooks,
            'recentLoans' => $recentLoans,
        ]);
    }
}
