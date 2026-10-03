<?php

use App\Http\Controllers\Admin\BookController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\LoanManagementController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\StudentController;
use App\Http\Controllers\Student\CatalogController;
use App\Http\Controllers\Student\HomeController;
use App\Http\Controllers\Student\InformationController;
use App\Http\Controllers\Student\LoanController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/katalog', [CatalogController::class, 'index'])->name('catalog.index');
Route::get('/buku/{book:slug}', [CatalogController::class, 'show'])->name('catalog.show');
Route::get('/informasi', [InformationController::class, 'index'])->name('information');

Route::middleware(['auth', 'role:siswa'])->group(function () {
    Route::get('/peminjaman/{book:slug}', [LoanController::class, 'create'])->name('loans.create');
    Route::post('/peminjaman/{book:slug}', [LoanController::class, 'store'])->name('loans.store');
    Route::get('/riwayat', [LoanController::class, 'history'])->name('loans.history');
});

Route::prefix('admin')->middleware(['auth', 'role:admin'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('admin.dashboard');
    Route::resource('buku', BookController::class)->names('admin.books');
    Route::resource('kategori', CategoryController::class)->names('admin.categories')->only(['store', 'update', 'destroy']);
    Route::resource('siswa', StudentController::class)->names('admin.students')->except(['create', 'show', 'edit']);
    Route::get('/peminjaman', [LoanManagementController::class, 'index'])->name('admin.loans.index');
    Route::post('/peminjaman/{loan}/setujui', [LoanManagementController::class, 'approve'])->name('admin.loans.approve');
    Route::post('/peminjaman/{loan}/kembali', [LoanManagementController::class, 'returnBook'])->name('admin.loans.return');
    Route::post('/peminjaman/{loan}/tolak', [LoanManagementController::class, 'reject'])->name('admin.loans.reject');
    Route::get('/laporan', [ReportController::class, 'index'])->name('admin.reports.index');
    Route::get('/laporan/export-csv', [ReportController::class, 'exportCsv'])->name('admin.reports.export');
    Route::get('/pengaturan', [SettingController::class, 'index'])->name('admin.settings.index');
    Route::put('/pengaturan', [SettingController::class, 'update'])->name('admin.settings.update');
});

Route::middleware(['auth'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';
