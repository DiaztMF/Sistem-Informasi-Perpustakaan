import { Head, Link, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    BookOpen,
    Calendar,
    CheckCircle2,
    Clock,
    FileText,
    Layers,
    Lock,
    ShieldAlert,
    UserCheck,
} from 'lucide-react';
import StudentLayout from '@/layouts/student-layout';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { User } from '@/types/auth';
import type { Book, LibrarySetting } from '@/types/library';

type Props = {
    book: Book;
    settings: LibrarySetting | null;
    canBorrow: boolean;
    cannotBorrowReason: string | null;
};

export default function BookDetail({ book, settings, canBorrow, cannotBorrowReason }: Props) {
    const { auth } = usePage().props as { auth?: { user?: User } };
    const user = auth?.user;
    const isSiswa = user?.role === 'siswa';
    const isAvailable = book.stock > 0;

    return (
        <StudentLayout>
            <Head title={`${book.title} - Katalog Perpustakaan`} />

            {/* Breadcrumb / Top Bar */}
            <div className="border-b border-slate-200 bg-white py-4 dark:border-slate-800 dark:bg-slate-900">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <Link
                        href="/katalog"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400"
                    >
                        <ArrowLeft className="size-4" />
                        Kembali ke Katalog Buku
                    </Link>
                    {book.category && (
                        <Link href={`/katalog?category=${book.category.slug}`}>
                            <Badge variant="outline" className="text-xs">
                                {book.category.name}
                            </Badge>
                        </Link>
                    )}
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
                    {/* Left Column: Cover & Quick Status */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-24 space-y-6">
                            <Card className="overflow-hidden border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-950">
                                    {book.cover_image ? (
                                        <img
                                            src={`/storage/${book.cover_image}`}
                                            alt={book.title}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center">
                                            <BookOpen className="size-16 text-slate-300 dark:text-slate-700" />
                                            <span className="mt-3 text-sm font-medium text-slate-400">
                                                {book.title}
                                            </span>
                                        </div>
                                    )}

                                    <div className="absolute top-3 right-3">
                                        <span
                                            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${
                                                isAvailable
                                                    ? 'bg-emerald-600 text-white'
                                                    : 'bg-rose-600 text-white'
                                            }`}
                                        >
                                            {isAvailable ? (
                                                <>
                                                    <CheckCircle2 className="size-3.5" />
                                                    Tersedia
                                                </>
                                            ) : (
                                                <>
                                                    <AlertCircle className="size-3.5" />
                                                    Dipinjam / Habis
                                                </>
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </Card>

                            {/* Loan Terms Summary */}
                            <div className="rounded-xl border border-slate-200 bg-white p-4.5 dark:border-slate-800 dark:bg-slate-900">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                    Ketentuan Peminjaman
                                </h4>
                                <ul className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                                    <li className="flex items-center gap-2">
                                        <Clock className="size-4 text-emerald-600" />
                                        Durasi pinjam: <strong>{settings?.loan_duration_days ?? 7} hari</strong>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <ShieldAlert className="size-4 text-amber-600" />
                                        Denda terlambat: Rp {(settings?.fine_per_day ?? 1000).toLocaleString('id-ID')}/hari
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Layers className="size-4 text-blue-600" />
                                        Maksimal pinjam aktif: <strong>{settings?.max_active_loans ?? 3} buku</strong>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Meta, Synopsis, Action */}
                    <div className="lg:col-span-8">
                        <div>
                            {book.category && (
                                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                                    {book.category.name}
                                </span>
                            )}
                            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                                {book.title}
                            </h1>
                            <p className="mt-2 text-base text-slate-600 dark:text-slate-300">
                                Penulis: <strong className="text-slate-900 dark:text-white">{book.author}</strong>
                            </p>
                        </div>

                        {/* Metadata Grid */}
                        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                            <div className="grid grid-cols-2 divide-x divide-y divide-slate-100 sm:grid-cols-3 dark:divide-slate-800">
                                <div className="p-4">
                                    <span className="text-xs text-slate-400">Penerbit</span>
                                    <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
                                        {book.publisher}
                                    </p>
                                </div>
                                <div className="p-4">
                                    <span className="text-xs text-slate-400">Tahun Terbit</span>
                                    <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
                                        {book.publish_year}
                                    </p>
                                </div>
                                <div className="p-4">
                                    <span className="text-xs text-slate-400">ISBN</span>
                                    <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
                                        {book.isbn || '-'}
                                    </p>
                                </div>
                                <div className="p-4">
                                    <span className="text-xs text-slate-400">Sisa Stok</span>
                                    <p className="mt-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                        {book.stock} eksemplar
                                    </p>
                                </div>
                                <div className="p-4">
                                    <span className="text-xs text-slate-400">Total Koleksi</span>
                                    <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
                                        {book.total_stock} eksemplar
                                    </p>
                                </div>
                                <div className="p-4">
                                    <span className="text-xs text-slate-400">Status</span>
                                    <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
                                        {isAvailable ? 'Dapat Dipinjam' : 'Tidak Tersedia'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Synopsis */}
                        <div className="mt-8">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                Sinopsis Buku
                            </h2>
                            <div className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-line">
                                {book.synopsis || 'Belum ada sinopsis untuk buku ini.'}
                            </div>
                        </div>

                        {/* Borrow Action Area */}
                        <div className="mt-10 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                        Peminjaman Buku Ini
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        {isAvailable
                                            ? 'Buku tersedia di rak dan siap untuk diajukan peminjaman.'
                                            : 'Stok buku sedang dipinjam seluruhnya oleh siswa lain.'}
                                    </p>
                                </div>

                                <div>
                                    {!user ? (
                                        <Button asChild className="bg-emerald-600 px-6 font-semibold text-white hover:bg-emerald-700">
                                            <Link href="/login">
                                                <Lock className="mr-2 size-4" />
                                                Masuk untuk Meminjam
                                            </Link>
                                        </Button>
                                    ) : isSiswa ? (
                                        canBorrow ? (
                                            <Button asChild className="bg-emerald-600 px-6 font-semibold text-white hover:bg-emerald-700">
                                                <Link href={`/peminjaman/${book.slug}`}>
                                                    <BookOpen className="mr-2 size-4" />
                                                    Ajukan Peminjaman
                                                </Link>
                                            </Button>
                                        ) : (
                                            <Button disabled variant="secondary" className="px-6 font-medium">
                                                Tidak Dapat Meminjam
                                            </Button>
                                        )
                                    ) : (
                                        <Badge variant="outline" className="p-2 text-xs">
                                            Akun Administrator (Tidak Dapat Meminjam)
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            {/* Cannot borrow alert */}
                            {user && isSiswa && !canBorrow && cannotBorrowReason && (
                                <Alert variant="destructive" className="mt-4">
                                    <AlertCircle className="size-4" />
                                    <AlertTitle>Perhatian</AlertTitle>
                                    <AlertDescription>{cannotBorrowReason}</AlertDescription>
                                </Alert>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
}
