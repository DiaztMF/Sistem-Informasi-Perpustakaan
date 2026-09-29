<?php

use App\Enums\LoanStatus;
use App\Enums\Role;
use App\Models\Book;
use App\Models\Category;
use App\Models\LibrarySetting;
use App\Models\Loan;
use App\Models\User;
use Database\Seeders\PerpustakaanSeeder;

test('user relationships and helpers work correctly', function () {
    $admin = User::create([
        'name' => 'Admin User',
        'email' => 'admin@test.com',
        'password' => bcrypt('password'),
        'role' => Role::ADMIN,
    ]);

    $siswa = User::create([
        'name' => 'Siswa User',
        'email' => 'siswa@test.com',
        'password' => bcrypt('password'),
        'nis' => '12345',
        'role' => Role::SISWA,
        'class_name' => 'XII MIPA 1',
        'phone' => '08123456789',
    ]);

    expect($admin->isAdmin())->toBeTrue();
    expect($admin->isSiswa())->toBeFalse();
    expect($admin->role)->toBe(Role::ADMIN);

    expect($siswa->isAdmin())->toBeFalse();
    expect($siswa->isSiswa())->toBeTrue();
    expect($siswa->role)->toBe(Role::SISWA);

    $category = Category::create([
        'name' => 'Fiksi',
        'slug' => 'fiksi',
        'description' => 'Buku fiksi',
    ]);

    $book = Book::create([
        'category_id' => $category->id,
        'title' => 'Test Book',
        'slug' => 'test-book',
        'author' => 'Author',
        'publisher' => 'Publisher',
        'publish_year' => 2024,
        'isbn' => '1234567890123',
        'stock' => 2,
        'total_stock' => 2,
    ]);

    $loan = Loan::create([
        'loan_code' => 'LOAN-001',
        'user_id' => $siswa->id,
        'book_id' => $book->id,
        'loan_date' => now()->toDateString(),
        'due_date' => now()->addDays(7)->toDateString(),
        'status' => LoanStatus::DIPINJAM,
        'fine_amount' => 0,
    ]);

    expect($siswa->loans)->toHaveCount(1);
    expect($siswa->loans->first()->id)->toBe($loan->id);
});

test('book and category relationships and helper work correctly', function () {
    $category = Category::create([
        'name' => 'Sains',
        'slug' => 'sains',
        'description' => 'Buku sains',
    ]);

    $book = Book::create([
        'category_id' => $category->id,
        'title' => 'Fisika Dasar',
        'slug' => 'fisika-dasar',
        'author' => 'Profesor Fisika',
        'publisher' => 'Penerbit Sains',
        'publish_year' => 2023,
        'isbn' => '9876543210123',
        'stock' => 1,
        'total_stock' => 1,
    ]);

    expect($book->category->id)->toBe($category->id);
    expect($category->books)->toHaveCount(1);
    expect($category->books->first()->id)->toBe($book->id);
    expect($book->isAvailable())->toBeTrue();

    $book->stock = 0;
    expect($book->isAvailable())->toBeFalse();
});

test('loan belongs to user and book and casts work correctly', function () {
    $user = User::create([
        'name' => 'Siswa Test',
        'email' => 'siswatest@test.com',
        'password' => bcrypt('password'),
        'role' => Role::SISWA,
    ]);

    $category = Category::create([
        'name' => 'Teknologi',
        'slug' => 'teknologi',
    ]);

    $book = Book::create([
        'category_id' => $category->id,
        'title' => 'Belajar Laravel',
        'slug' => 'belajar-laravel',
        'author' => 'Taylor',
        'publisher' => 'Laravel LLC',
        'publish_year' => 2025,
        'stock' => 5,
        'total_stock' => 5,
    ]);

    $loan = Loan::create([
        'loan_code' => 'LOAN-002',
        'user_id' => $user->id,
        'book_id' => $book->id,
        'loan_date' => now()->toDateString(),
        'due_date' => now()->addDays(7)->toDateString(),
        'status' => LoanStatus::DIPROSES,
        'fine_amount' => 5000,
    ]);

    expect($loan->user->id)->toBe($user->id);
    expect($loan->book->id)->toBe($book->id);
    expect($loan->status)->toBe(LoanStatus::DIPROSES);
    expect($loan->loan_date)->toBeInstanceOf(\Carbon\CarbonInterface::class);
    expect($loan->due_date)->toBeInstanceOf(\Carbon\CarbonInterface::class);
});

test('library setting model has fillable and integer casts', function () {
    $setting = LibrarySetting::create([
        'name' => 'Perpustakaan SMA Nusantara',
        'address' => 'Jl. Pendidikan No. 123 Surakarta',
        'open_hours' => 'Senin - Jumat 07.00 - 15.00',
        'contact_phone' => '0271-123456',
        'contact_email' => 'perpus@smanusantara.sch.id',
        'rules_text' => 'Tata tertib perpustakaan',
        'loan_duration_days' => '7',
        'fine_per_day' => '1000',
        'max_active_loans' => '2',
    ]);

    expect($setting->loan_duration_days)->toBe(7);
    expect($setting->fine_per_day)->toBe(1000);
    expect($setting->max_active_loans)->toBe(2);
});

test('perpustakaan seeder populates settings users categories books and loans', function () {
    $this->seed(PerpustakaanSeeder::class);

    expect(LibrarySetting::count())->toBeGreaterThanOrEqual(1);
    expect(User::where('email', 'admin@perpustakaan.sch.id')->first())->not->toBeNull();
    expect(User::where('email', 'andi@siswa.sch.id')->first())->not->toBeNull();
    expect(User::where('email', 'siti@siswa.sch.id')->first())->not->toBeNull();

    expect(Category::count())->toBe(8);
    expect(Book::count())->toBe(17);
    expect(Loan::count())->toBe(2);

    $admin = User::where('email', 'admin@perpustakaan.sch.id')->first();
    expect($admin->role)->toBe(Role::ADMIN);

    $andi = User::where('email', 'andi@siswa.sch.id')->first();
    expect($andi->nis)->toBe('2026001');
    expect($andi->loans)->toHaveCount(1);
    expect($andi->loans->first()->status)->toBe(LoanStatus::DIPROSES);

    $siti = User::where('email', 'siti@siswa.sch.id')->first();
    expect($siti->nis)->toBe('2026002');
    expect($siti->loans)->toHaveCount(1);
    expect($siti->loans->first()->status)->toBe(LoanStatus::DIPINJAM);
});
