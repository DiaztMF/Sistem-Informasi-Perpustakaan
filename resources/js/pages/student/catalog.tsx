import { Head, Link, router } from '@inertiajs/react';
import {
    BookOpen,
    CheckCircle2,
    Filter,
    RotateCcw,
    Search,
    XCircle,
} from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import StudentLayout from '@/layouts/student-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { Book, Category, PaginatedResponse } from '@/types/library';

type Props = {
    books: PaginatedResponse<Book>;
    categories: Category[];
    filters: {
        search?: string;
        category?: string;
        availability?: string;
    };
};

export default function Catalog({ books, categories, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || '');
    const [availability, setAvailability] = useState(filters.availability || 'semua');

    useEffect(() => {
        setSearch(filters.search || '');
        setSelectedCategory(filters.category || '');
        setAvailability(filters.availability || 'semua');
    }, [filters]);

    const applyFilters = (newParams: Partial<typeof filters>) => {
        const query: Record<string, string> = {};

        const searchVal = newParams.search !== undefined ? newParams.search : search;
        const catVal = newParams.category !== undefined ? newParams.category : selectedCategory;
        const availVal = newParams.availability !== undefined ? newParams.availability : availability;

        if (searchVal?.trim()) query.search = searchVal.trim();
        if (catVal?.trim()) query.category = catVal.trim();
        if (availVal && availVal !== 'semua') query.availability = availVal;

        router.get('/katalog', query, { preserveState: true });
    };

    const handleSearchSubmit = (e: FormEvent) => {
        e.preventDefault();
        applyFilters({ search });
    };

    const handleReset = () => {
        setSearch('');
        setSelectedCategory('');
        setAvailability('semua');
        router.get('/katalog');
    };

    return (
        <StudentLayout>
            <Head title="Katalog Buku - Perpustakaan Sekolah" />

            <div className="border-b border-slate-200 bg-white py-8 dark:border-slate-800 dark:bg-slate-900">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        Katalog Buku Perpustakaan
                    </h1>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        Jelajahi seluruh buku koleksi perpustakaan, cari berdasarkan judul, penulis, atau kategori.
                    </p>

                    {/* Top Search bar */}
                    <form onSubmit={handleSearchSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari judul buku, pengarang, penerbit, atau nomor ISBN..."
                                className="h-11 pl-10"
                            />
                        </div>
                        <Button type="submit" className="h-11 bg-emerald-600 px-6 font-medium text-white hover:bg-emerald-700">
                            Cari
                        </Button>
                        {(search || selectedCategory || availability !== 'semua') && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleReset}
                                className="h-11 gap-1.5"
                            >
                                <RotateCcw className="size-4" />
                                Reset
                            </Button>
                        )}
                    </form>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
                    {/* Sidebar Filter */}
                    <aside className="space-y-6 lg:col-span-1">
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 font-semibold text-slate-900 dark:border-slate-800 dark:text-white">
                                <Filter className="size-4 text-emerald-600" />
                                <span>Filter Katalog</span>
                            </div>

                            {/* Availability Filter */}
                            <div className="mt-4">
                                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Ketersediaan
                                </label>
                                <div className="mt-2 space-y-1.5">
                                    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                                        <input
                                            type="radio"
                                            name="availability"
                                            value="semua"
                                            checked={availability === 'semua'}
                                            onChange={() => {
                                                setAvailability('semua');
                                                applyFilters({ availability: 'semua' });
                                            }}
                                            className="size-4 text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <span>Semua Status</span>
                                    </label>
                                    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                                        <input
                                            type="radio"
                                            name="availability"
                                            value="tersedia"
                                            checked={availability === 'tersedia'}
                                            onChange={() => {
                                                setAvailability('tersedia');
                                                applyFilters({ availability: 'tersedia' });
                                            }}
                                            className="size-4 text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <span className="flex items-center gap-1.5">
                                            <CheckCircle2 className="size-3.5 text-emerald-600" />
                                            Hanya Buku Tersedia
                                        </span>
                                    </label>
                                </div>
                            </div>

                            {/* Categories Filter */}
                            <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
                                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Kategori Koleksi
                                </label>
                                <div className="mt-3 max-h-80 space-y-1.5 overflow-y-auto pr-1">
                                    <label className="flex cursor-pointer items-center justify-between text-sm text-slate-700 dark:text-slate-300">
                                        <span className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="category"
                                                value=""
                                                checked={!selectedCategory}
                                                onChange={() => {
                                                    setSelectedCategory('');
                                                    applyFilters({ category: '' });
                                                }}
                                                className="size-4 text-emerald-600 focus:ring-emerald-500"
                                            />
                                            Semua Kategori
                                        </span>
                                    </label>
                                    {categories.map((cat) => (
                                        <label
                                            key={cat.id}
                                            className="flex cursor-pointer items-center justify-between text-sm text-slate-700 dark:text-slate-300"
                                        >
                                            <span className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    name="category"
                                                    value={cat.slug}
                                                    checked={selectedCategory === cat.slug}
                                                    onChange={() => {
                                                        setSelectedCategory(cat.slug);
                                                        applyFilters({ category: cat.slug });
                                                    }}
                                                    className="size-4 text-emerald-600 focus:ring-emerald-500"
                                                />
                                                {cat.name}
                                            </span>
                                            {cat.books_count !== undefined && (
                                                <span className="text-xs text-slate-400">
                                                    ({cat.books_count})
                                                </span>
                                            )}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Book List / Grid */}
                    <div className="lg:col-span-3">
                        <div className="mb-4 flex items-center justify-between">
                            <p className="text-sm text-slate-500">
                                Menampilkan <strong className="text-slate-800 dark:text-slate-200">{books.total}</strong> koleksi buku
                            </p>
                        </div>

                        {books.data.length === 0 ? (
                            <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
                                <XCircle className="size-12 text-slate-300 dark:text-slate-700" />
                                <h3 className="mt-3 text-base font-semibold text-slate-800 dark:text-slate-200">
                                    Buku tidak ditemukan
                                </h3>
                                <p className="mt-1 text-sm text-slate-500">
                                    Coba ubah kata kunci pencarian atau bersihkan filter yang dipilih.
                                </p>
                                <Button
                                    variant="outline"
                                    onClick={handleReset}
                                    className="mt-4"
                                >
                                    Reset Semua Filter
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
                                {books.data.map((book) => {
                                    const isAvailable = book.stock > 0;
                                    return (
                                        <Card
                                            key={book.id}
                                            className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-950"
                                        >
                                            <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
                                                {book.cover_image ? (
                                                    <img
                                                        src={`/storage/${book.cover_image}`}
                                                        alt={book.title}
                                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full flex-col items-center justify-center p-3 text-center">
                                                        <BookOpen className="size-8 text-slate-300 dark:text-slate-700" />
                                                        <span className="mt-2 text-xs font-medium text-slate-400 line-clamp-2">
                                                            {book.title}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="absolute top-2 right-2">
                                                    <Badge
                                                        className={`text-[10px] font-semibold border-none ${
                                                            isAvailable
                                                                ? 'bg-emerald-600 text-white'
                                                                : 'bg-rose-600 text-white'
                                                        }`}
                                                    >
                                                        {isAvailable ? 'Tersedia' : 'Dipinjam'}
                                                    </Badge>
                                                </div>
                                            </div>

                                            <CardContent className="flex flex-1 flex-col justify-between p-3.5">
                                                <div>
                                                    {book.category && (
                                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                                                            {book.category.name}
                                                        </p>
                                                    )}
                                                    <h3 className="mt-1 line-clamp-2 text-xs font-bold text-slate-900 transition-colors group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-400">
                                                        <Link href={`/buku/${book.slug}`}>{book.title}</Link>
                                                    </h3>
                                                    <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-500">
                                                        {book.author}
                                                    </p>
                                                </div>

                                                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 dark:border-slate-900">
                                                    <span className="text-[11px] text-slate-400">
                                                        Stok: <strong className="text-slate-700 dark:text-slate-300">{book.stock}</strong>
                                                    </span>
                                                    <Button asChild size="sm" className="h-7 bg-emerald-600 px-2.5 text-xs text-white hover:bg-emerald-700">
                                                        <Link href={`/buku/${book.slug}`}>Lihat Detail</Link>
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}

                        {/* Pagination */}
                        {books.last_page > 1 && (
                            <div className="mt-8 flex items-center justify-center gap-1">
                                {books.links.map((link, index) => {
                                    if (!link.url) {
                                        return (
                                            <span
                                                key={index}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                                className="inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-slate-200 px-3 text-xs text-slate-400 dark:border-slate-800"
                                            />
                                        );
                                    }

                                    return (
                                        <Link
                                            key={index}
                                            href={link.url}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className={`inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-xs font-medium transition-colors ${
                                                link.active
                                                    ? 'border-emerald-600 bg-emerald-600 text-white'
                                                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
                                            }`}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
}
