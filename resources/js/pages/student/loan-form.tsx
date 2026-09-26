import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    BookOpen,
    Calendar,
    Clock,
    FileText,
    Info,
    Send,
} from 'lucide-react';
import StudentLayout from '@/layouts/student-layout';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Book, LibrarySetting } from '@/types/library';

type Props = {
    book: Book;
    loanDate: string;
    dueDate: string;
    settings: LibrarySetting;
};

export default function LoanForm({ book, loanDate, dueDate, settings }: Props) {
    const { data, setData, post, processing, errors } = useForm<{
        notes: string;
        book?: string;
        loan?: string;
    }>({
        notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/peminjaman/${book.slug}`);
    };

    return (
        <StudentLayout>
            <Head title={`Form Pengajuan Peminjaman - ${book.title}`} />

            <div className="border-b border-slate-200 bg-white py-4 dark:border-slate-800 dark:bg-slate-900">
                <div className="mx-auto flex max-w-4xl items-center justify-between px-4 sm:px-6">
                    <Link
                        href={`/buku/${book.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400"
                    >
                        <ArrowLeft className="size-4" />
                        Kembali ke Detail Buku
                    </Link>
                    {book.category && (
                        <Badge variant="outline" className="text-xs">
                            {book.category.name}
                        </Badge>
                    )}
                </div>
            </div>

            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                        Form Pengajuan Peminjaman
                    </h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Isi form di bawah ini untuk mengajukan permohonan peminjaman buku ke petugas perpustakaan.
                    </p>
                </div>

                {errors.book && (
                    <Alert variant="destructive" className="mb-6">
                        <Info className="size-4" />
                        <AlertTitle>Gagal Mengajukan</AlertTitle>
                        <AlertDescription>{errors.book}</AlertDescription>
                    </Alert>
                )}

                {errors.loan && (
                    <Alert variant="destructive" className="mb-6">
                        <Info className="size-4" />
                        <AlertTitle>Batas Peminjaman</AlertTitle>
                        <AlertDescription>{errors.loan}</AlertDescription>
                    </Alert>
                )}

                <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                    {/* Book Preview Card */}
                    <div className="md:col-span-5">
                        <Card className="overflow-hidden border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <CardHeader className="bg-slate-50/50 pb-3 dark:bg-slate-950/50">
                                <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white">
                                    Buku yang Dipinjam
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Informasi koleksi perpustakaan
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-4">
                                <div className="flex gap-4">
                                    <div className="relative aspect-[3/4] w-24 shrink-0 overflow-hidden rounded-md bg-slate-100 dark:bg-slate-950">
                                        {book.cover_image ? (
                                            <img
                                                src={`/storage/${book.cover_image}`}
                                                alt={book.title}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-slate-400">
                                                <BookOpen className="size-8" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-1 flex-col justify-between">
                                        <div>
                                            <h3 className="line-clamp-2 text-sm font-bold text-slate-900 dark:text-white">
                                                {book.title}
                                            </h3>
                                            <p className="mt-1 text-xs text-slate-500">
                                                Penulis: <span className="text-slate-800 dark:text-slate-200">{book.author}</span>
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                Penerbit: <span className="text-slate-800 dark:text-slate-200">{book.publisher}</span>
                                            </p>
                                        </div>
                                        <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2 text-xs dark:border-slate-800">
                                            <span className="text-slate-500">Sisa Stok:</span>
                                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                                {book.stock} eksemplar
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Rules card */}
                        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200">
                            <h4 className="font-bold flex items-center gap-1.5">
                                <Info className="size-3.5 text-amber-600" />
                                Ketentuan Peminjaman
                            </h4>
                            <ul className="mt-2 list-inside list-disc space-y-1 text-amber-800 dark:text-amber-300">
                                <li>Durasi peminjaman standar adalah {settings?.loan_duration_days ?? 7} hari kerja.</li>
                                <li>Maksimal buku aktif yang dapat dipinjam adalah {settings?.max_active_loans ?? 2} buku.</li>
                                <li>Keterlambatan dikenakan denda Rp {(settings?.fine_per_day ?? 1000).toLocaleString('id-ID')}/hari/buku.</li>
                                <li>Harap membawa kartu pelajar saat pengambilan buku fisik di perpustakaan.</li>
                            </ul>
                        </div>
                    </div>

                    {/* Borrow Form Area */}
                    <div className="md:col-span-7">
                        <Card className="border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <CardHeader className="border-b border-slate-100 pb-4 dark:border-slate-800">
                                <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
                                    Detail Permohonan Pinjam
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Verifikasi tanggal dan tambahkan catatan jika diperlukan
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {/* Tanggal Pinjam */}
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            <Calendar className="size-3.5 text-emerald-600" />
                                            Tanggal Pinjam
                                        </Label>
                                        <input
                                            type="text"
                                            value={loanDate}
                                            disabled
                                            readOnly
                                            className="w-full rounded-md border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-600 shadow-sm cursor-not-allowed dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400"
                                        />
                                        <p className="text-[11px] text-slate-500">
                                            Pengajuan dicatat per tanggal hari ini.
                                        </p>
                                    </div>

                                    {/* Tanggal Kembali (Estimasi Jatuh Tempo) */}
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            <Clock className="size-3.5 text-blue-600" />
                                            Tanggal Kembali (Estimasi Jatuh Tempo)
                                        </Label>
                                        <input
                                            type="text"
                                            value={dueDate}
                                            disabled
                                            readOnly
                                            className="w-full rounded-md border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-600 shadow-sm cursor-not-allowed dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400"
                                        />
                                        <p className="text-[11px] text-slate-500">
                                            Otomatis dihitung {settings?.loan_duration_days ?? 7} hari sejak pengajuan disetujui.
                                        </p>
                                    </div>

                                    {/* Catatan Tambahan (Opsional) */}
                                    <div className="space-y-2">
                                        <Label htmlFor="notes" className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            <FileText className="size-3.5 text-slate-500" />
                                            Catatan untuk Petugas (Opsional)
                                        </Label>
                                        <Textarea
                                            id="notes"
                                            rows={3}
                                            value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value)}
                                            placeholder="Contoh: Digunakan untuk referensi tugas kelompok kelas 12..."
                                            className="resize-none text-sm"
                                        />
                                        {errors.notes && (
                                            <p className="text-xs text-rose-500">{errors.notes}</p>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center justify-end gap-3 pt-3">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            asChild
                                            className="text-xs"
                                        >
                                            <Link href={`/buku/${book.slug}`}>
                                                Batal
                                            </Link>
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-700"
                                        >
                                            <Send className="mr-1.5 size-3.5" />
                                            {processing ? 'Memproses...' : 'Ajukan Peminjaman'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
}
