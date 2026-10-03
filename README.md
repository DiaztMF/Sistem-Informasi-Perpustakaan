# Sistem Informasi Perpustakaan Sekolah

Sistem informasi manajemen perpustakaan modern berbasis web untuk sekolah, mendukung katalog interaktif, pengajuan peminjaman daring oleh siswa, dan panel manajemen perpustakaan lengkap untuk admin.

![PHP Version](https://img.shields.io/badge/PHP-8.4%2B-777BB4?logo=php&logoColor=white)
![Laravel](https://img.shields.io/badge/Laravel-13.x-FF2D20?logo=laravel&logoColor=white)
![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=black)
![Inertia.js](https://img.shields.io/badge/Inertia.js-v3-9553E9?logo=inertia&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.svg)

---

## Daftar Isi
- [Tentang Aplikasi (What)](#tentang-aplikasi-what)
- [Mengapa Aplikasi Ini Dibuat (Why)](#mengapa-aplikasi-ini-dibuat-why)
- [Fitur Utama](#fitur-utama)
- [Prasyarat Sistem](#prasyarat-sistem)
- [Langkah Instalasi Lengkap](#langkah-instalasi-lengkap)
- [Cara Menjalankan Aplikasi](#cara-menjalankan-aplikasi)
- [Akun Bawaan (Default Credentials)](#akun-bawaan-default-credentials)
- [Rute & Endpoint Utama](#rute--endpoint-utama)
- [Arsitektur & Panduan Pengembang](#arsitektur--panduan-pengembang)
- [Lisensi](#lisensi)

---

## Tentang Aplikasi (What)

Sistem Informasi Perpustakaan adalah aplikasi web terpadu yang memadukan keandalan backend Laravel 13 dengan performa single-page application (SPA) menggunakan Inertia.js v3 dan React 19. Aplikasi ini mengotomatiskan siklus sirkulasi buku sekolah mulai dari pencarian katalog, pengajuan peminjaman mandiri oleh siswa, validasi dan approval oleh pustakawan, hingga perhitungan keterlambatan dan denda pengembalian.

---

## Mengapa Aplikasi Ini Dibuat (Why)

Pencatatan sirkulasi perpustakaan secara manual sering kali menimbulkan kendala:
1. **Antrean Peminjaman:** Siswa dan pustakawan kesulitan memeriksa ketersediaan stok buku fisik secara cepat.
2. **Keterlambatan Tidak Terpantau:** Perhitungan denda dan tanggal tenggat buku rawan keliru jika dihitung manual.
3. **Laporan Kurang Akurat:** Rekapitulasi sirkulasi bulanan membutuhkan waktu lama.

Aplikasi ini hadir untuk memberikan visibilitas stok buku secara langsung (real-time), mempermudah siswa mengajukan peminjaman dari perangkat apa pun, serta menyediakan dashboard analitik sirkulasi dan ekspor laporan yang siap pakai bagi pengelola perpustakaan.

---

## Fitur Utama

### Sisi Siswa / Pengguna Publik
- **Katalog & Detail Buku:** Cari buku berdasarkan judul, pengarang, ISBN, atau kategori secara cepat.
- **Peminjaman Mandiri:** Ajukan permohonan pinjam buku langsung dari katalog (khusus siswa login).
- **Riwayat & Status Pinjaman:** Pantau status peminjaman (`Menunggu`, `Disetujui`, `Ditolak`, `Kembali`, atau `Terlambat`) beserta rincian denda jika ada.
- **Informasi Perpustakaan:** Informasi jam operasional, kontak, dan tata tertib perpustakaan.

### Sisi Admin / Pustakawan
- **Dashboard Ringkasan:** Statistik total koleksi, sirkulasi aktif, peminjam terlambat, serta grafik ringkas.
- **Manajemen Buku & Kategori:** Operasi CRUD buku lengkap dengan unggah cover, ISBN, stok, dan klasifikasi kategori.
- **Manajemen Siswa:** Pendataan akun siswa, NIS, kelas, dan nomor kontak.
- **Sirkulasi Peminjaman:** Validasi persetujuan (approve), penolakan (reject), dan pemrosesan pengembalian buku beserta hitungan denda otomatis.
- **Laporan & Ekspor:** Rekapitulasi data peminjaman dengan filter rentang tanggal serta fitur ekspor CSV.
- **Pengaturan Perpustakaan:** Konfigurasi batas kuota pinjam, durasi peminjaman, tarif denda harian, dan informasi operasional sekolah.

---

## Prasyarat Sistem

Sebelum melakukan instalasi, pastikan perangkat Anda sudah terpasang:
- **PHP:** Versi 8.4 atau lebih baru (dengan ekstensi `pdo`, `sqlite3` atau `pdo_mysql`, `mbstring`, `fileinfo`, `openssl`).
- **Composer:** Versi 2.x
- **Node.js:** Versi 20.x atau 22.x LTS
- **NPM:** Bawaan Node.js
- **Database:** SQLite (default) atau MySQL / PostgreSQL / MariaDB.
- **Git**

---

## Langkah Instalasi Lengkap

Ikuti langkah-langkah terurut berikut untuk menyiapkan proyek dari nol:

### 1. Kloning Repositori
Buka terminal dan unduh repositori proyek:
```bash
git clone https://github.com/diazt/sistem-informasi-perpustakaan.git
cd sistem-informasi-perpustakaan
```

### 2. Salin Berkas Lingkungan (.env)
Buat salinan berkas konfigurasi lingkungan dari template `.env.example`:
- Di Linux / macOS:
  ```bash
  cp .env.example .env
  ```
- Di Windows (PowerShell):
  ```powershell
  Copy-Item .env.example .env
  ```

### 3. Pasang Dependensi Backend (PHP / Composer)
Jalankan Composer untuk menginstal semua library PHP:
```bash
composer install
```

### 4. Buat Application Key Laravel
Generate kunci enkripsi aplikasi:
```bash
php artisan key:generate
```

### 5. Konfigurasi Basis Data
Aplikasi secara bawaan menggunakan SQLite.
- **Jika menggunakan SQLite (Paling Praktis):**
  Pastikan berkas `database/database.sqlite` tersedia:
  - Di Linux / macOS:
    ```bash
    touch database/database.sqlite
    ```
  - Di Windows (PowerShell):
    ```powershell
    if (-not (Test-Path "database\database.sqlite")) { New-Item -ItemType File -Path "database\database.sqlite" }
    ```
- **Jika menggunakan MySQL:**
  Buka berkas `.env` lalu sesuaikan konfigurasi database berikut:
  ```env
  DB_CONNECTION=mysql
  DB_HOST=127.0.0.1
  DB_PORT=3306
  DB_DATABASE=nama_database_perpustakaan
  DB_USERNAME=root
  DB_PASSWORD=
  ```

### 6. Jalankan Migrasi dan Seeder
Buat struktur tabel dan isi data awal (pengaturan perpustakaan, akun admin, siswa contoh, kategori, dan koleksi buku):
```bash
php artisan migrate:fresh --seed
```

### 7. Buat Symbolic Link Storage
Tautkan storage lokal ke direktori public agar file cover buku dapat diakses web:
```bash
php artisan storage:link
```

### 8. Pasang Dependensi Frontend (Node.js)
Instal seluruh paket JavaScript/TypeScript menggunakan NPM:
```bash
npm install
```

### 9. Build Aset Frontend
Lakukan kompilasi awal aset frontend:
```bash
npm run build
```

---

## Cara Menjalankan Aplikasi

Anda dapat menjalankan server pengembangan backend dan frontend secara bersamaan.

### Opsi 1: Menjalankan Server Sekaligus (Rekomendasi)
```bash
composer run dev
```
*Perintah ini akan menjalankan server Laravel, Vite, dan queue worker secara paralel melalui bawaan Laravel.*

### Opsi 2: Menjalankan Secara Terpisah
Buka dua jendela terminal terpisah:
- **Terminal 1 (Backend Laravel):**
  ```bash
  php artisan serve
  ```
- **Terminal 2 (Vite Frontend):**
  ```bash
  npm run dev
  ```

Akses aplikasi melalui peramban web pada alamat:
```
http://localhost:8000
```

---

## Akun Bawaan (Default Credentials)

Setelah menjalankan seeder (`PerpustakaanSeeder`), akun default berikut dapat digunakan untuk pengujian:

| Peran (Role) | Email | Password | Keterangan |
|---|---|---|---|
| **Admin / Petugas** | `admin@perpustakaan.sch.id` | `password` | Akses penuh dashboard `/admin` |
| **Siswa 1** | `rizky@siswa.sch.id` | `password` | NIS: 2026001, Kelas: XII MIPA 1 |
| **Siswa 2** | `dewi@siswa.sch.id` | `password` | NIS: 2026002, Kelas: XI IPS 2 |

---

## Rute & Endpoint Utama

### Halaman Siswa & Publik
- `GET /` : Halaman Beranda (Landing Page)
- `GET /katalog` : Katalog Buku & Pencarian
- `GET /buku/{slug}` : Detail Buku
- `GET /informasi` : Informasi Perpustakaan & Tata Tertib
- `GET /peminjaman/{slug}` : Form Pengajuan Peminjaman Buku (Perlu Login Siswa)
- `POST /peminjaman/{slug}` : Simpan Pengajuan Peminjaman
- `GET /riwayat` : Riwayat & Status Peminjaman Siswa

### Panel Admin (`/admin`)
- `GET /admin/dashboard` : Ringkasan Statistik Perpustakaan
- `GET /admin/buku` : Daftar & Manajemen Data Buku
- `GET /admin/peminjaman` : Daftar Sirkulasi Pinjaman Aktif & Menunggu Persetujuan
- `POST /admin/peminjaman/{loan}/setujui` : Setujui Peminjaman Buku
- `POST /admin/peminjaman/{loan}/kembali` : Konfirmasi Pengembalian Buku & Hitung Denda
- `POST /admin/peminjaman/{loan}/tolak` : Tolak Pengajuan Peminjaman
- `GET /admin/siswa` : Manajemen Akun & Data Siswa
- `GET /admin/laporan` : Laporan Sirkulasi & Statistik
- `GET /admin/laporan/export-csv` : Unduh Laporan format CSV
- `GET /admin/pengaturan` : Konfigurasi Kebijakan & Profil Perpustakaan

---

## Pengujian dan Kualitas Kode

Jalankan perintah berikut untuk memeriksa kualitas kode dan pengujian:
```bash
# Jalankan Unit & Feature Test (Pest PHP)
php artisan test

# Format kode PHP (Laravel Pint)
vendor/bin/pint --format agent

# Cek tipe TypeScript
npm run types:check
```

---

## Arsitektur & Panduan Pengembang

Informasi arsitektur instruksional dan aturan ekosistem agen tersedia di:
- [`AGENTS.md`](./AGENTS.md) — Panduan konvensi Laravel, Inertia, Wayfinder, dan aturan workflow tim pengembang.

---

## Lisensi

Proyek ini dilisensikan di bawah [MIT License](./LICENSE). Silakan gunakan dan kembangkan sesuai kebutuhan.
