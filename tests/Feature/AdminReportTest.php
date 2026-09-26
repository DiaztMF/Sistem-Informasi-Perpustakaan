<?php

use App\Enums\LoanStatus;
use App\Enums\Role;
use App\Models\Book;
use App\Models\Category;
use App\Models\LibrarySetting;
use App\Models\Loan;
use App\Models\User;
use Illuminate\Support\Carbon;

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
        'name' => 'Teknologi',
        'slug' => 'teknologi',
    ]);

    $this->book = Book::factory()->create([
        'title' => 'Pemrograman Web Modern',
        'category_id' => $this->category->id,
        'stock' => 10,
    ]);

    $this->setting = LibrarySetting::updateOrCreate(
        ['id' => 1],
        [
            'name' => 'Perpustakaan SMK Bunga Bangsa',
            'address' => 'Jl. Pendidikan No. 45',
            'open_hours' => 'Senin - Jumat, 08:00 - 15:00',
            'contact_phone' => '081234567890',
            'contact_email' => 'perpus@smkbungabangsa.sch.id',
            'rules_text' => 'Tata tertib perpustakaan...',
            'loan_duration_days' => 7,
            'fine_per_day' => 1000,
            'max_active_loans' => 2,
        ]
    );
});

test('admin can view report page', function () {
    Loan::factory()->create([
        'user_id' => $this->student->id,
        'book_id' => $this->book->id,
        'loan_code' => 'PINJAM-20260101-0001',
        'loan_date' => Carbon::now()->subDays(5),
        'due_date' => Carbon::now()->addDays(2),
        'status' => LoanStatus::DIPINJAM,
    ]);

    $response = $this->actingAs($this->admin)->get(route('admin.reports.index'));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/reports/index')
            ->has('loans')
            ->has('summary')
            ->has('categories')
            ->has('filters')
            ->where('summary.totalLoans', 1)
        );
});

test('report filters by date range and status correctly', function () {
    $matchingLoan = Loan::factory()->create([
        'user_id' => $this->student->id,
        'book_id' => $this->book->id,
        'loan_code' => 'MATCH-001',
        'loan_date' => '2026-03-10',
        'due_date' => '2026-03-17',
        'return_date' => '2026-03-16',
        'status' => LoanStatus::SELESAI,
        'fine_amount' => 0,
    ]);

    $nonMatchingStatus = Loan::factory()->create([
        'user_id' => $this->student->id,
        'book_id' => $this->book->id,
        'loan_code' => 'DIFF-STATUS',
        'loan_date' => '2026-03-10',
        'due_date' => '2026-03-17',
        'status' => LoanStatus::DIPINJAM,
    ]);

    $outsideDate = Loan::factory()->create([
        'user_id' => $this->student->id,
        'book_id' => $this->book->id,
        'loan_code' => 'OUTSIDE-DATE',
        'loan_date' => '2026-01-01',
        'due_date' => '2026-01-08',
        'return_date' => '2026-01-07',
        'status' => LoanStatus::SELESAI,
    ]);

    $response = $this->actingAs($this->admin)->get(route('admin.reports.index', [
        'start_date' => '2026-03-01',
        'end_date' => '2026-03-31',
        'status' => LoanStatus::SELESAI->value,
    ]));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/reports/index')
            ->where('summary.totalLoans', 1)
            ->where('summary.totalCompleted', 1)
            ->has('loans', 1)
            ->where('loans.0.loan_code', 'MATCH-001')
        );
});

test('admin can download CSV report with correct headers and status 200', function () {
    Loan::factory()->create([
        'user_id' => $this->student->id,
        'book_id' => $this->book->id,
        'loan_code' => 'PINJAM-CSV-001',
        'loan_date' => '2026-03-01',
        'due_date' => '2026-03-08',
        'return_date' => '2026-03-10',
        'status' => LoanStatus::SELESAI,
        'fine_amount' => 2000,
    ]);

    $response = $this->actingAs($this->admin)->get(route('admin.reports.export'));

    $response->assertOk();
    $response->assertHeader('content-type', 'text/csv; charset=UTF-8');
    
    $disposition = $response->headers->get('content-disposition');
    expect($disposition)->toContain('laporan-peminjaman-perpustakaan-');
    expect($disposition)->toContain('.csv');

    $content = $response->streamedContent();
    expect($content)->toStartWith("\xEF\xBB\xBF");
    expect($content)->toContain('Kode Pinjam');
    expect($content)->toContain('Nama Siswa');
    expect($content)->toContain('NIS');
    expect($content)->toContain('Judul Buku');
    expect($content)->toContain('Kategori');
    expect($content)->toContain('Tgl Pinjam');
    expect($content)->toContain('Tgl Kembali');
    expect($content)->toContain('Status');
    expect($content)->toContain('Denda (Rp)');
    expect($content)->toContain('PINJAM-CSV-001');
    expect($content)->toContain($this->student->name);
    expect($content)->toContain($this->student->nis);
    expect($content)->toContain($this->book->title);
});

test('admin can view and update library settings', function () {
    $indexResponse = $this->actingAs($this->admin)->get(route('admin.settings.index'));

    $indexResponse->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/settings/index')
            ->has('settings')
            ->where('settings.name', 'Perpustakaan SMK Bunga Bangsa')
        );

    $updateResponse = $this->actingAs($this->admin)->put(route('admin.settings.update'), [
        'name' => 'Perpustakaan Pusat SMK Hebat',
        'address' => 'Jl. Merdeka No. 100',
        'open_hours' => 'Senin - Sabtu, 07:30 - 16:00',
        'contact_phone' => '08987654321',
        'contact_email' => 'perpustakaan@smkhebat.sch.id',
        'rules_text' => '1. Wajib menjaga ketenangan.\n2. Mengembalikan buku tepat waktu.',
        'loan_duration_days' => 14,
        'fine_per_day' => 2000,
        'max_active_loans' => 4,
    ]);

    $updateResponse->assertRedirect();
    $updateResponse->assertSessionHas('success', 'Pengaturan perpustakaan berhasil diperbarui.');

    $this->assertDatabaseHas('library_settings', [
        'name' => 'Perpustakaan Pusat SMK Hebat',
        'loan_duration_days' => 14,
        'fine_per_day' => 2000,
        'max_active_loans' => 4,
    ]);
});

test('library settings update affects loan rules', function () {
    $this->actingAs($this->admin)->put(route('admin.settings.update'), [
        'name' => 'Perpustakaan Baru',
        'address' => 'Jl. Anyar No. 1',
        'open_hours' => '08:00 - 15:00',
        'contact_phone' => '0811111111',
        'contact_email' => 'info@perpus.sch.id',
        'rules_text' => 'Aturan baru',
        'loan_duration_days' => 10,
        'fine_per_day' => 1500,
        'max_active_loans' => 1,
    ]);

    // First loan application
    Loan::factory()->create([
        'user_id' => $this->student->id,
        'book_id' => $this->book->id,
        'status' => LoanStatus::DIPINJAM,
    ]);

    $secondBook = Book::factory()->create(['stock' => 5]);

    // Student attempts second loan with max_active_loans set to 1
    $response = $this->actingAs($this->student)->post(route('loans.store', $secondBook->slug), [
        'notes' => 'Mau pinjam lagi',
    ]);

    $response->assertSessionHasErrors('loan');
});
