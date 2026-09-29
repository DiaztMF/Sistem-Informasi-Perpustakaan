import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowRight,
    BookCheck,
    BookMarked,
    BookOpen,
    Layers,
    Search,
    Users,
} from 'lucide-react';
import { useState, type FormEvent } from 'react';
import StudentLayout from '@/layouts/student-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { Book, Category, LibrarySetting } from '@/types/library';

type Props = {
    stats: {
        total_books: number;
        total_categories: number;
        total_students: number;
        total_borrowed: number;
    };
    popularBooks: Book[];
    latestBooks: Book[];
    categories: Category[];
    settings: LibrarySetting | null;
};

export default function Home({ stats, popularBooks, latestBooks, categories, settings }: Props) {
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.get('/katalog', { search: searchQuery.trim() });
        } else {
            router.get('/katalog');
        }
    };

    return (
        <StudentLayout>
            <Head title={`Beranda - ${settings?.name ?? 'Perpustakaan Sekolah'}`} />

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/70 via-slate-50 to-white py-16 sm:py-24 dark:from-[#1a1d12] dark:via-[#12140d] dark:to-[#12140d]">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-40 left-1/2 hidden h-96 w-[46rem] -translate-x-1/2 rounded-full bg-emerald-500/20 blur-[130px] dark:block"
                />
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -bottom-48 left-1/4 hidden h-72 w-[28rem] rounded-full bg-emerald-300/10 blur-[110px] dark:block"
                />
                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-3xl text-center">
                        <Badge variant="outline" className="border-emerald-200 bg-emerald-100/60 text-emerald-800 dark:border-emerald-700/60 dark:bg-emerald-950/60 dark:text-emerald-300">
                            Pusat Literasi Digital Siswa
                        </Badge>
                        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white">
                            Selamat Datang di{' '}
                            <span className="text-emerald-700 dark:text-[#c3cc7d]">
                                Perpustakaan Sekolah
                            </span>
                        </h1>
                        <p className="mt-4 text-lg text-slate-600 sm:text-xl dark:text-slate-300">
                            Temukan berbagai koleksi buku untuk menambah wawasan dan pengetahuanmu
                        </p>

                        {/* Search Bar */}
                        <form onSubmit={handleSearch} className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-0">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
                                <Input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Cari judul buku, penulis, atau ISBN..."
                                    className="h-13 w-full rounded-xl border-slate-300 bg-white pl-11 pr-4 text-base shadow-sm focus-visible:ring-emerald-500 sm:rounded-r-none dark:border-slate-800 dark:bg-slate-900"
                                />
                            </div>
                            <Button
                                type="submit"
                                className="h-13 rounded-xl bg-emerald-600 px-7 text-base font-semibold text-white shadow-sm hover:bg-emerald-700 sm:rounded-l-none"
                            >
                                Cari Buku
                            </Button>
                        </form>
                    </div>

                    {/* Quick Category Chips */}
                    {categories.length > 0 && (
                        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                Kategori Populer:
                            </span>
                            {categories.slice(0, 6).map((cat) => (
                                <Link
                                    key={cat.id}
                                    href={`/katalog?category=${cat.slug}`}
                                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-emerald-300 hover:text-emerald-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-emerald-700 dark:hover:text-emerald-400"
                                >
                                    {cat.name}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Metrics Section */}
            <section className="border-y border-slate-200 bg-white py-10 dark:border-slate-800 dark:bg-slate-900">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-8">
                        {/* Stat 1 */}
                        <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/50">
                            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                                <BookMarked className="size-6" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                    {stats.total_books.toLocaleString('id-ID')}
                                </p>
                                <p className="text-xs font-medium text-slate-500">Koleksi Buku</p>
                            </div>
                        </div>

                        {/* Stat 2 */}
                        <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/50">
                            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400">
                                <Layers className="size-6" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                    {stats.total_categories.toLocaleString('id-ID')}
                                </p>
                                <p className="text-xs font-medium text-slate-500">Kategori</p>
                            </div>
                        </div>

                        {/* Stat 3 */}
                        <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/50">
                            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                                <Users className="size-6" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                    {stats.total_students.toLocaleString('id-ID')}
                                </p>
                                <p className="text-xs font-medium text-slate-500">Siswa Terdaftar</p>
                            </div>
                        </div>

                        {/* Stat 4 */}
                        <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/50">
                            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400">
                                <BookCheck className="size-6" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                    {stats.total_borrowed.toLocaleString('id-ID')}
                                </p>
                                <p className="text-xs font-medium text-slate-500">Buku Dipinjam</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Buku Populer */}
            <section className="py-14 sm:py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-end justify-between">
                        <div>
                            <Badge variant="secondary" className="mb-2">Rekomendasi</Badge>
                            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                                Buku Populer
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Koleksi buku yang paling banyak dipinjam dan diminati siswa.
                            </p>
                        </div>
                        <Button asChild variant="outline" className="hidden sm:inline-flex">
                            <Link href="/katalog" className="gap-2">
                                Lihat Semua
                                <ArrowRight className="size-4" />
                            </Link>
                        </Button>
                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
                        {popularBooks.map((book) => (
                            <BookCard key={book.id} book={book} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Buku Terbaru */}
            <section className="border-t border-slate-200 bg-white py-14 sm:py-20 dark:border-slate-800 dark:bg-slate-900">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-end justify-between">
                        <div>
                            <Badge variant="secondary" className="mb-2">Koleksi Baru</Badge>
                            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                                Buku Terbaru
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Koleksi buku segar yang baru saja ditambahkan ke sistem perpustakaan.
                            </p>
                        </div>
                        <Button asChild variant="outline" className="hidden sm:inline-flex">
                            <Link href="/katalog" className="gap-2">
                                Lihat Semua
                                <ArrowRight className="size-4" />
                            </Link>
                        </Button>
                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
                        {latestBooks.map((book) => (
                            <BookCard key={book.id} book={book} />
                        ))}
                    </div>
                </div>
            </section>
        </StudentLayout>
    );
}

function BookCard({ book }: { book: Book }) {
    const isAvailable = book.stock > 0;

    return (
        <Card className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-950">
            {/* Book Cover */}
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
                {book.cover_image ? (
                    <img
                        src={`/storage/${book.cover_image}`}
                        alt={book.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center">
                        <BookOpen className="size-10 text-slate-300 dark:text-slate-700" />
                        <span className="mt-2 text-xs font-medium text-slate-400 dark:text-slate-600 line-clamp-2">
                            {book.title}
                        </span>
                    </div>
                )}

                {/* Availability Badge */}
                <div className="absolute top-2.5 right-2.5">
                    <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide ${
                            isAvailable
                                ? 'bg-emerald-500/90 text-white shadow-sm'
                                : 'bg-rose-500/90 text-white shadow-sm'
                        }`}
                    >
                        {isAvailable ? 'Tersedia' : 'Dipinjam'}
                    </span>
                </div>
            </div>

            {/* Info */}
            <CardContent className="p-4">
                {book.category && (
                    <p className="text-[11px] font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        {book.category.name}
                    </p>
                )}
                <h3 className="mt-1 line-clamp-1 text-sm font-bold text-slate-900 transition-colors group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-400">
                    <Link href={`/buku/${book.slug}`}>{book.title}</Link>
                </h3>
                <p className="mt-0.5 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                    Oleh: {book.author}
                </p>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-900">
                    <span className="text-[11px] text-slate-400">
                        Stok: <strong className="text-slate-700 dark:text-slate-300">{book.stock}</strong>
                    </span>
                    <Button asChild size="sm" variant="ghost" className="h-7 px-2 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950">
                        <Link href={`/buku/${book.slug}`}>Detail</Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
