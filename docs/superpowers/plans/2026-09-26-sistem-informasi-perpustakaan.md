# Sistem Informasi Perpustakaan Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun aplikasi web Sistem Informasi Perpustakaan Sekolah lengkap dengan dua role (Siswa & Admin), mencakup katalog, peminjaman online, sirkulasi buku, denda otomatis, dan pelaporan cetak/export.

**Architecture:** Laravel 12 + Inertia React 19 dengan pembagian dua layout (`StudentLayout` & `AdminLayout`). Autentikasi multi-identifier (NIS/Email) dengan Laravel Fortify, otorisasi role-based middleware, serta manajemen sirkulasi buku atomik via Eloquent transactions.

**Tech Stack:** Laravel 12, PHP 8.3+, Inertia.js React 19, TypeScript, Tailwind CSS v4, Radix UI / Shadcn UI, Pest PHP 5.

## Global Constraints
- Bahasa antarmuka: Bahasa Indonesia.
- Durasi default peminjaman: 7 hari.
- Kuota aktif peminjaman siswa: Maksimal 2 buku.
- Tarif denda per hari telat: Rp 1.000.
- Tidak ada hardcoded status string: gunakan Enum `App\Enums\Role` dan `App\Enums\LoanStatus`.

---

### Task 1: Enums & Database Migrations

**Files:**
- Create: `app/Enums/Role.php`
- Create: `app/Enums/LoanStatus.php`
- Create: `database/migrations/2026_09_26_000001_update_users_table_add_perpustakaan_fields.php`
- Create: `database/migrations/2026_09_26_000002_create_categories_table.php`
- Create: `database/migrations/2026_09_26_000003_create_books_table.php`
- Create: `database/migrations/2026_09_26_000004_create_loans_table.php`
- Create: `database/migrations/2026_09_26_000005_create_library_settings_table.php`
- Test: `tests/Feature/DatabaseMigrationTest.php`

**Interfaces:**
- Produces: `App\Enums\Role` (`ADMIN = 'admin'`, `SISWA = 'siswa'`), `App\Enums\LoanStatus` (`DIPROSES = 'diproses'`, `DIPINJAM = 'dipinjam'`, `SELESAI = 'selesai'`, `DITOLAK = 'ditolak'`, `TERLAMBAT = 'terlambat'`)

- [ ] **Step 1: Write failing test for migrations and enums**
- [ ] **Step 2: Run test to verify it fails (`php artisan test --filter DatabaseMigrationTest`)**
- [ ] **Step 3: Implement Enums and Migration files**
- [ ] **Step 4: Run migration and test (`php artisan migrate && php artisan test --filter DatabaseMigrationTest`)**
- [ ] **Step 5: Commit changes**

---

### Task 2: Models, Relationships, & Database Seeders

**Files:**
- Modify: `app/Models/User.php`
- Create: `app/Models/Category.php`
- Create: `app/Models/Book.php`
- Create: `app/Models/Loan.php`
- Create: `app/Models/LibrarySetting.php`
- Create: `database/seeders/PerpustakaanSeeder.php`
- Test: `tests/Feature/PerpustakaanModelTest.php`

**Interfaces:**
- Consumes: `App\Enums\Role`, `App\Enums\LoanStatus`
- Produces: Eloquent Models with relations (`User::loans()`, `Book::category()`, `Book::loans()`, `Loan::user()`, `Loan::book()`, `Book::isAvailable()`)

- [ ] **Step 1: Write failing test for models and relationships**
- [ ] **Step 2: Run test to verify failure**
- [ ] **Step 3: Implement Models, Relations, & Seeder**
- [ ] **Step 4: Seed database & verify tests pass (`php artisan db:seed --class=PerpustakaanSeeder && php artisan test --filter PerpustakaanModelTest`)**
- [ ] **Step 5: Commit changes**

---

### Task 3: Multi-Identifier Authentication & Role Middleware

**Files:**
- Create: `app/Http/Middleware/EnsureUserHasRole.php`
- Modify: `bootstrap/app.php` (register alias `role`)
- Modify: `app/Providers/FortifyServiceProvider.php` (custom login check: NIS vs Email)
- Test: `tests/Feature/MultiIdentifierAuthTest.php`

**Interfaces:**
- Consumes: `User`, `Role`
- Produces: Multi-identifier login handler, `role:admin`, `role:siswa` route middleware

- [ ] **Step 1: Write failing test for login with Email and NIS, plus role gate**
- [ ] **Step 2: Run test to verify failure**
- [ ] **Step 3: Implement Fortify login callback and role middleware**
- [ ] **Step 4: Run tests to verify pass (`php artisan test --filter MultiIdentifierAuthTest`)**
- [ ] **Step 5: Commit changes**

---

### Task 4: Student Portal - Public & Catalog Pages (Backend & Frontend)

**Files:**
- Create: `app/Http/Controllers/Student/HomeController.php`
- Create: `app/Http/Controllers/Student/CatalogController.php`
- Create: `resources/js/layouts/student-layout.tsx`
- Create: `resources/js/pages/student/home.tsx`
- Create: `resources/js/pages/student/catalog.tsx`
- Create: `resources/js/pages/student/book-detail.tsx`
- Create: `resources/js/pages/student/information.tsx`
- Modify: `routes/web.php`
- Test: `tests/Feature/StudentCatalogTest.php`

**Interfaces:**
- Consumes: `Book`, `Category`, `LibrarySetting`
- Produces: Routes `/`, `/katalog`, `/buku/{slug}`, `/informasi`

- [ ] **Step 1: Write failing feature test for student catalog endpoints**
- [ ] **Step 2: Run test to verify failure**
- [ ] **Step 3: Implement Controllers, Routes, and Student React Pages**
- [ ] **Step 4: Run test to verify pass**
- [ ] **Step 5: Commit changes**

---

### Task 5: Student Loan Lifecycle & Loan History

**Files:**
- Create: `app/Http/Controllers/Student/LoanController.php`
- Create: `app/Http/Requests/StoreLoanRequest.php`
- Create: `resources/js/pages/student/loan-history.tsx`
- Modify: `resources/js/pages/student/book-detail.tsx` (connect loan modal / action)
- Modify: `routes/web.php`
- Test: `tests/Feature/StudentLoanTest.php`

**Interfaces:**
- Consumes: `Loan`, `Book`, `LoanStatus`
- Produces: `POST /peminjaman/{book:slug}`, `GET /riwayat`

- [ ] **Step 1: Write failing test for loan creation, active loan limit (max 2), and stock decrement**
- [ ] **Step 2: Run test to verify failure**
- [ ] **Step 3: Implement LoanController with atomic transactions and validation**
- [ ] **Step 4: Run test to verify pass**
- [ ] **Step 5: Commit changes**

---

### Task 6: Admin Dashboard & Book Management

**Files:**
- Create: `app/Http/Controllers/Admin/DashboardController.php`
- Create: `app/Http/Controllers/Admin/BookController.php`
- Create: `app/Http/Controllers/Admin/CategoryController.php`
- Create: `resources/js/layouts/admin-layout.tsx`
- Create: `resources/js/pages/admin/dashboard.tsx`
- Create: `resources/js/pages/admin/books/index.tsx`
- Create: `resources/js/pages/admin/books/form.tsx`
- Modify: `routes/web.php`
- Test: `tests/Feature/AdminBookManagementTest.php`

**Interfaces:**
- Consumes: `Book`, `Category`, `Loan`, `Role`
- Produces: CRUD endpoints under `/admin/buku`, `/admin/kategori`, dashboard metrics at `/admin/dashboard`

- [ ] **Step 1: Write failing test for admin book CRUD & role protection**
- [ ] **Step 2: Run test to verify failure**
- [ ] **Step 3: Implement Admin Controllers, Request validations, and React views**
- [ ] **Step 4: Run test to verify pass**
- [ ] **Step 5: Commit changes**

---

### Task 7: Admin Student Management & Circulation (Loan/Return/Fine)

**Files:**
- Create: `app/Http/Controllers/Admin/StudentController.php`
- Create: `app/Http/Controllers/Admin/LoanManagementController.php`
- Create: `resources/js/pages/admin/students/index.tsx`
- Create: `resources/js/pages/admin/loans/index.tsx`
- Modify: `routes/web.php`
- Test: `tests/Feature/AdminCirculationTest.php`

**Interfaces:**
- Consumes: `Loan`, `User`, `Book`, `LoanStatus`
- Produces: Admin approve/return/reject actions, automatic fine calculation

- [ ] **Step 1: Write failing test for approving loans, returning books with overdue fines, and restock**
- [ ] **Step 2: Run test to verify failure**
- [ ] **Step 3: Implement Student & Loan Circulation Controllers and React UI**
- [ ] **Step 4: Run test to verify pass**
- [ ] **Step 5: Commit changes**

---

### Task 8: Admin Reports & Library Settings

**Files:**
- Create: `app/Http/Controllers/Admin/ReportController.php`
- Create: `app/Http/Controllers/Admin/SettingController.php`
- Create: `resources/js/pages/admin/reports/index.tsx`
- Create: `resources/js/pages/admin/settings/index.tsx`
- Modify: `routes/web.php`
- Test: `tests/Feature/AdminReportTest.php`

**Interfaces:**
- Consumes: `Loan`, `Book`, `LibrarySetting`
- Produces: Filterable report page with print-ready view, CSV export endpoint, settings updater

- [ ] **Step 1: Write failing test for report filtering, CSV export, and settings update**
- [ ] **Step 2: Run test to verify failure**
- [ ] **Step 3: Implement ReportController, SettingController, and React UI**
- [ ] **Step 4: Run test to verify pass**
- [ ] **Step 5: Commit changes**

---

### Task 9: Visual Polish, Seed Data, & Full End-to-End Verification

**Files:**
- Modify: `resources/js/pages/auth/login.tsx` (customize with School Library brand & NIS/Email hint)
- Modify: `database/seeders/DatabaseSeeder.php`
- Test: `tests/Feature/EndToEndPerpustakaanTest.php`

**Interfaces:**
- Verify complete flow: Admin setup -> Student browse -> Student borrow -> Admin approve -> Admin return with fine -> Report generated.

- [ ] **Step 1: Write end-to-end integration test covering the entire user journey**
- [ ] **Step 2: Polish UI/UX, responsive views, styling, and notifications**
- [ ] **Step 3: Run complete test suite and TypeScript check (`php artisan test && npm run types:check`)**
- [ ] **Step 4: Commit changes**
