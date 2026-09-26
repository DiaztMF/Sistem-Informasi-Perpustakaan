<?php

namespace Database\Seeders;

use App\Enums\LoanStatus;
use App\Enums\Role;
use App\Models\Book;
use App\Models\Category;
use App\Models\LibrarySetting;
use App\Models\Loan;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class PerpustakaanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Library Settings
        LibrarySetting::updateOrCreate(
            ['name' => 'Perpustakaan SMA Nusantara'],
            [
                'address' => 'Jl. Pendidikan No. 123 Surakarta',
                'open_hours' => 'Senin - Jumat 07.00 - 15.00, Sabtu 07.00 - 12.00',
                'contact_phone' => '0271-123456',
                'contact_email' => 'perpus@smanusantara.sch.id',
                'rules_text' => implode("\n", [
                    '1. Siswa wajib membawa kartu pelajar/identitas saat berkunjung dan meminjam buku.',
                    '2. Setiap siswa maksimal meminjam 2 buku secara bersamaan.',
                    '3. Durasi peminjaman buku maksimal 7 hari kerja.',
                    '4. Keterlambatan pengembalian buku dikenakan denda Rp1.000 per hari per buku.',
                    '5. Menjaga ketertiban, kebersihan, dan ketenangan selama berada di ruang perpustakaan.',
                    '6. Dilarang merusak, mencoret, atau menghilangkan buku perpustakaan.',
                ]),
                'loan_duration_days' => 7,
                'fine_per_day' => 1000,
                'max_active_loans' => 2,
            ]
        );

        // 2. Users (1 Admin, 2 Siswa)
        $admin = User::updateOrCreate(
            ['email' => 'admin@perpustakaan.sch.id'],
            [
                'name' => 'Petugas Perpustakaan',
                'password' => Hash::make('password'),
                'role' => Role::ADMIN,
                'phone' => '081122334455',
            ]
        );

        $andi = User::updateOrCreate(
            ['email' => 'andi@siswa.sch.id'],
            [
                'name' => 'Andi Saputra',
                'password' => Hash::make('password'),
                'nis' => '2026001',
                'role' => Role::SISWA,
                'class_name' => 'XII MIPA 1',
                'phone' => '081234567890',
            ]
        );

        $siti = User::updateOrCreate(
            ['email' => 'siti@siswa.sch.id'],
            [
                'name' => 'Siti Aisyah',
                'password' => Hash::make('password'),
                'nis' => '2026002',
                'role' => Role::SISWA,
                'class_name' => 'XI IPS 2',
                'phone' => '081298765432',
            ]
        );

        // 3. Categories matching UI mockup
        $categoryNames = [
            'Fiksi' => 'Karya sastra imajinatif termasuk novel, cerpen, dan komik.',
            'Nonfiksi' => 'Buku berbasis fakta, inspirasi, pengembangan diri, dan biografi.',
            'Pendidikan' => 'Buku pelajaran, kurikulum, dan referensi akademik sekolah.',
            'Sains' => 'Ilmu pengetahuan alam, fisika, biologi, kimia, dan antariksa.',
            'Sejarah' => 'Catatan sejarah nusantara, peristiwa dunia, dan tokoh bersejarah.',
            'Teknologi' => 'Komputer, pemrograman, robotika, dan teknologi informasi.',
            'Agama' => 'Pendidikan agama, moralitas, etika, dan studi keagamaan.',
            'Bahasa' => 'Kamus, tata bahasa, dan pembelajaran bahasa asing maupun daerah.',
        ];

        $categories = [];
        foreach ($categoryNames as $name => $desc) {
            $categories[$name] = Category::updateOrCreate(
                ['slug' => Str::slug($name)],
                [
                    'name' => $name,
                    'description' => $desc,
                ]
            );
        }

        // 4. Books matching UI mockup
        $booksData = [
            [
                'title' => 'Laut Bercerita',
                'slug' => 'laut-bercerita',
                'author' => 'Leila S. Chudori',
                'category' => 'Fiksi',
                'publisher' => 'Kepustakaan Populer Gramedia',
                'publish_year' => 2017,
                'isbn' => '9786024246945',
                'stock' => 5,
                'total_stock' => 5,
                'synopsis' => 'Laut Bercerita adalah novel yang mengisahkan tentang perjuangan, persahabatan, dan kehilangan pada masa kelam di Indonesia.',
            ],
            [
                'title' => 'Atomic Habits',
                'slug' => 'atomic-habits',
                'author' => 'James Clear',
                'category' => 'Nonfiksi',
                'publisher' => 'Gramedia',
                'publish_year' => 2019,
                'isbn' => '9786020633176',
                'stock' => 3,
                'total_stock' => 4,
                'synopsis' => 'Perubahan kecil yang memberikan hasil luar biasa dalam membangun kebiasaan baik dan meninggalkan kebiasaan buruk.',
            ],
            [
                'title' => 'Bumi',
                'slug' => 'bumi',
                'author' => 'Tere Liye',
                'category' => 'Fiksi',
                'publisher' => 'Gramedia Pustaka Utama',
                'publish_year' => 2014,
                'isbn' => '9786020301129',
                'stock' => 4,
                'total_stock' => 4,
                'synopsis' => 'Petualangan fantasi tiga remaja dengan kekuatan unik menjelajahi klan paralel Bumi.',
            ],
            [
                'title' => 'Sejarah Indonesia',
                'slug' => 'sejarah-indonesia',
                'author' => 'Tim Redaksi',
                'category' => 'Sejarah',
                'publisher' => 'Kemdikbud',
                'publish_year' => 2020,
                'isbn' => '9786022443210',
                'stock' => 10,
                'total_stock' => 10,
                'synopsis' => 'Buku pegangan sejarah perkembangan bangsa Indonesia dari masa kerajaan hingga era kontemporer.',
            ],
            [
                'title' => 'Matematika SMA',
                'slug' => 'matematika-sma',
                'author' => 'Kemdikbud',
                'category' => 'Pendidikan',
                'publisher' => 'Kemdikbud',
                'publish_year' => 2021,
                'isbn' => '9786022445559',
                'stock' => 6,
                'total_stock' => 6,
                'synopsis' => 'Materi dan konsep dasar matematika tingkat SMA mencakup aljabar, trigonometri, dan kalkulus.',
            ],
            [
                'title' => 'Biologi Campbell',
                'slug' => 'biologi-campbell',
                'author' => 'Campbell',
                'category' => 'Sains',
                'publisher' => 'Erlangga',
                'publish_year' => 2018,
                'isbn' => '9789790757776',
                'stock' => 3,
                'total_stock' => 3,
                'synopsis' => 'Buku referensi biologi komprehensif mulai dari biologi seluler, genetika, hingga ekosistem.',
            ],
        ];

        $books = [];
        foreach ($booksData as $bookItem) {
            $cat = $categories[$bookItem['category']];
            $books[$bookItem['title']] = Book::updateOrCreate(
                ['slug' => $bookItem['slug']],
                [
                    'category_id' => $cat->id,
                    'title' => $bookItem['title'],
                    'author' => $bookItem['author'],
                    'publisher' => $bookItem['publisher'],
                    'publish_year' => $bookItem['publish_year'],
                    'isbn' => $bookItem['isbn'],
                    'stock' => $bookItem['stock'],
                    'total_stock' => $bookItem['total_stock'],
                    'synopsis' => $bookItem['synopsis'],
                ]
            );
        }

        // 5. Sample Loans matching mockup
        // Andi Saputra: pinjam "Laut Bercerita", status: diproses, loan_date: now(), due_date: now()->addDays(7)
        Loan::updateOrCreate(
            ['loan_code' => 'PJ-2026-001'],
            [
                'user_id' => $andi->id,
                'book_id' => $books['Laut Bercerita']->id,
                'loan_date' => now()->toDateString(),
                'due_date' => now()->addDays(7)->toDateString(),
                'status' => LoanStatus::DIPROSES,
                'notes' => 'Pengajuan peminjaman untuk tugas literasi bahasa Indonesia.',
                'fine_amount' => 0,
            ]
        );

        // Siti Aisyah: pinjam "Atomic Habits", status: dipinjam, loan_date: now()->subDays(2), due_date: now()->addDays(5)
        Loan::updateOrCreate(
            ['loan_code' => 'PJ-2026-002'],
            [
                'user_id' => $siti->id,
                'book_id' => $books['Atomic Habits']->id,
                'loan_date' => now()->subDays(2)->toDateString(),
                'due_date' => now()->addDays(5)->toDateString(),
                'status' => LoanStatus::DIPINJAM,
                'notes' => 'Peminjaman mandiri di loket perpustakaan.',
                'fine_amount' => 0,
            ]
        );
    }
}
