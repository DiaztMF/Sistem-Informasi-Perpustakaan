import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, BookOpen, Image as ImageIcon, Save, Upload } from 'lucide-react';
import { useState, type FormEventHandler } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/admin-layout';

type Category = {
    id: number;
    name: string;
    slug: string;
};

type Book = {
    id: number;
    title: string;
    category_id: number;
    author: string;
    publisher: string;
    publish_year: number;
    isbn: string | null;
    stock: number;
    total_stock: number;
    synopsis: string | null;
    cover_image: string | null;
};

type BookFormProps = {
    categories: Category[];
    book: Book | null;
};

export default function BookForm({ categories, book }: BookFormProps) {
    const isEdit = !!book;

    const { data, setData, post, put, processing, errors } = useForm<{
        title: string;
        category_id: string;
        author: string;
        publisher: string;
        publish_year: string | number;
        isbn: string;
        total_stock: string | number;
        stock: string | number;
        synopsis: string;
        cover_image: File | null;
        _method?: string;
    }>({
        title: book?.title || '',
        category_id: book ? String(book.category_id) : '',
        author: book?.author || '',
        publisher: book?.publisher || '',
        publish_year: book?.publish_year || new Date().getFullYear(),
        isbn: book?.isbn || '',
        total_stock: book?.total_stock ?? 1,
        stock: book?.stock ?? 1,
        synopsis: book?.synopsis || '',
        cover_image: null,
    });

    const [previewUrl, setPreviewUrl] = useState<string | null>(
        book?.cover_image ? `/storage/${book.cover_image}` : null
    );

    const handleFileChange = (file: File | null) => {
        setData('cover_image', file);
        if (file) {
            setPreviewUrl(URL.createObjectURL(file));
        } else if (book?.cover_image) {
            setPreviewUrl(`/storage/${book.cover_image}`);
        } else {
            setPreviewUrl(null);
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (isEdit) {
            // Using post with _method=PUT to handle multipart/form-data with file upload in Laravel
            routerPostUpdate();
        } else {
            post('/admin/buku');
        }
    };

    const routerPostUpdate = () => {
        // Use Inertia post with spoofed method PUT so files are processed properly
        post(`/admin/buku/${book?.id}`, {
            headers: {
                'X-HTTP-Method-Override': 'PUT',
            },
        });
    };

    return (
        <AdminLayout title={isEdit ? 'Ubah Buku' : 'Tambah Buku Baru'}>
            <Head title={`${isEdit ? 'Ubah' : 'Tambah'} Buku - Admin Perpustakaan`} />

            <div className="mx-auto max-w-4xl space-y-6">
                {/* Back button & Page title */}
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" asChild className="size-8">
                        <Link href="/admin/buku">
                            <ArrowLeft className="size-4" />
                        </Link>
                    </Button>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                            {isEdit ? 'Ubah Data Buku' : 'Tambah Judul Buku Baru'}
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Lengkapi informasi detail buku untuk katalog perpustakaan
                        </p>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        {/* Cover Image Upload Column */}
                        <div className="space-y-4 md:col-span-1">
                            <Card className="border-slate-200/80 shadow-xs dark:border-slate-800">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-semibold">Cover Buku</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center dark:border-slate-800 dark:bg-slate-900">
                                        {previewUrl ? (
                                            <img
                                                src={previewUrl}
                                                alt="Cover preview"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center gap-2 text-slate-400 p-4 text-center">
                                                <ImageIcon className="size-8 stroke-1" />
                                                <span className="text-xs font-medium">Belum ada cover</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="cover_image" className="cursor-pointer">
                                            <div className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800">
                                                <Upload className="size-3.5" />
                                                Pilih Foto Cover
                                            </div>
                                            <input
                                                id="cover_image"
                                                type="file"
                                                accept="image/*"
                                                className="sr-only"
                                                onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                                            />
                                        </Label>
                                        <p className="text-[11px] text-slate-400 text-center">
                                            JPG, PNG, atau WebP (Maks. 2MB)
                                        </p>
                                        {errors.cover_image && (
                                            <p className="text-xs text-rose-500">{errors.cover_image}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Book Metadata Columns */}
                        <div className="space-y-4 md:col-span-2">
                            <Card className="border-slate-200/80 shadow-xs dark:border-slate-800">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-semibold">Informasi Utama</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Judul */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="title" className="text-xs font-medium">
                                            Judul Buku <span className="text-rose-500">*</span>
                                        </Label>
                                        <Input
                                            id="title"
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            placeholder="Contoh: Laskar Pelangi"
                                            className="text-xs"
                                        />
                                        {errors.title && (
                                            <p className="text-xs text-rose-500">{errors.title}</p>
                                        )}
                                    </div>

                                    {/* Kategori */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="category" className="text-xs font-medium">
                                            Kategori <span className="text-rose-500">*</span>
                                        </Label>
                                        <Select
                                            value={data.category_id}
                                            onValueChange={(val) => setData('category_id', val)}
                                        >
                                            <SelectTrigger id="category" className="text-xs">
                                                <SelectValue placeholder="Pilih Kategori Buku" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((c) => (
                                                    <SelectItem key={c.id} value={String(c.id)}>
                                                        {c.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.category_id && (
                                            <p className="text-xs text-rose-500">{errors.category_id}</p>
                                        )}
                                    </div>

                                    {/* Penulis & Penerbit */}
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="author" className="text-xs font-medium">
                                                Penulis / Pengarang <span className="text-rose-500">*</span>
                                            </Label>
                                            <Input
                                                id="author"
                                                value={data.author}
                                                onChange={(e) => setData('author', e.target.value)}
                                                placeholder="Nama penulis"
                                                className="text-xs"
                                            />
                                            {errors.author && (
                                                <p className="text-xs text-rose-500">{errors.author}</p>
                                            )}
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="publisher" className="text-xs font-medium">
                                                Penerbit <span className="text-rose-500">*</span>
                                            </Label>
                                            <Input
                                                id="publisher"
                                                value={data.publisher}
                                                onChange={(e) => setData('publisher', e.target.value)}
                                                placeholder="Nama penerbit"
                                                className="text-xs"
                                            />
                                            {errors.publisher && (
                                                <p className="text-xs text-rose-500">{errors.publisher}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Tahun Terbit & ISBN */}
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="publish_year" className="text-xs font-medium">
                                                Tahun Terbit <span className="text-rose-500">*</span>
                                            </Label>
                                            <Input
                                                id="publish_year"
                                                type="number"
                                                value={data.publish_year}
                                                onChange={(e) => setData('publish_year', e.target.value)}
                                                placeholder="YYYY"
                                                className="text-xs"
                                            />
                                            {errors.publish_year && (
                                                <p className="text-xs text-rose-500">{errors.publish_year}</p>
                                            )}
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="isbn" className="text-xs font-medium">
                                                Nomor ISBN
                                            </Label>
                                            <Input
                                                id="isbn"
                                                value={data.isbn}
                                                onChange={(e) => setData('isbn', e.target.value)}
                                                placeholder="Contoh: 978-602-1234-56-7"
                                                className="text-xs font-mono"
                                            />
                                            {errors.isbn && (
                                                <p className="text-xs text-rose-500">{errors.isbn}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Stok Total & Sisa Stok */}
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="total_stock" className="text-xs font-medium">
                                                Total Stok Buku <span className="text-rose-500">*</span>
                                            </Label>
                                            <Input
                                                id="total_stock"
                                                type="number"
                                                min="0"
                                                value={data.total_stock}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setData('total_stock', val);
                                                    if (!isEdit) setData('stock', val);
                                                }}
                                                className="text-xs"
                                            />
                                            {errors.total_stock && (
                                                <p className="text-xs text-rose-500">{errors.total_stock}</p>
                                            )}
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="stock" className="text-xs font-medium">
                                                Stok Tersedia Saat Ini
                                            </Label>
                                            <Input
                                                id="stock"
                                                type="number"
                                                min="0"
                                                value={data.stock}
                                                onChange={(e) => setData('stock', e.target.value)}
                                                className="text-xs"
                                            />
                                            {errors.stock && (
                                                <p className="text-xs text-rose-500">{errors.stock}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Sinopsis */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="synopsis" className="text-xs font-medium">
                                            Sinopsis / Deskripsi Buku
                                        </Label>
                                        <Textarea
                                            id="synopsis"
                                            rows={4}
                                            value={data.synopsis}
                                            onChange={(e) => setData('synopsis', e.target.value)}
                                            placeholder="Deskripsi singkat isi atau ulasan buku..."
                                            className="text-xs leading-relaxed"
                                        />
                                        {errors.synopsis && (
                                            <p className="text-xs text-rose-500">{errors.synopsis}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-3">
                                <Button variant="outline" size="sm" asChild>
                                    <Link href="/admin/buku">Batal</Link>
                                </Button>
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={processing}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white"
                                >
                                    <Save className="size-4 mr-1.5" />
                                    {isEdit ? 'Simpan Perubahan' : 'Simpan Buku'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
