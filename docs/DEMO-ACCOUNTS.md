# Demo Accounts & Seed Data

Kredensial akun demo lengkap untuk Sistem Informasi Perpustakaan SMA Nusantara. Semua data berasal dari `PerpustakaanSeeder.php` dan dijamin akurat saat pertama kali di-seed.

## Quick Start

```bash
# Seed database fresh (hapus semua data lama, jalankan migrasi + seeder)
php artisan migrate:fresh --seed

# Atau jalankan seeder saja (kalau migrasi sudah jalan)
php artisan db:seed --class=PerpustakaanSeeder
```

Password semua akun demo: **`password`**

## Akun Demo

| Nama | Email | NIS | Kelas | Role |
|------|-------|-----|-------|------|
| Petugas Perpustakaan | admin@perpustakaan.sch.id | - | - | Admin |
| Andi Saputra | andi@siswa.sch.id | 2026001 | XII MIPA 1 | Siswa |
| Siti Aisyah | siti@siswa.sch.id | 2026002 | XI IPS 2 | Siswa |

### Login Multi-Identifier

Halaman login punya field **"Email atau NIS"**. Artinya:

- **Siswa** bisa login pakai email **atau** NIS, lalu password `password`.
- **Admin** login pakai email + password.

Contoh login Andi: ketik `2026001` atau `andi@siswa.sch.id` di kolom identifier, password `password`.

## URL Penting

| Halaman | URL | Keterangan |
|---------|-----|------------|
| Login | `/login` | Halaman masuk |
| Beranda | `/` | Landing page |
| Katalog | `/katalog` | Daftar buku |
| Riwayat | `/riwayat` | Riwayat peminjaman siswa |
| Dashboard Admin | `/admin/dashboard` | Panel admin |
| Peminjaman | `/admin/peminjaman` | Kelola peminjaman |
| Laporan | `/admin/laporan` | Laporan perpustakaan |

## Data Contoh

### Kategori Buku (8)

| # | Nama | Deskripsi |
|---|------|-----------|
| 1 | Fiksi | Karya sastra imajinatif termasuk novel, cerpen, dan komik. |
| 2 | Nonfiksi | Buku berbasis fakta, inspirasi, pengembangan diri, dan biografi. |
| 3 | Pendidikan | Buku pelajaran, kurikulum, dan referensi akademik sekolah. |
| 4 | Sains | Ilmu pengetahuan alam, fisika, biologi, kimia, dan antariksa. |
| 5 | Sejarah | Catatan sejarah nusantara, peristiwa dunia, dan tokoh bersejarah. |
| 6 | Teknologi | Komputer, pemrograman, robotika, dan teknologi informasi. |
| 7 | Agama | Pendidikan agama, moralitas, etika, dan studi keagamaan. |
| 8 | Bahasa | Kamus, tata bahasa, dan pembelajaran bahasa asing maupun daerah. |

### Buku (17 Koleksi Bercover)

| # | Judul | Pengarang | Kategori | Stok | Cover |
|---|-------|-----------|----------|------|-------|
| 1 | Laut Bercerita | Leila S. Chudori | Fiksi | 5 | covers/laut-bercerita.jpg |
| 2 | Atomic Habits | James Clear | Nonfiksi | 3 | covers/atomic-habits.jpg |
| 3 | Bumi | Tere Liye | Fiksi | 4 | covers/bumi.jpg |
| 4 | Sejarah Indonesia | Tim Redaksi | Sejarah | 10 | covers/sejarah-indonesia.jpg |
| 5 | Matematika SMA | Kemdikbud | Pendidikan | 6 | covers/matematika-sma.jpg |
| 6 | Biologi Campbell | Campbell | Sains | 3 | covers/biologi-campbell.jpg |
| 7 | Laskar Pelangi | Andrea Hirata | Fiksi | 7 | covers/laskar-pelangi.jpg |
| 8 | Sebuah Seni untuk Bersikap Bodo Amat | Mark Manson | Nonfiksi | 5 | covers/sebuah-seni-bersikap-bodo-amat.jpg |
| 9 | Clean Code | Robert C. Martin | Teknologi | 4 | covers/clean-code.jpg |
| 10 | The Pragmatic Programmer | David Thomas, Andrew Hunt | Teknologi | 3 | covers/pragmatic-programmer.jpg |
| 11 | Sapiens: Riwayat Singkat Umat Manusia | Yuval Noah Harari | Sains | 6 | covers/sapiens.jpg |
| 12 | Cosmos | Carl Sagan | Sains | 4 | covers/cosmos.jpg |
| 13 | Thinking, Fast and Slow | Daniel Kahneman | Nonfiksi | 5 | covers/thinking-fast-and-slow.jpg |
| 14 | A Brief History of Time | Stephen Hawking | Sains | 4 | covers/a-brief-history-of-time.jpg |
| 15 | Steve Jobs | Walter Isaacson | Teknologi | 3 | covers/steve-jobs.jpg |
| 16 | Max Havelaar | Multatuli | Sejarah | 5 | covers/max-havelaar.jpg |
| 17 | Ayat-Ayat Cinta | Habiburrahman El Shirazy | Agama | 6 | covers/ayat-ayat-cinta.jpg |

### Pinjaman Contoh (2)

| Kode | Peminjam | Buku | Status | Keterangan |
|------|----------|------|--------|------------|
| PJ-2026-001 | Andi Saputra | Laut Bercerita | Diproses | Pengajuan peminjaman untuk tugas literasi bahasa Indonesia. |
| PJ-2026-002 | Siti Aisyah | Atomic Habits | Dipinjam | Peminjaman mandiri di loket perpustakaan. |

### Aturan Perpustakaan

- **Maks peminjaman aktif:** 2 buku per siswa
- **Durasi peminjaman:** 7 hari kerja
- **Denda keterlambatan:** Rp1.000 per hari per buku

## Reset Demo

Kalau data sudah berantakan dan mau mulai dari awal:

```bash
php artisan migrate:fresh --seed
```

Ini akan menghapus semua data, menjalankan migrasi ulang, dan menjalankan seeder otomatis.

## Referensi

- Seeder: `database/seeders/PerpustakaanSeeder.php`
- Model User: `app/Models/User.php`
- Enums: `app/Enums/Role.php`, `app/Enums/LoanStatus.php`
