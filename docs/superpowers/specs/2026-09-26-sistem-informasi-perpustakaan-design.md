# Design Spec: Sistem Informasi Perpustakaan Sekolah

**Tanggal:** 2026-09-26  
**Status:** Approved by User  
**Path:** `docs/superpowers/specs/2026-09-26-sistem-informasi-perpustakaan-design.md`

---

## 1. Ringkasan Eksekutif & Tujuan

Sistem Informasi Perpustakaan Sekolah adalah aplikasi berbasis web yang menyediakan dua peran pengguna: **Siswa** dan **Admin/Petugas**. Aplikasi bertujuan mempermudah siswa mengeksplorasi koleksi literatur sekolah dan melakukan peminjaman secara mandiri, sekaligus menyediakan kontrol inventaris, pencatatan sirkulasi buku, serta pembuatan laporan bagi admin perpustakaan.

---

## 2. Arsitektur & Teknologi

* **Backend Framework:** Laravel 12 (PHP 8.3+)
* **Frontend Framework:** Inertia.js React 19 + TypeScript
* **Styling & UI Kit:** Tailwind CSS v4 + Radix UI / Shadcn UI components + Lucide Icons
* **Database & ORM:** SQLite (development default) / PostgreSQL ready via Eloquent
* **Otentikasi:** Laravel Fortify (Session-based auth dengan modifikasi multi-identifier login)
* **Testing:** Pest PHP 5 (Feature & Unit tests)

---

## 3. Skema Basis Data & Model

### 3.1 Tabel `users`
* `id`: BigIncrements (Primary Key)
* `name`: String (Nama lengkap)
* `email`: String (Unique)
* `nis`: String (Unique, Nullable - wajib untuk role `siswa`)
* `role`: Enum (`admin`, `siswa`) - default `siswa`
* `class_name`: String (Nullable, contoh: "XII RPL 1")
* `phone`: String (Nullable)
* `password`: String (Hashed)
* `remember_token`: String (Nullable)
* `timestamps`

### 3.2 Tabel `categories`
* `id`: BigIncrements (Primary Key)
* `name`: String (Contoh: Fiksi, Nonfiksi, Sains, Sejarah)
* `slug`: String (Unique)
* `description`: Text (Nullable)
* `timestamps`

### 3.3 Tabel `books`
* `id`: BigIncrements (Primary Key)
* `category_id`: Foreign Key (`categories.id`, onDelete cascade/restrict)
* `title`: String
* `slug`: String (Unique)
* `author`: String
* `publisher`: String
* `publish_year`: Integer / Year
* `isbn`: String (Unique, Nullable)
* `stock`: Integer (Stok tersedia saat ini)
* `total_stock`: Integer (Total inventaris fisik)
* `synopsis`: Text (Nullable)
* `cover_image`: String (Nullable - path file di `storage/covers`)
* `timestamps`

### 3.4 Tabel `loans`
* `id`: BigIncrements (Primary Key)
* `loan_code`: String (Unique, contoh: `PINJAM-202609-0001`)
* `user_id`: Foreign Key (`users.id`, onDelete cascade)
* `book_id`: Foreign Key (`books.id`, onDelete cascade)
* `loan_date`: Date (Tanggal pengajuan / pengambilan)
* `due_date`: Date (Jatuh tempo pengembalian, default +7 hari)
* `return_date`: Date (Nullable - tanggal aktual pengembalian)
* `status`: Enum (`diproses`, `dipinjam`, `selesai`, `ditolak`, `terlambat`)
* `notes`: Text (Catatan pengajuan siswa, nullable)
* `admin_notes`: Text (Catatan petugas, nullable)
* `fine_amount`: Decimal / Integer (Akumulasi denda keterlambatan dalam Rupiah)
* `timestamps`

### 3.5 Tabel `library_settings`
* `id`: BigIncrements
* `name`: String (Nama perpustakaan)
* `address`: Text
* `open_hours`: String (Jadwal operasional)
* `contact_phone`: String
* `contact_email`: String
* `rules_text`: Text (Tata tertib perpustakaan)
* `loan_duration_days`: Integer (Default: 7 hari)
* `fine_per_day`: Integer (Default: Rp 1.000)
* `max_active_loans`: Integer (Default: 2 buku)
* `timestamps`

---

## 4. Otorisasi & Logika Bisnis

### 4.1 Multi-Identifier Login
* Form login menerima `identifier` (Email atau NIS) dan `password`.
* Backend mendeteksi format: jika valid email gunakan field `email`, jika alfanumerik/angka gunakan field `nis`.
* Role routing pasca login:
  * Role `admin` diarahkan ke `/admin/dashboard`.
  * Role `siswa` diarahkan ke `/katalog` atau `/`.

### 4.2 Siklus Hidup Peminjaman (Loan Lifecycle)
1. **Pengajuan Siswa:**
   * Validasi: Buku memiliki `stock > 0`.
   * Validasi: Siswa memiliki jumlah pinjaman aktif (`diproses` + `dipinjam` + `terlambat`) < `max_active_loans` (maks 2).
   * Status baru: `diproses`.
   * Efek stok: `books.stock` berkurang 1 secara atomik (DB Transaction).
2. **Persetujuan / Penyerahan Buku oleh Admin:**
   * Admin menekan tombol "Serahkan Buku".
   * Status berubah menjadi `dipinjam`.
   * Tanggal `loan_date` dicatat hari penyerahan, `due_date` diset `+loan_duration_days`.
3. **Penolakan Pengajuan oleh Admin:**
   * Admin mengisi alasan penolakan.
   * Status berubah menjadi `ditolak`.
   * Efek stok: `books.stock` dikembalikan bertambah 1.
4. **Pengembalian Buku:**
   * Admin menekan tombol "Proses Pengembalian".
   * Tanggal `return_date` diset ke hari ini.
   * Cek keterlambatan: jika `return_date > due_date`, hitung selisih hari:
     $$\text{Denda} = (\text{return\_date} - \text{due\_date}) \times \text{fine\_per\_day}$$
   * Status berubah menjadi `selesai`.
   * Nilai `fine_amount` disimpan.
   * Efek stok: `books.stock` bertambah 1.

---

## 5. Rincian Tampilan & Rute (UI/UX)

### 5.1 Portal Siswa (`StudentLayout`)
* Navigasi atas sederhana: Brand Logo, Link `Beranda`, `Katalog`, `Informasi`, Profil/Login CTA.
* `/` — **Beranda:**
  * Hero search bar terintegrasi dengan filter cepat.
  * Kartu statistik ringkas (Koleksi, Kategori, Anggota, Buku Dipinjam).
  * Baris Buku Populer dan Buku Terbaru.
* `/katalog` — **Katalog Buku:**
  * Sidebar filter kategori & status ketersediaan.
  * Grid buku dengan kartu cover rasio 3:4, badge status ketersediaan (*Tersedia* / *Habis*), tombol "Lihat Detail".
* `/buku/{slug}` — **Detail Buku:**
  * Informasi bibliografi buku lengkap, sinopsis, status stok.
  * Tombol modal "Ajukan Peminjaman" dengan konfirmasi tanggal dan catatan.
* `/riwayat` — **Riwayat Peminjaman Siswa:**
  * Tab "Sedang Dipinjam" dan "Riwayat Selesai".
  * Detail kode pinjam, tanggal tempo, status, dan denda (jika ada).
* `/informasi` — **Informasi Perpustakaan:**
  * Tampilan jam buka, alamat, kontak, dan daftar tata tertib perpustakaan.

### 5.2 Dashboard Admin (`AdminLayout`)
* Sidebar admin collapsible dengan struktur menu: Dashboard, Data Buku, Data Siswa, Data Peminjaman, Laporan, Pengaturan.
* `/admin/dashboard` — Metrik total, chart tren peminjaman mingguan, tabel butuh konfirmasi.
* `/admin/buku` — CRUD Data Buku, upload cover, kelola kategori.
* `/admin/siswa` — CRUD Siswa (NIS, Nama, Kelas, Email, reset password default).
* `/admin/peminjaman` — Manajemen transaksi sirkulasi (Filter status: *Semua*, *Diproses*, *Dipinjam*, *Terlambat*, *Selesai*).
* `/admin/laporan` — Filter periode transaksi, statistik denda & peminjaman terpopuler, tombol cetak A4 & download Excel/CSV.
* `/admin/pengaturan` — Form konfigurasi perpustakaan, durasi pinjam, tarif denda.

---

## 6. Rencana Pengujian (Testing Strategy)

* **Otentikasi:** Login via NIS dan Email berhasil; role redirection sesuai.
* **Loan Constraints:** Siswa tidak dapat meminjam jika stok 0 atau telah mencapai batas 2 buku aktif.
* **Stock Atomic Consistency:** Perubahan stok buku konsisten saat status berpindah ke `diproses`, `ditolak`, dan `selesai`.
* **Fine Calculation:** Perhitungan hari telat dikalikan tarif denda tepat.
