<?php

use App\Enums\LoanStatus;
use App\Enums\Role;
use App\Models\Book;
use App\Models\Category;
use App\Models\LibrarySetting;
use App\Models\Loan;
use App\Models\User;

beforeEach(function () {
    $this->admin = User::factory()->create([
        'role' => Role::ADMIN,
    ]);

    $this->student = User::factory()->create([
        'role' => Role::SISWA,
        'nis' => '12345',
        'class_name' => 'XII RPL 1',
    ]);

    $this->category = Category::factory()->create([
        'name' => 'Sains',
        'slug' => 'sains',
    ]);

    $this->setting = LibrarySetting::firstOrCreate([], [
        'name' => 'Perpustakaan SMK',
        'loan_duration_days' => 7,
        'fine_per_day' => 1000,
        'max_active_loans' => 3,
    ]);
});

test('admin can view student list with search and pagination', function () {
    User::factory()->create([
        'name' => 'Ahmad Santoso',
        'nis' => '998877',
        'email' => 'ahmad@example.com',
        'class_name' => 'X RPL 2',
        'role' => Role::SISWA,
    ]);

    $response = $this->actingAs($this->admin)
        ->get(route('admin.students.index', ['search' => 'Ahmad']));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/students/index')
            ->has('students.data', 1)
            ->has('filters')
        );
});

test('admin can create, update, and delete student', function () {
    // Create
    $storeResponse = $this->actingAs($this->admin)
        ->post(route('admin.students.store'), [
            'name' => 'Budi Pratama',
            'nis' => '102030',
            'email' => 'budi@example.com',
            'class_name' => 'XI TKJ 1',
            'phone' => '081234567890',
            'password' => 'secret123',
        ]);

    $storeResponse->assertRedirect();
    $this->assertDatabaseHas('users', [
        'name' => 'Budi Pratama',
        'nis' => '102030',
        'email' => 'budi@example.com',
        'class_name' => 'XI TKJ 1',
        'role' => Role::SISWA->value,
    ]);

    $student = User::where('nis', '102030')->first();

    // Update
    $updateResponse = $this->actingAs($this->admin)
        ->put(route('admin.students.update', $student), [
            'name' => 'Budi Pratama Updated',
            'nis' => '102030',
            'email' => 'budi.new@example.com',
            'class_name' => 'XI TKJ 2',
            'phone' => '08999999999',
        ]);

    $updateResponse->assertRedirect();
    $this->assertDatabaseHas('users', [
        'id' => $student->id,
        'name' => 'Budi Pratama Updated',
        'email' => 'budi.new@example.com',
        'class_name' => 'XI TKJ 2',
    ]);

    // Delete
    $deleteResponse = $this->actingAs($this->admin)
        ->delete(route('admin.students.destroy', $student));

    $deleteResponse->assertRedirect();
    $this->assertDatabaseMissing('users', [
        'id' => $student->id,
    ]);
});

test('admin cannot delete student with active loans', function () {
    $book = Book::factory()->create([
        'category_id' => $this->category->id,
        'stock' => 5,
        'total_stock' => 5,
    ]);

    Loan::factory()->create([
        'user_id' => $this->student->id,
        'book_id' => $book->id,
        'status' => LoanStatus::DIPINJAM,
    ]);

    $response = $this->actingAs($this->admin)
        ->from(route('admin.students.index'))
        ->delete(route('admin.students.destroy', $this->student));

    $response->assertRedirect(route('admin.students.index'))
        ->assertSessionHas('error', 'Siswa tidak dapat dihapus karena masih memiliki pinjaman aktif.');

    $this->assertDatabaseHas('users', [
        'id' => $this->student->id,
    ]);
});

test('admin can view loan circulation table with filters and status counts', function () {
    $book = Book::factory()->create([
        'category_id' => $this->category->id,
    ]);

    Loan::factory()->create([
        'user_id' => $this->student->id,
        'book_id' => $book->id,
        'status' => LoanStatus::DIPROSES,
        'loan_code' => 'PJ-99001',
    ]);

    $response = $this->actingAs($this->admin)
        ->get(route('admin.loans.index'));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/loans/index')
            ->has('loans.data', 1)
            ->has('filters')
            ->has('statusCounts')
        );
});

test('admin approve loan changes status to dipinjam and resets due date', function () {
    $book = Book::factory()->create([
        'category_id' => $this->category->id,
        'stock' => 4,
    ]);

    $loan = Loan::factory()->create([
        'user_id' => $this->student->id,
        'book_id' => $book->id,
        'status' => LoanStatus::DIPROSES,
        'loan_date' => now()->subDays(2),
        'due_date' => now()->subDays(1),
    ]);

    $response = $this->actingAs($this->admin)
        ->post(route('admin.loans.approve', $loan));

    $response->assertRedirect();

    $loan->refresh();
    expect($loan->status)->toBe(LoanStatus::DIPINJAM)
        ->and($loan->loan_date->toDateString())->toBe(now()->toDateString())
        ->and($loan->due_date->toDateString())->toBe(now()->addDays($this->setting->loan_duration_days)->toDateString());
});

test('admin reject loan restocks book and sets status to ditolak', function () {
    $book = Book::factory()->create([
        'category_id' => $this->category->id,
        'stock' => 2,
    ]);

    $loan = Loan::factory()->create([
        'user_id' => $this->student->id,
        'book_id' => $book->id,
        'status' => LoanStatus::DIPROSES,
    ]);

    $response = $this->actingAs($this->admin)
        ->post(route('admin.loans.reject', $loan), [
            'admin_notes' => 'Buku sedang dalam perbaikan fisik.',
        ]);

    $response->assertRedirect();

    $loan->refresh();
    $book->refresh();

    expect($loan->status)->toBe(LoanStatus::DITOLAK)
        ->and($loan->admin_notes)->toBe('Buku sedang dalam perbaikan fisik.')
        ->and($book->stock)->toBe(3);
});

test('admin return on-time loan sets status to selesai, fine 0, and restocks book', function () {
    $book = Book::factory()->create([
        'category_id' => $this->category->id,
        'stock' => 1,
    ]);

    $loan = Loan::factory()->create([
        'user_id' => $this->student->id,
        'book_id' => $book->id,
        'status' => LoanStatus::DIPINJAM,
        'loan_date' => now()->subDays(3),
        'due_date' => now()->addDays(4),
        'fine_amount' => 0,
    ]);

    $response = $this->actingAs($this->admin)
        ->post(route('admin.loans.return', $loan));

    $response->assertRedirect();

    $loan->refresh();
    $book->refresh();

    expect($loan->status)->toBe(LoanStatus::SELESAI)
        ->and((int) $loan->fine_amount)->toBe(0)
        ->and($loan->return_date->toDateString())->toBe(now()->toDateString())
        ->and($book->stock)->toBe(2);
});

test('admin return late loan calculates correct fine, sets status selesai, and restocks book', function () {
    $book = Book::factory()->create([
        'category_id' => $this->category->id,
        'stock' => 0,
    ]);

    // Late by 3 days
    $loan = Loan::factory()->create([
        'user_id' => $this->student->id,
        'book_id' => $book->id,
        'status' => LoanStatus::TERLAMBAT,
        'loan_date' => now()->subDays(10),
        'due_date' => now()->subDays(3),
        'fine_amount' => 0,
    ]);

    $response = $this->actingAs($this->admin)
        ->post(route('admin.loans.return', $loan));

    $response->assertRedirect();

    $loan->refresh();
    $book->refresh();

    // 3 days * 1000 = 3000
    expect($loan->status)->toBe(LoanStatus::SELESAI)
        ->and((int) $loan->fine_amount)->toBe(3000)
        ->and($loan->return_date->toDateString())->toBe(now()->toDateString())
        ->and($book->stock)->toBe(1);
});
