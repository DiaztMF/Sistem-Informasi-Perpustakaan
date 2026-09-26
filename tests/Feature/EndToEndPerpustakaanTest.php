<?php

use App\Enums\LoanStatus;
use App\Enums\Role;
use App\Models\Book;
use App\Models\Category;
use App\Models\LibrarySetting;
use App\Models\Loan;
use App\Models\User;
use Database\Seeders\PerpustakaanSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;

uses(RefreshDatabase::class);

test('full end-to-end journey of sistem informasi perpustakaan', function () {
    // Seed initial master data: settings, users, categories, books
    $this->seed(PerpustakaanSeeder::class);

    // 1. Guest visits home `/` and catalog `/katalog`
    $homeResponse = $this->get('/');
    $homeResponse->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('student/home')
            ->has('popularBooks')
            ->has('latestBooks')
            ->has('stats')
        );

    $catalogResponse = $this->get('/katalog');
    $catalogResponse->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('student/catalog')
            ->has('books.data')
            ->has('categories')
        );

    // 2. Siswa logs in with NIS `2026001` and password `password`
    $loginResponse = $this->post('/login', [
        'email' => '2026001',
        'password' => 'password',
    ]);

    $loginResponse->assertRedirect();
    $siswa = User::where('nis', '2026001')->firstOrFail();
    $this->assertAuthenticatedAs($siswa);

    // Clear existing sample loans for Andi so active loan count is 0
    Loan::where('user_id', $siswa->id)->delete();

    // 3. Siswa views book detail and submits borrow request for "Laut Bercerita"
    $book = Book::where('slug', 'laut-bercerita')->firstOrFail();
    expect($book->stock)->toBe(5);

    $detailResponse = $this->actingAs($siswa)->get('/buku/laut-bercerita');
    $detailResponse->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('student/book-detail')
            ->where('book.title', 'Laut Bercerita')
        );

    $borrowResponse = $this->actingAs($siswa)->post('/peminjaman/laut-bercerita', [
        'notes' => 'Peminjaman untuk tugas literasi novel.',
    ]);
    $borrowResponse->assertRedirect(route('loans.history'));

    // 4. Book stock decrements from 5 to 4
    $book->refresh();
    expect($book->stock)->toBe(4);

    // 5. Siswa views history `/riwayat` with status `diproses`
    $historyResponse = $this->actingAs($siswa)->get('/riwayat');
    $historyResponse->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('student/loan-history')
            ->has('activeLoans', 1)
            ->where('activeLoans.0.book.title', 'Laut Bercerita')
            ->where('activeLoans.0.status', LoanStatus::DIPROSES->value)
        );

    $loan = Loan::where('user_id', $siswa->id)
        ->where('book_id', $book->id)
        ->latest('id')
        ->firstOrFail();
    expect($loan->status)->toBe(LoanStatus::DIPROSES);

    // 6. Siswa logs out
    $logoutResponse = $this->actingAs($siswa)->post('/logout');
    $logoutResponse->assertRedirect();
    $this->assertGuest();

    // 7. Admin logs in with `admin@perpustakaan.sch.id`
    $adminLoginResponse = $this->post('/login', [
        'email' => 'admin@perpustakaan.sch.id',
        'password' => 'password',
    ]);
    $adminLoginResponse->assertRedirect();
    $admin = User::where('email', 'admin@perpustakaan.sch.id')->firstOrFail();
    $this->assertAuthenticatedAs($admin);

    // 8. Admin views `/admin/peminjaman`, sees loan, and clicks approve (`/admin/peminjaman/{loan}/setujui`)
    $adminLoansResponse = $this->actingAs($admin)->get('/admin/peminjaman');
    $adminLoansResponse->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/loans/index')
            ->has('loans.data')
        );

    $approveResponse = $this->actingAs($admin)->post("/admin/peminjaman/{$loan->id}/setujui");
    $approveResponse->assertRedirect();

    // 9. Loan status changes to `dipinjam`
    $loan->refresh();
    expect($loan->status)->toBe(LoanStatus::DIPINJAM);

    // 10. Loan becomes overdue: simulate due date in past, Admin returns book (`/admin/peminjaman/{loan}/kembali`)
    // Set due_date to 3 days ago: fine_per_day is 1000, so fine should be 3 * 1000 = 3000
    $loan->update([
        'loan_date' => Carbon::now()->subDays(10)->toDateString(),
        'due_date' => Carbon::now()->subDays(3)->toDateString(),
        'status' => LoanStatus::TERLAMBAT,
    ]);

    $returnResponse = $this->actingAs($admin)->post("/admin/peminjaman/{$loan->id}/kembali");
    $returnResponse->assertRedirect();

    // 11. Loan status changes to `selesai`, fine is calculated, and book stock increments back to 5
    $loan->refresh();
    $book->refresh();

    expect($loan->status)->toBe(LoanStatus::SELESAI)
        ->and((int) $loan->fine_amount)->toBe(3000)
        ->and($loan->return_date->toDateString())->toBe(Carbon::now()->toDateString())
        ->and($book->stock)->toBe(5);

    // 12. Admin views report `/admin/laporan` and downloads CSV export
    $reportResponse = $this->actingAs($admin)->get('/admin/laporan');
    $reportResponse->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/reports/index')
            ->has('loans')
            ->has('summary')
            ->has('categories')
            ->has('filters')
        );

    $exportResponse = $this->actingAs($admin)->get('/admin/laporan/export-csv');
    $exportResponse->assertOk()
        ->assertHeader('content-type', 'text/csv; charset=UTF-8')
        ->assertStreamed();

    $csvContent = $exportResponse->streamedContent();
    expect($csvContent)->toContain('Kode Pinjam')
        ->and($csvContent)->toContain($loan->loan_code)
        ->and($csvContent)->toContain('Laut Bercerita')
        ->and($csvContent)->toContain('Andi Saputra');
});
