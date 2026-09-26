<?php

use App\Enums\LoanStatus;
use App\Enums\Role;
use App\Models\Book;
use App\Models\Category;
use App\Models\LibrarySetting;
use App\Models\Loan;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    LibrarySetting::firstOrCreate([], [
        'name' => 'Perpustakaan SMA Merdeka',
        'address' => 'Jl. Pendidikan No. 45, Jakarta Selatan',
        'open_hours' => 'Senin - Jumat: 07.00 - 15.00 WIB, Sabtu: 07.00 - 12.00 WIB',
        'contact_phone' => '021-78901234',
        'contact_email' => 'perpustakaan@smamerdeka.sch.id',
        'rules_text' => 'Tata tertib perpustakaan sekolah...',
        'loan_duration_days' => 7,
        'fine_per_day' => 1000,
        'max_active_loans' => 3,
    ]);
});

test('public home page returns ok and renders student/home with expected data', function () {
    $category = Category::factory()->create(['name' => 'Fiksi', 'slug' => 'fiksi']);
    $book = Book::factory()->create([
        'category_id' => $category->id,
        'title' => 'Laskar Pelangi',
        'slug' => 'laskar-pelangi',
        'stock' => 5,
        'total_stock' => 5,
    ]);

    $student = User::factory()->create(['role' => Role::SISWA]);
    Loan::factory()->create([
        'book_id' => $book->id,
        'user_id' => $student->id,
        'status' => LoanStatus::DIPINJAM,
    ]);

    $response = $this->get(route('home'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('student/home')
        ->has('stats')
        ->where('stats.total_books', 1)
        ->where('stats.total_categories', 1)
        ->where('stats.total_students', 1)
        ->where('stats.total_borrowed', 1)
        ->has('popularBooks')
        ->has('latestBooks')
        ->has('categories')
        ->has('settings')
    );
});

test('public catalog page returns ok and filters by search and category and availability', function () {
    $fiction = Category::factory()->create(['name' => 'Fiksi', 'slug' => 'fiksi']);
    $science = Category::factory()->create(['name' => 'Sains', 'slug' => 'sains']);

    Book::factory()->create([
        'category_id' => $fiction->id,
        'title' => 'Laskar Pelangi',
        'slug' => 'laskar-pelangi',
        'author' => 'Andrea Hirata',
        'stock' => 2,
    ]);

    Book::factory()->create([
        'category_id' => $science->id,
        'title' => 'Fisika Dasar',
        'slug' => 'fisika-dasar',
        'author' => 'Halliday',
        'stock' => 0,
    ]);

    $responseAll = $this->get(route('catalog.index'));
    $responseAll->assertOk();
    $responseAll->assertInertia(fn (Assert $page) => $page
        ->component('student/catalog')
        ->has('books.data', 2)
        ->has('categories')
        ->has('filters')
    );

    // Search filter
    $responseSearch = $this->get(route('catalog.index', ['search' => 'Andrea']));
    $responseSearch->assertOk();
    $responseSearch->assertInertia(fn (Assert $page) => $page
        ->component('student/catalog')
        ->where('books.data.0.title', 'Laskar Pelangi')
        ->has('books.data', 1)
    );

    // Category filter
    $responseCat = $this->get(route('catalog.index', ['category' => 'sains']));
    $responseCat->assertOk();
    $responseCat->assertInertia(fn (Assert $page) => $page
        ->component('student/catalog')
        ->where('books.data.0.title', 'Fisika Dasar')
        ->has('books.data', 1)
    );

    // Availability filter
    $responseAvailable = $this->get(route('catalog.index', ['availability' => 'tersedia']));
    $responseAvailable->assertOk();
    $responseAvailable->assertInertia(fn (Assert $page) => $page
        ->component('student/catalog')
        ->where('books.data.0.title', 'Laskar Pelangi')
        ->has('books.data', 1)
    );
});

test('public book detail page returns ok for existing book and 404 for missing', function () {
    $category = Category::factory()->create(['name' => 'Fiksi', 'slug' => 'fiksi']);
    $book = Book::factory()->create([
        'category_id' => $category->id,
        'title' => 'Bumi Manusia',
        'slug' => 'bumi-manusia',
        'stock' => 3,
    ]);

    $response = $this->get(route('catalog.show', $book->slug));
    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('student/book-detail')
        ->where('book.title', 'Bumi Manusia')
        ->has('settings')
        ->has('canBorrow')
    );

    $missingResponse = $this->get('/buku/buku-tidak-ditemukan');
    $missingResponse->assertNotFound();
});

test('book detail checks active loans limit for authenticated siswa', function () {
    $category = Category::factory()->create(['name' => 'Fiksi', 'slug' => 'fiksi']);
    $book = Book::factory()->create([
        'category_id' => $category->id,
        'title' => 'Bumi Manusia',
        'slug' => 'bumi-manusia',
        'stock' => 3,
    ]);

    $student = User::factory()->create(['role' => Role::SISWA]);
    Loan::factory()->count(3)->create([
        'user_id' => $student->id,
        'status' => LoanStatus::DIPINJAM,
    ]);

    $response = $this->actingAs($student)->get(route('catalog.show', $book->slug));
    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('student/book-detail')
        ->where('canBorrow', false)
        ->where('cannotBorrowReason', 'Anda telah mencapai batas maksimal peminjaman aktif.')
    );
});

test('public information page returns ok and renders library settings', function () {
    $response = $this->get(route('information'));
    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('student/information')
        ->has('settings')
        ->where('settings.name', 'Perpustakaan SMA Merdeka')
    );
});
