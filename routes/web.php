<?php

use App\Http\Controllers\Student\CatalogController;
use App\Http\Controllers\Student\HomeController;
use App\Http\Controllers\Student\InformationController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/katalog', [CatalogController::class, 'index'])->name('catalog.index');
Route::get('/buku/{book:slug}', [CatalogController::class, 'show'])->name('catalog.show');
Route::get('/informasi', [InformationController::class, 'index'])->name('information');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';
