<?php

use App\Enums\LoanStatus;
use App\Enums\Role;
use App\Models\Book;
use App\Models\Category;
use App\Models\Loan;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    $this->admin = User::factory()->create([
        'role' => Role::ADMIN,
    ]);

    $this->student = User::factory()->create([
        'role' => Role::SISWA,
    ]);

    $this->category = Category::factory()->create([
        'name' => 'Teknologi',
        'slug' => 'teknologi',
    ]);
});

test('guest cannot access admin dashboard or books', function () {
    $this->get(route('admin.dashboard'))
        ->assertRedirect(route('login'));

    $this->get(route('admin.books.index'))
        ->assertRedirect(route('login'));
});

test('siswa cannot access admin dashboard or books', function () {
    $this->actingAs($this->student)
        ->get(route('admin.dashboard'))
        ->assertForbidden();

    $this->actingAs($this->student)
        ->get(route('admin.books.index'))
        ->assertForbidden();
});

test('admin can view dashboard with metrics and charts', function () {
    Book::factory()->create([
        'category_id' => $this->category->id,
        'stock' => 5,
        'total_stock' => 5,
    ]);

    Loan::factory()->create([
        'user_id' => $this->student->id,
        'book_id' => Book::first()->id,
        'status' => LoanStatus::DIPINJAM,
        'loan_date' => now(),
    ]);

    $response = $this->actingAs($this->admin)
        ->get(route('admin.dashboard'));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/dashboard')
            ->has('metrics')
            ->has('loansChart')
            ->has('recentBooks')
            ->has('recentLoans')
        );
});

test('admin can view book list with filters', function () {
    Book::factory()->create([
        'title' => 'Pemrograman Web Modern',
        'category_id' => $this->category->id,
        'author' => 'John Doe',
    ]);

    $response = $this->actingAs($this->admin)
        ->get(route('admin.books.index', ['search' => 'Pemrograman']));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/books/index')
            ->has('books.data', 1)
            ->has('categories')
            ->has('filters')
        );
});

test('admin can create new book with validation and cover upload', function () {
    Storage::fake('public');

    $cover = UploadedFile::fake()->image('cover.jpg');

    $response = $this->actingAs($this->admin)
        ->post(route('admin.books.store'), [
            'title' => 'Buku Algoritma Baru',
            'category_id' => $this->category->id,
            'author' => 'Penulis Handal',
            'publisher' => 'Penerbit Cerdas',
            'publish_year' => 2024,
            'isbn' => '978-602-1234-56-7',
            'total_stock' => 10,
            'stock' => 10,
            'synopsis' => 'Buku algoritma dan struktur data lengkap.',
            'cover_image' => $cover,
        ]);

    $response->assertRedirect(route('admin.books.index'));

    $this->assertDatabaseHas('books', [
        'title' => 'Buku Algoritma Baru',
        'slug' => 'buku-algoritma-baru',
        'author' => 'Penulis Handal',
        'stock' => 10,
        'total_stock' => 10,
    ]);

    $book = Book::where('slug', 'buku-algoritma-baru')->first();
    expect($book->cover_image)->not->toBeNull();
    Storage::disk('public')->assertExists($book->cover_image);
});

test('admin can update existing book', function () {
    $book = Book::factory()->create([
        'title' => 'Buku Lama',
        'category_id' => $this->category->id,
        'stock' => 5,
        'total_stock' => 5,
    ]);

    $response = $this->actingAs($this->admin)
        ->put(route('admin.books.update', $book), [
            'title' => 'Buku Terupdate',
            'category_id' => $this->category->id,
            'author' => 'Author Baru',
            'publisher' => 'Penerbit Baru',
            'publish_year' => 2025,
            'total_stock' => 8,
            'stock' => 8,
            'synopsis' => 'Sinopsis revisi',
        ]);

    $response->assertRedirect(route('admin.books.index'));

    $this->assertDatabaseHas('books', [
        'id' => $book->id,
        'title' => 'Buku Terupdate',
        'author' => 'Author Baru',
        'total_stock' => 8,
    ]);
});

test('admin cannot delete book if active loans exist', function () {
    $book = Book::factory()->create([
        'category_id' => $this->category->id,
    ]);

    Loan::factory()->create([
        'user_id' => $this->student->id,
        'book_id' => $book->id,
        'status' => LoanStatus::DIPINJAM,
    ]);

    $response = $this->actingAs($this->admin)
        ->from(route('admin.books.index'))
        ->delete(route('admin.books.destroy', $book));

    $response->assertRedirect(route('admin.books.index'))
        ->assertSessionHas('error', 'Buku tidak dapat dihapus karena sedang dalam masa peminjaman.');

    $this->assertDatabaseHas('books', [
        'id' => $book->id,
    ]);
});

test('admin can delete book if no active loans exist', function () {
    $book = Book::factory()->create([
        'category_id' => $this->category->id,
    ]);

    $response = $this->actingAs($this->admin)
        ->delete(route('admin.books.destroy', $book));

    $response->assertRedirect(route('admin.books.index'));

    $this->assertDatabaseMissing('books', [
        'id' => $book->id,
    ]);
});
