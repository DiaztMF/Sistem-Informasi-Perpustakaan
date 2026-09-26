import { Head, Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    BookOpen,
    Edit2,
    Filter,
    Plus,
    Search,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AdminLayout from '@/layouts/admin-layout';

type Category = {
    id: number;
    name: string;
    slug: string;
};

type Book = {
    id: number;
    title: string;
    slug: string;
    author: string;
    publisher: string;
    publish_year: number;
    isbn: string | null;
    stock: number;
    total_stock: number;
    cover_image: string | null;
    category?: Category;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type BooksIndexProps = {
    books: {
        data: Book[];
        links: PaginationLink[];
        current_page: number;
        last_page: number;
        total: number;
        from: number;
        to: number;
    };
    categories: Category[];
    filters: {
        search?: string;
        category_id?: string | number;
    };
};

export default function BooksIndex({
    books,
    categories,
    filters,
}: BooksIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [categoryId, setCategoryId] = useState<string>(
        filters.category_id ? String(filters.category_id) : 'all'
    );
    const [deletingBook, setDeletingBook] = useState<Book | null>(null);

    const handleFilter = (newSearch?: string, newCategory?: string) => {
        const s = newSearch !== undefined ? newSearch : search;
        const c = newCategory !== undefined ? newCategory : categoryId;

        router.get(
            '/admin/buku',
            {
                search: s || undefined,
                category_id: c !== 'all' ? c : undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const confirmDelete = () => {
        if (!deletingBook) return;

        router.delete(`/admin/buku/${deletingBook.id}`, {
            preserveScroll: true,
            onFinish: () => setDeletingBook(null),
        });
    };

    return (
        <AdminLayout title="Data Buku Perpustakaan">
            <Head title="Data Buku - Admin Perpustakaan" />

            <div className="space-y-6">
                {/* Header & Primary Action */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Koleksi Buku
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Kelola data judul, stok buku fisik, dan kategori perpustakaan
                        </p>
                    </div>

                    <Button asChild className="bg-emerald-600 hover:bg-emerald-500 text-white">
                        <Link href="/admin/buku/create">
                            <Plus className="size-4 mr-1.5" />
                            Tambah Buku
                        </Link>
                    </Button>
                </div>

                {/* Filters */}
                <Card className="border-slate-200/80 shadow-xs dark:border-slate-800">
                    <CardContent className="p-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleFilter(search)}
                                    placeholder="Cari judul, pengarang, atau ISBN..."
                                    className="pl-9 text-xs"
                                />
                            </div>

                            <div className="w-full md:w-56">
                                <Select
                                    value={categoryId}
                                    onValueChange={(val) => {
                                        setCategoryId(val);
                                        handleFilter(undefined, val);
                                    }}
                                >
                                    <SelectTrigger className="text-xs">
                                        <div className="flex items-center gap-2">
                                            <Filter className="size-3.5 text-slate-400" />
                                            <SelectValue placeholder="Semua Kategori" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Kategori</SelectItem>
                                        {categories.map((c) => (
                                            <SelectItem key={c.id} value={String(c.id)}>
                                                {c.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleFilter()}
                                className="text-xs"
                            >
                                Terapkan Filter
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Books Data Table (Mockup 9 style) */}
                <Card className="border-slate-200/80 shadow-xs dark:border-slate-800">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="border-b border-slate-200/80 bg-slate-50/75 text-slate-500 uppercase tracking-wider dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold text-center w-12">No</th>
                                        <th className="px-4 py-3 font-semibold w-16">Cover</th>
                                        <th className="px-4 py-3 font-semibold">Judul & Pengarang</th>
                                        <th className="px-4 py-3 font-semibold">Kategori</th>
                                        <th className="px-4 py-3 font-semibold text-center w-28">Stok</th>
                                        <th className="px-4 py-3 font-semibold text-center w-28">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                    {books.data.length > 0 ? (
                                        books.data.map((book, index) => {
                                            const itemNo = (books.from || 1) + index;
                                            return (
                                                <tr
                                                    key={book.id}
                                                    className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-900/50"
                                                >
                                                    <td className="px-4 py-3 text-center text-slate-400">
                                                        {itemNo}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="size-12 overflow-hidden rounded-md border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
                                                            {book.cover_image ? (
                                                                <img
                                                                    src={`/storage/${book.cover_image}`}
                                                                    alt={book.title}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="flex h-full w-full items-center justify-center text-slate-400">
                                                                    <BookOpen className="size-5" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="font-semibold text-slate-900 dark:text-white line-clamp-1">
                                                            {book.title}
                                                        </div>
                                                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                                            Penulis: {book.author} • {book.publisher} ({book.publish_year})
                                                        </div>
                                                        {book.isbn && (
                                                            <div className="font-mono text-[10px] text-slate-400">
                                                                ISBN: {book.isbn}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Badge variant="outline" className="font-normal text-[11px]">
                                                            {book.category?.name || 'Umum'}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <div className="flex flex-col items-center gap-1">
                                                            <Badge
                                                                variant={book.stock > 0 ? 'secondary' : 'destructive'}
                                                                className="text-[10px]"
                                                            >
                                                                {book.stock > 0 ? 'Tersedia' : 'Habis'}
                                                            </Badge>
                                                            <span className="text-[11px] text-slate-500">
                                                                {book.stock} / {book.total_stock}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                asChild
                                                                className="size-8 text-slate-600 hover:text-emerald-600 dark:text-slate-300"
                                                            >
                                                                <Link href={`/admin/buku/${book.id}/edit`}>
                                                                    <Edit2 className="size-3.5" />
                                                                </Link>
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => setDeletingBook(book)}
                                                                className="size-8 text-slate-600 hover:text-rose-600 dark:text-slate-300"
                                                            >
                                                                <Trash2 className="size-3.5" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="py-12 text-center text-slate-500">
                                                <BookOpen className="mx-auto size-8 text-slate-300 mb-2" />
                                                Tidak ada buku ditemukan.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {books.links.length > 3 && (
                            <div className="flex items-center justify-between border-t border-slate-200/80 px-4 py-3 dark:border-slate-800">
                                <div className="text-[11px] text-slate-500">
                                    Menampilkan {books.from || 0} - {books.to || 0} dari {books.total} buku
                                </div>
                                <div className="flex items-center gap-1">
                                    {books.links.map((link, idx) => (
                                        <Button
                                            key={idx}
                                            variant={link.active ? 'default' : 'ghost'}
                                            size="sm"
                                            disabled={!link.url}
                                            asChild={!!link.url}
                                            className={`h-7 px-2.5 text-xs ${link.active ? 'bg-emerald-600 text-white' : ''}`}
                                        >
                                            {link.url ? (
                                                <Link
                                                    href={link.url}
                                                    preserveScroll
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            ) : (
                                                <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                            )}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={!!deletingBook}
                onOpenChange={(open) => !open && setDeletingBook(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-rose-600">
                            <AlertCircle className="size-5" />
                            Hapus Buku?
                        </DialogTitle>
                        <DialogDescription>
                            Anda akan menghapus buku <strong>"{deletingBook?.title}"</strong>.
                            Tindakan ini tidak dapat dibatalkan. Jika buku sedang dalam status peminjaman aktif, penghapusan akan dicegah oleh sistem.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <DialogClose asChild>
                            <Button variant="outline">Batal</Button>
                        </DialogClose>
                        <Button
                            onClick={confirmDelete}
                            className="bg-rose-600 hover:bg-rose-500 text-white"
                        >
                            Hapus Sekarang
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
