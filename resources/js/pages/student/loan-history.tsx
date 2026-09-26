import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowRight,
    BookOpen,
    Calendar,
    Clock,
    Eye,
    FileText,
    History,
    Info,
    ShieldCheck,
} from 'lucide-react';
import StudentLayout from '@/layouts/student-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Loan } from '@/types/library';

type Props = {
    activeLoans: Loan[];
    completedLoans: Loan[];
};

export default function LoanHistory({ activeLoans, completedLoans }: Props) {
    const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

    const getStatusBadge = (status: Loan['status']) => {
        switch (status) {
            case 'diproses':
                return (
                    <Badge variant="outline" className="border-amber-400 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                        Diproses
                    </Badge>
                );
            case 'dipinjam':
                return (
                    <Badge variant="outline" className="border-blue-400 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                        Dipinjam
                    </Badge>
                );
            case 'terlambat':
                return (
                    <Badge variant="destructive">
                        Terlambat
                    </Badge>
                );
            case 'selesai':
                return (
                    <Badge variant="outline" className="border-emerald-400 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                        Selesai
                    </Badge>
                );
            case 'ditolak':
                return (
                    <Badge variant="secondary">
                        Ditolak
                    </Badge>
                );
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const renderLoanCard = (loan: Loan) => {
        const isLate = loan.status === 'terlambat';
        const hasFine = Number(loan.fine_amount) > 0;

        return (
            <Card
                key={loan.id}
                className="overflow-hidden border border-slate-200 bg-white transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
                <CardContent className="p-4 sm:p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        {/* Book preview & metadata */}
                        <div className="flex items-start gap-4">
                            <div className="relative aspect-[3/4] w-16 shrink-0 overflow-hidden rounded-md bg-slate-100 sm:w-20 dark:bg-slate-950">
                                {loan.book?.cover_image ? (
                                    <img
                                        src={`/storage/${loan.book.cover_image}`}
                                        alt={loan.book?.title || 'Cover'}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-slate-400">
                                        <BookOpen className="size-6" />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 space-y-1.5">
                                <div className="flex flex-wrap items-center gap-2">
                                    {getStatusBadge(loan.status)}
                                    <span className="font-mono text-xs text-slate-400">
                                        #{loan.loan_code}
                                    </span>
                                </div>

                                <h3 className="line-clamp-1 font-bold text-slate-900 sm:text-base dark:text-white">
                                    {loan.book?.title || 'Judul Buku Tidak Tersedia'}
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Penulis: <span className="text-slate-800 dark:text-slate-200">{loan.book?.author || '-'}</span>
                                </p>

                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs text-slate-500">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="size-3 text-slate-400" />
                                        Pinjam: {loan.loan_date}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="size-3 text-slate-400" />
                                        Jatuh Tempo: {loan.due_date}
                                    </span>
                                    {loan.return_date && (
                                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                            <ShieldCheck className="size-3" />
                                            Dikembalikan: {loan.return_date}
                                        </span>
                                    )}
                                </div>

                                {(isLate || hasFine) && (
                                    <div className="pt-1">
                                        <span className="inline-flex items-center gap-1 rounded bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                                            <AlertCircle className="size-3" />
                                            Denda: Rp {Number(loan.fine_amount).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Area */}
                        <div className="flex items-center justify-end border-t border-slate-100 pt-3 sm:border-t-0 sm:pt-0 dark:border-slate-800">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedLoan(loan)}
                                className="w-full text-xs sm:w-auto"
                            >
                                <Eye className="mr-1.5 size-3.5" />
                                Detail Peminjaman
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <StudentLayout>
            <Head title="Riwayat Peminjaman Buku" />

            <div className="border-b border-slate-200 bg-white py-6 dark:border-slate-800 dark:bg-slate-900">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                            <History className="size-5" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Riwayat Peminjaman
                            </h1>
                            <p className="text-xs text-slate-500">
                                Pantau buku yang sedang Anda pinjam serta riwayat pengembalian koleksi
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                <Tabs defaultValue="active" className="space-y-6">
                    <TabsList className="grid w-full max-w-md grid-cols-2">
                        <TabsTrigger value="active" className="text-xs sm:text-sm">
                            Sedang Dipinjam ({activeLoans.length})
                        </TabsTrigger>
                        <TabsTrigger value="completed" className="text-xs sm:text-sm">
                            Riwayat Selesai ({completedLoans.length})
                        </TabsTrigger>
                    </TabsList>

                    {/* Active Loans Tab */}
                    <TabsContent value="active" className="space-y-4">
                        {activeLoans.length > 0 ? (
                            activeLoans.map(renderLoanCard)
                        ) : (
                            <Card className="border-dashed border-slate-200 p-8 text-center dark:border-slate-800">
                                <BookOpen className="mx-auto size-12 text-slate-300 dark:text-slate-700" />
                                <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
                                    Tidak ada pinjaman aktif
                                </h3>
                                <p className="mt-1 text-xs text-slate-500">
                                    Saat ini Anda tidak memiliki buku yang sedang dipinjam atau diproses.
                                </p>
                                <Button asChild className="mt-4 bg-emerald-600 text-xs text-white hover:bg-emerald-700">
                                    <Link href="/katalog">
                                        Cari Buku di Katalog
                                        <ArrowRight className="ml-1.5 size-3.5" />
                                    </Link>
                                </Button>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Completed Loans Tab */}
                    <TabsContent value="completed" className="space-y-4">
                        {completedLoans.length > 0 ? (
                            completedLoans.map(renderLoanCard)
                        ) : (
                            <Card className="border-dashed border-slate-200 p-8 text-center dark:border-slate-800">
                                <History className="mx-auto size-12 text-slate-300 dark:text-slate-700" />
                                <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
                                    Belum ada riwayat selesai
                                </h3>
                                <p className="mt-1 text-xs text-slate-500">
                                    Buku yang telah dikembalikan atau permohonan yang ditolak akan tercatat di sini.
                                </p>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            {/* Detail Modal */}
            <Dialog open={!!selectedLoan} onOpenChange={(open) => !open && setSelectedLoan(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold">
                            Detail Transaksi Peminjaman
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            Kode Referensi: <span className="font-mono font-medium text-slate-900 dark:text-white">{selectedLoan?.loan_code}</span>
                        </DialogDescription>
                    </DialogHeader>

                    {selectedLoan && (
                        <div className="space-y-4 py-2 text-xs">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                                <span className="text-slate-500">Status Peminjaman</span>
                                <div>{getStatusBadge(selectedLoan.status)}</div>
                            </div>

                            <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-950">
                                <p className="font-semibold text-slate-900 dark:text-white">
                                    {selectedLoan.book?.title}
                                </p>
                                <p className="mt-0.5 text-slate-500">
                                    Penulis: {selectedLoan.book?.author}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 border-y border-slate-100 py-3 dark:border-slate-800">
                                <div>
                                    <span className="text-slate-400">Tanggal Pinjam</span>
                                    <p className="mt-0.5 font-medium text-slate-800 dark:text-slate-200">
                                        {selectedLoan.loan_date}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-slate-400">Jatuh Tempo</span>
                                    <p className="mt-0.5 font-medium text-slate-800 dark:text-slate-200">
                                        {selectedLoan.due_date}
                                    </p>
                                </div>
                                {selectedLoan.return_date && (
                                    <div className="col-span-2">
                                        <span className="text-slate-400">Tanggal Pengembalian Fisik</span>
                                        <p className="mt-0.5 font-medium text-emerald-600 dark:text-emerald-400">
                                            {selectedLoan.return_date}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {Number(selectedLoan.fine_amount) > 0 && (
                                <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300">
                                    <span className="font-semibold">Informasi Denda:</span>
                                    <p className="mt-0.5 font-mono text-sm font-bold">
                                        Rp {Number(selectedLoan.fine_amount).toLocaleString('id-ID')}
                                    </p>
                                    <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400">
                                        Silakan lunasi denda keterlambatan langsung kepada petugas saat mengembalikan buku.
                                    </p>
                                </div>
                            )}

                            {selectedLoan.notes && (
                                <div>
                                    <span className="font-semibold text-slate-600 dark:text-slate-400">Catatan Siswa:</span>
                                    <p className="mt-1 rounded bg-slate-50 p-2 text-slate-700 italic dark:bg-slate-950 dark:text-slate-300">
                                        "{selectedLoan.notes}"
                                    </p>
                                </div>
                            )}

                            {selectedLoan.admin_notes && (
                                <div>
                                    <span className="font-semibold text-slate-600 dark:text-slate-400">Catatan Petugas Perpustakaan:</span>
                                    <p className="mt-1 rounded border border-amber-200 bg-amber-50 p-2 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200">
                                        "{selectedLoan.admin_notes}"
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </StudentLayout>
    );
}
