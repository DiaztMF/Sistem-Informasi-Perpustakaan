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
        'open_hours' => 'Senin - Jumat: 07.00 - 15.00 WIB',
        'contact_phone' => '021-78901234',
        'contact_email' => 'perpustakaan@smamerdeka.sch.id',
        'rules_text' => 'Tata tertib perpustakaan...',
        'loan_duration_days' => 7,
        'fine_per_day' => 1000,
        'max_active_loans' => 2,
    ]);
});

test('guest cannot access borrow form or loan history', function () {
    $category = Category::factory()->create();
    $book = Book::factory()->create([
        'category_id' => $category->id,
        'slug' => 'buku-test',
        'stock' => 5,
    ]);

    $this->get('/peminjaman/' . $book->slug)->assertRedirect(route('login'));
    $this->post('/peminjaman/' . $book->slug, ['notes' => 'Mau pinjam'])->assertRedirect(route('login'));
    $this->get('/riwayat')->assertRedirect(route('login'));
});

test('admin cannot access student borrow route or history', function () {
    $admin = User::factory()->create(['role' => Role::ADMIN]);
    $category = Category::factory()->create();
    $book = Book::factory()->create([
        'category_id' => $category->id,
        'slug' => 'buku-test-admin',
        'stock' => 5,
    ]);

    $this->actingAs($admin)->get('/peminjaman/' . $book->slug)->assertForbidden();
    $this->actingAs($admin)->post('/peminjaman/' . $book->slug, ['notes' => 'Test'])->assertForbidden();
    $this->actingAs($admin)->get('/riwayat')->assertForbidden();
});

test('siswa can view borrow form for available book', function () {
    $student = User::factory()->create(['role' => Role::SISWA]);
    $category = Category::factory()->create();
    $book = Book::factory()->create([
        'category_id' => $category->id,
        'title' => 'Atomic Habits',
        'slug' => 'atomic-habits',
        'author' => 'James Clear',
        'stock' => 3,
    ]);

    $response = $this->actingAs($student)->get('/peminjaman/' . $book->slug);

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('student/loan-form')
        ->where('book.title', 'Atomic Habits')
        ->where('book.slug', 'atomic-habits')
        ->has('settings')
        ->has('loanDate')
        ->has('dueDate')
    );
});

test('siswa can submit loan: creates loan in database, decrements book stock, sets status to diproses', function () {
    $student = User::factory()->create(['role' => Role::SISWA]);
    $category = Category::factory()->create();
    $book = Book::factory()->create([
        'category_id' => $category->id,
        'title' => 'Clean Code',
        'slug' => 'clean-code',
        'stock' => 5,
    ]);

    $response = $this->actingAs($student)->post('/peminjaman/' . $book->slug, [
        'notes' => 'Untuk tugas akhir kelas 12',
    ]);

    $response->assertRedirect('/riwayat');
    $response->assertSessionHas('success', 'Pengajuan peminjaman berhasil dibuat. Silakan tunggu konfirmasi petugas perpustakaan.');

    $this->assertDatabaseHas('loans', [
        'user_id' => $student->id,
        'book_id' => $book->id,
        'status' => LoanStatus::DIPROSES->value,
        'notes' => 'Untuk tugas akhir kelas 12',
        'fine_amount' => 0,
    ]);

    expect($book->fresh()->stock)->toBe(4);
});

test('siswa cannot submit loan if book stock is 0', function () {
    $student = User::factory()->create(['role' => Role::SISWA]);
    $category = Category::factory()->create();
    $book = Book::factory()->create([
        'category_id' => $category->id,
        'title' => 'Habis Stock',
        'slug' => 'habis-stock',
        'stock' => 0,
    ]);

    $response = $this->actingAs($student)->post('/peminjaman/' . $book->slug, [
        'notes' => 'Mohon pinjam',
    ]);

    $response->assertSessionHasErrors(['book' => 'Stok buku sedang habis atau tidak tersedia.']);
    expect(Loan::where('book_id', $book->id)->count())->toBe(0);
});

test('siswa cannot submit loan if already having 2 active loans', function () {
    $student = User::factory()->create(['role' => Role::SISWA]);
    $category = Category::factory()->create();
    $book1 = Book::factory()->create(['category_id' => $category->id, 'stock' => 5]);
    $book2 = Book::factory()->create(['category_id' => $category->id, 'stock' => 5]);
    $targetBook = Book::factory()->create(['category_id' => $category->id, 'stock' => 5]);

    Loan::factory()->create([
        'user_id' => $student->id,
        'book_id' => $book1->id,
        'status' => LoanStatus::DIPROSES,
    ]);
    Loan::factory()->create([
        'user_id' => $student->id,
        'book_id' => $book2->id,
        'status' => LoanStatus::DIPINJAM,
    ]);

    $response = $this->actingAs($student)->post('/peminjaman/' . $targetBook->slug, [
        'notes' => 'Pinjam buku ke-3',
    ]);

    $response->assertSessionHasErrors(['loan' => 'Anda telah mencapai batas maksimal peminjaman aktif (2 buku).']);
    expect(Loan::where('book_id', $targetBook->id)->count())->toBe(0);
    expect($targetBook->fresh()->stock)->toBe(5);
});

test('siswa can view their own loan history, but cannot see other students loans', function () {
    $student1 = User::factory()->create(['role' => Role::SISWA]);
    $student2 = User::factory()->create(['role' => Role::SISWA]);
    $category = Category::factory()->create();

    $book1 = Book::factory()->create(['category_id' => $category->id, 'title' => 'Buku Siswa 1']);
    $book2 = Book::factory()->create(['category_id' => $category->id, 'title' => 'Buku Siswa 2']);

    Loan::factory()->create([
        'user_id' => $student1->id,
        'book_id' => $book1->id,
        'status' => LoanStatus::DIPINJAM,
    ]);

    Loan::factory()->create([
        'user_id' => $student2->id,
        'book_id' => $book2->id,
        'status' => LoanStatus::DIPINJAM,
    ]);

    $response = $this->actingAs($student1)->get('/riwayat');

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('student/loan-history')
        ->has('activeLoans', 1)
        ->where('activeLoans.0.book.title', 'Buku Siswa 1')
        ->has('completedLoans', 0)
    );
});
