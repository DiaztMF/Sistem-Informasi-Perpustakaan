# UAT Report — Sistem Informasi Perpustakaan (Playwright E2E)

**Tanggal:** 2026-09-26
**Environment:** http://127.0.0.1:8000 (`php artisan serve`), SQLite fresh `migrate:fresh --seed`
**Metode:** Playwright browser automation inline — navigasi, snapshot, klik, form, console check per halaman
**Dokumen terkait:** `docs/DEMO-ACCOUNTS.md`, `docs/superpowers/specs/2026-09-26-sistem-informasi-perpustakaan-design.md`

## Hasil Ringkas

| # | Skenario | Expected | Actual | Status |
|---|----------|----------|--------|--------|
| UAT-01 | Guest buka `/` | Hero + search + 4 statistik + Buku Populer/Terbaru | Hero tampil, stats 6/8/2/1 sesuai seed, 0 console error | PASS |
| UAT-02 | Guest search `/katalog?search=Laut` | 1 hasil Laut Bercerita | 1 hasil, badge Tersedia, stok 5, 0 error | PASS |
| UAT-03 | Guest buka `/buku/laut-bercerita` | Metadata lengkap + CTA login | Penerbit, tahun 2017, ISBN, stok 5, sinopsis, tombol "Masuk untuk Meminjam", 0 error | PASS |
| UAT-04 | Guest buka `/informasi` | Jam buka, alamat, kontak, 6 aturan | Sesuai seeder, 0 error | PASS |
| UAT-05 | Login NIS `2026001`/`password` | Masuk sebagai Andi Saputra | Avatar AS + NIS tampil, `/riwayat` tampil 1 pinjaman Diproses PJ-2026-001 | PASS |
| UAT-06 | Ajukan pinjam `/peminjaman/bumi` | Loan Diproses, stok 4→3, redirect `/riwayat` | Loan PINJAM-20260926-HTYF dibuat, aktif 1→2, 0 error | PASS |
| UAT-07 | Kuota: pinjam buku ke-3 | Ditolak dengan pesan jelas | Pesan "Batas Peminjaman — maksimal 2 buku aktif" | PASS |
| UAT-08 | Admin approve (Setujui) | diproses→dipinjam, due date reset +7 hari | Dialog "Serahkan Buku Fisik?" → status dipinjam, due 2026-10-03, stok tidak double-decrement | PASS |
| UAT-09 | Return tepat waktu (Bumi) | selesai, denda 0, stok 3→4 | Dialog "Pengembalian Tepat Waktu", selesai, fine 0 | PASS |
| UAT-10 | Return telat 3 hari (Siti, PJ-2026-002) | Estimasi Rp3.000, selesai + fine tersimpan | Dialog "Keterlambatan Terdeteksi! 3 hari, Rp 3.000" → DB: selesai, fine 3000.00, stok 3→4 | PASS |
| UAT-11 | `/admin/laporan` + export CSV | Ringkasan + filter + CSV 200 | 3 transaksi, 2 selesai, Rp3.000; CSV `text/csv` header + 3 baris benar | PASS |
| UAT-12 | `/admin/pengaturan` (admin) | Form profil + kebijakan tampil | Tampil lengkap, 0 error | PASS |
| UAT-13 | Guest → `/admin/dashboard` | Redirect `/login` | Redirect `/login` | PASS |
| UAT-14 | Siswa → `/admin/*` | 403 + pesan jelas | 403 "Akses khusus administrator." | PASS |
| UAT-15 | Isolasi data siswa (Siti) | Hanya lihat pinjaman sendiri | 0 aktif, 1 selesai (miliknya) | PASS |
| UAT-16 | Mobile 390px `/katalog` | Rapi, no overlap/scroll horizontal | Lihat `docs/e2e-mobile-katalog.png` — filter stack vertikal, rapi | PASS |

**Console hygiene:** 0 error di semua halaman (satu-satunya 403 resource adalah akses guest ke `/admin/dashboard` yang memang ditolak by design).

## Temuan

### F-01 (Major, UX) — Redirect pasca-login jatuh ke `/email/verify`
**Repro:** Login sebagai siswa maupun admin → browser mendarat di `/email/verify`, bukan `/katalog` / `/admin/dashboard`.
**Penyebab (dugaan):** Fortify `HOME` mengarah ke `/dashboard` yang ber-middleware `verified`, sementara akun seed tidak verified.
**Rekomendasi:** Custom `LoginResponse` / redirect berbasis role (siswa → `/`, admin → `/admin/dashboard`), atau tandai akun seed verified. Belum diperbaiki di sesi ini agar Pest suite (90 pass) tidak terganggu.

### F-02 (Minor, kosmetik) — Tanggal mentah ISO di tabel `/admin/peminjaman`
**Repro:** Kolom Tgl Pinjam / Jatuh Tempo tampil `2026-09-26T00:00:00.000000Z`.
**Catatan:** Halaman `/admin/laporan` sudah format tanggal rapi (`26 Sep 2026`) — samakan formatter-nya.

## Catatan UAT
- Data DB dikembalikan ke state seed murni via `migrate:fresh --seed` setelah UAT (loan UAT sudah dihapus).
- Suite Pest: **90 passed / 657 assertions**; `npm run types:check` (tsc --noEmit) bersih.
- Server dev masih jalan di `http://127.0.0.1:8000` (proses `php artisan serve` background).
