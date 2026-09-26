import { Head, router, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowDownLeft,
    BookOpen,
    Check,
    CheckCircle2,
    Clock,
    FileText,
    History,
    Search,
    X,
    XCircle,
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/admin-layout';

type User = {
    id: number;
    name: string;
    nis: string;
    email: string;
    class_name: string;
    phone: string | null;
};

type Book = {
    id: number;
    title: string;
    slug: string;
    author: string;
    publisher: string;
    cover_image: string | null;
};

type Loan = {
    id: number;
    loan_code: string;
    user_id: number;
    book_id: number;
    loan_date: string;
    due_date: string;
    return_date: string | null;
    status: 'diproses' | 'dipinjam' | 'selesai' | 'terlambat' | 'ditolak';
    notes: string | null;
    admin_notes: string | null;
    fine_amount: string | number;
    user?: User;
    book?: Book;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type LoansIndexProps = {
    loans: {
        data: Loan[];
        links: PaginationLink[];
        current_page: number;
        last_page: number;
        total: number;
        from: number;
        to: number;
    };
    filters: {
        status?: string;
        search?: string;
    };
    statusCounts: Record<string, number>;
};

export default function LoansIndex({
    loans,
    filters,
    statusCounts,
}: LoansIndexProps) {
    const currentStatus = filters.status || 'semua';
    const [search, setSearch] = useState(filters.search || '');

    // Action dialog states
    const [approvingLoan, setApprovingLoan] = useState<Loan | null>(null);
    const [returningLoan, setReturningLoan] = useState<Loan | null>(null);
    const [rejectingLoan, setRejectingLoan] = useState<Loan | null>(null);
    const [viewingDetailLoan, setViewingDetailLoan] = useState<Loan | null>(null);

    const rejectForm = useForm({
        admin_notes: '',
    });

    const handleFilter = (statusTab?: string, query?: string) => {
        const s = statusTab !== undefined ? statusTab : currentStatus;
        const q = query !== undefined ? query : search;

        router.get(
            '/admin/peminjaman',
            {
                status: s !== 'semua' ? s : undefined,
                search: q || undefined,
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    const confirmApprove = () => {
        if (!approvingLoan) return;
        router.post(`/admin/peminjaman/${approvingLoan.id}/setujui`, {}, {
            preserveScroll: true,
            onFinish: () => setApprovingLoan(null),
        });
    };

    const confirmReturn = () => {
        if (!returningLoan) return;
        router.post(`/admin/peminjaman/${returningLoan.id}/kembali`, {}, {
            preserveScroll: true,
            onFinish: () => setReturningLoan(null),
        });
    };

    const confirmReject = (e: React.FormEvent) => {
        e.preventDefault();
        if (!rejectingLoan) return;
        rejectForm.post(`/admin/peminjaman/${rejectingLoan.id}/tolak`, {
            preserveScroll: true,
            onSuccess: () => {
                setRejectingLoan(null);
                rejectForm.reset();
            },
        });
    };

    const formatDate = (dateStr: string | null): string => {
        if (!dateStr) return '-';
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            });
        } catch {
            return dateStr;
        }
    };

    const getStatusBadge = (status: Loan['status']) => {
        switch (status) {
            case 'diproses':
                return (
                    <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        Diproses
                    </Badge>
                );
            case 'dipinjam':
                return (
                    <Badge variant="outline" className="border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400">
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
                    <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        Selesai
                    </Badge>
                );
            case 'ditolak':
                return (
                    <Badge variant="outline" className="border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400">
                        Ditolak
                    </Badge>
                );
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    // Calculate late estimation for return preview modal
    const calculateReturnLateEstimate = (loan: Loan) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = new Date(loan.due_date);
        dueDate.setHours(0, 0, 0, 0);

        if (today > dueDate) {
            const diffTime = Math.abs(today.getTime() - dueDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return {
                isLate: true,
                daysLate: diffDays,
                fineEstimate: diffDays * 1000,
            };
        }

        return {
            isLate: false,
            daysLate: 0,
            fineEstimate: 0,
        };
    };

    const statusTabs: { key: string; label: string }[] = [
        { key: 'semua', label: 'Semua' },
        { key: 'diproses', label: 'Diproses' },
        { key: 'dipinjam', label: 'Dipinjam' },
        { key: 'selesai', label: 'Selesai' },
        { key: 'terlambat', label: 'Terlambat' },
        { key: 'ditolak', label: 'Ditolak' },
    ];

    return (
        <AdminLayout title="Sirkulasi Peminjaman Buku">
            <Head title="Data Peminjaman - Admin Perpustakaan" />

            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Data Peminjaman
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Kelola verifikasi penyerahan buku, proses pengembalian, dan denda keterlambatan
                    </p>
                </div>

                {/* Status Tabs with Badges */}
                <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 pb-2 dark:border-slate-800">
                    {statusTabs.map((tab) => {
                        const isActive = currentStatus === tab.key;
                        const count = statusCounts[tab.key] || 0;
                        return (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => handleFilter(tab.key)}
                                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                                    isActive
                                        ? 'bg-emerald-600 text-white shadow-xs'
                                        : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                                }`}
                            >
                                <span>{tab.label}</span>
                                <span
                                    className={`inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none ${
                                        isActive
                                            ? 'bg-emerald-700/50 text-emerald-100'
                                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                                    }`}
                                >
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Search Bar */}
                <Card className="border-slate-200/80 shadow-xs dark:border-slate-800">
                    <CardContent className="p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleFilter(undefined, search)}
                                    placeholder="Cari kode pinjam, nama siswa, NIS, atau judul buku..."
                                    className="pl-9 text-xs"
                                />
                            </div>

                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleFilter(undefined, search)}
                                className="text-xs"
                            >
                                Cari Data
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Data Table Matching Mockup 10 */}
                <Card className="border-slate-200/80 shadow-xs dark:border-slate-800">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="border-b border-slate-200/80 bg-slate-50/75 text-slate-500 uppercase tracking-wider dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold text-center w-12">No</th>
                                        <th className="px-4 py-3 font-semibold">Nama Siswa & NIS</th>
                                        <th className="px-4 py-3 font-semibold">Judul Buku</th>
                                        <th className="px-4 py-3 font-semibold text-center">Tgl Pinjam</th>
                                        <th className="px-4 py-3 font-semibold text-center">Tgl Kembali / Jatuh Tempo</th>
                                        <th className="px-4 py-3 font-semibold text-center">Status</th>
                                        <th className="px-4 py-3 font-semibold text-center">Denda</th>
                                        <th className="px-4 py-3 font-semibold text-center w-36">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                    {loans.data.length > 0 ? (
                                        loans.data.map((loan, index) => {
                                            const itemNo = (loans.from || 1) + index;
                                            const fine = Number(loan.fine_amount) || 0;

                                            return (
                                                <tr
                                                    key={loan.id}
                                                    className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-900/50"
                                                >
                                                    <td className="px-4 py-3 text-center text-slate-400">
                                                        {itemNo}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="font-semibold text-slate-900 dark:text-white">
                                                            {loan.user?.name || 'Siswa'}
                                                        </div>
                                                        <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                                                            NIS: {loan.user?.nis || '-'} • {loan.user?.class_name || '-'}
                                                        </div>
                                                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                                                            {loan.loan_code}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="font-medium text-slate-900 dark:text-white line-clamp-1">
                                                            {loan.book?.title || 'Judul Buku'}
                                                        </div>
                                                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                                            {loan.book?.author || '-'}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-center text-slate-600 dark:text-slate-300">
                                                        {formatDate(loan.loan_date)}
                                                    </td>
                                                    <td className="px-4 py-3 text-center text-slate-600 dark:text-slate-300">
                                                        {loan.return_date ? (
                                                            <div className="text-emerald-600 dark:text-emerald-400 font-medium">
                                                                Kembali: {formatDate(loan.return_date)}
                                                            </div>
                                                        ) : (
                                                            <div>
                                                                Tempo: {formatDate(loan.due_date)}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        {getStatusBadge(loan.status)}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        {fine > 0 ? (
                                                            <span className="font-semibold text-rose-600 dark:text-rose-400">
                                                                Rp {fine.toLocaleString('id-ID')}
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-400">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        {loan.status === 'diproses' && (
                                                            <div className="flex items-center justify-center gap-1.5">
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => setApprovingLoan(loan)}
                                                                    className="h-7 bg-emerald-600 px-2 text-[11px] hover:bg-emerald-500 text-white"
                                                                >
                                                                    <Check className="size-3 mr-1" />
                                                                    Setujui
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => {
                                                                        setRejectingLoan(loan);
                                                                        rejectForm.reset();
                                                                    }}
                                                                    className="h-7 border-rose-200 px-2 text-[11px] text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-400"
                                                                >
                                                                    <X className="size-3 mr-1" />
                                                                    Tolak
                                                                </Button>
                                                            </div>
                                                        )}

                                                        {(loan.status === 'dipinjam' || loan.status === 'terlambat') && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => setReturningLoan(loan)}
                                                                className="h-7 bg-sky-600 px-2.5 text-[11px] hover:bg-sky-500 text-white"
                                                            >
                                                                <ArrowDownLeft className="size-3 mr-1" />
                                                                Kembalikan
                                                            </Button>
                                                        )}

                                                        {(loan.status === 'selesai' || loan.status === 'ditolak') && (
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => setViewingDetailLoan(loan)}
                                                                className="h-7 px-2 text-[11px] text-slate-600 hover:text-slate-900 dark:text-slate-300"
                                                            >
                                                                <FileText className="size-3 mr-1" />
                                                                Detail
                                                            </Button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={8} className="py-12 text-center text-slate-500">
                                                <History className="mx-auto size-8 text-slate-300 mb-2" />
                                                Tidak ada data peminjaman ditemukan.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {loans.links.length > 3 && (
                            <div className="flex items-center justify-between border-t border-slate-200/80 px-4 py-3 dark:border-slate-800">
                                <div className="text-[11px] text-slate-500">
                                    Menampilkan {loans.from || 0} - {loans.to || 0} dari {loans.total} peminjaman
                                </div>
                                <div className="flex items-center gap-1">
                                    {loans.links.map((link, idx) => (
                                        <Button
                                            key={idx}
                                            variant={link.active ? 'default' : 'ghost'}
                                            size="sm"
                                            disabled={!link.url}
                                            onClick={() => link.url && router.get(link.url, {}, { preserveScroll: true })}
                                            className={`h-7 px-2.5 text-xs ${link.active ? 'bg-emerald-600 text-white' : ''}`}
                                        >
                                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Modal Serahkan Buku (Approve) */}
            <Dialog
                open={!!approvingLoan}
                onOpenChange={(open) => !open && setApprovingLoan(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-emerald-600">
                            <CheckCircle2 className="size-5" />
                            Serahkan Buku Fisik?
                        </DialogTitle>
                        <DialogDescription>
                            Konfirmasi penyerahan buku kepada siswa <strong>{approvingLoan?.user?.name}</strong>.
                            Status peminjaman akan berubah menjadi <strong>Dipinjam</strong> dan tenggat waktu pengembalian akan dimulai per hari ini.
                        </DialogDescription>
                    </DialogHeader>

                    {approvingLoan && (
                        <div className="rounded-lg bg-slate-50 p-3 text-xs space-y-1 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                            <div><strong>Buku:</strong> {approvingLoan.book?.title}</div>
                            <div><strong>NIS / Siswa:</strong> {approvingLoan.user?.nis} - {approvingLoan.user?.name} ({approvingLoan.user?.class_name})</div>
                            <div><strong>Kode Pinjam:</strong> {approvingLoan.loan_code}</div>
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:gap-0">
                        <DialogClose asChild>
                            <Button variant="outline">Batal</Button>
                        </DialogClose>
                        <Button
                            onClick={confirmApprove}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white"
                        >
                            Konfirmasi Serahkan Buku
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal Tolak Peminjaman */}
            <Dialog
                open={!!rejectingLoan}
                onOpenChange={(open) => !open && setRejectingLoan(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-rose-600">
                            <XCircle className="size-5" />
                            Tolak Pengajuan Peminjaman
                        </DialogTitle>
                        <DialogDescription>
                            Berikan alasan penolakan untuk pengajuan peminjaman <strong>{rejectingLoan?.loan_code}</strong>.
                            Stok buku akan dikembalikan secara otomatis.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={confirmReject} className="space-y-4">
                        <div className="space-y-1">
                            <Label htmlFor="admin_notes" className="text-xs">Alasan Penolakan *</Label>
                            <Textarea
                                id="admin_notes"
                                value={rejectForm.data.admin_notes}
                                onChange={(e) => rejectForm.setData('admin_notes', e.target.value)}
                                placeholder="Contoh: Buku sedang dalam perbaikan fisik atau siswa memiliki riwayat denda yang belum terselesaikan."
                                rows={3}
                                className="text-xs"
                                required
                            />
                            {rejectForm.errors.admin_notes && (
                                <p className="text-[11px] text-rose-500">{rejectForm.errors.admin_notes}</p>
                            )}
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0">
                            <DialogClose asChild>
                                <Button type="button" variant="outline">
                                    Batal
                                </Button>
                            </DialogClose>
                            <Button
                                type="submit"
                                disabled={rejectForm.processing}
                                className="bg-rose-600 hover:bg-rose-500 text-white"
                            >
                                Tolak Pengajuan
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Proses Pengembalian (Return) */}
            <Dialog
                open={!!returningLoan}
                onOpenChange={(open) => !open && setReturningLoan(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-sky-600">
                            <ArrowDownLeft className="size-5" />
                            Proses Pengembalian Buku
                        </DialogTitle>
                        <DialogDescription>
                            Konfirmasi bahwa buku fisik telah diterima kembali di perpustakaan dalam kondisi baik.
                        </DialogDescription>
                    </DialogHeader>

                    {returningLoan && (() => {
                        const estimate = calculateReturnLateEstimate(returningLoan);
                        return (
                            <div className="space-y-3">
                                <div className="rounded-lg bg-slate-50 p-3 text-xs space-y-1 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                    <div><strong>Judul Buku:</strong> {returningLoan.book?.title}</div>
                                    <div><strong>Peminjam:</strong> {returningLoan.user?.name} ({returningLoan.user?.nis})</div>
                                    <div><strong>Tgl Pinjam:</strong> {formatDate(returningLoan.loan_date)}</div>
                                    <div><strong>Jatuh Tempo:</strong> {formatDate(returningLoan.due_date)}</div>
                                </div>

                                {estimate.isLate ? (
                                    <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
                                        <div className="flex items-center gap-1.5 font-semibold text-rose-700 dark:text-rose-400">
                                            <AlertCircle className="size-4" />
                                            Keterlambatan Terdeteksi!
                                        </div>
                                        <p className="mt-1">
                                            Pengembalian melewati jatuh tempo sebanyak <strong>{estimate.daysLate} hari</strong>.
                                        </p>
                                        <p className="mt-1 text-sm font-bold">
                                            Estimasi Denda: Rp {estimate.fineEstimate.toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                                        <div className="flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400">
                                            <CheckCircle2 className="size-4" />
                                            Pengembalian Tepat Waktu
                                        </div>
                                        <p className="mt-1">
                                            Buku dikembalikan sesuai jadwal. Tidak dikenakan biaya denda.
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    })()}

                    <DialogFooter className="gap-2 sm:gap-0">
                        <DialogClose asChild>
                            <Button variant="outline">Batal</Button>
                        </DialogClose>
                        <Button
                            onClick={confirmReturn}
                            className="bg-sky-600 hover:bg-sky-500 text-white"
                        >
                            Selesaikan Pengembalian
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal Detail Peminjaman */}
            <Dialog
                open={!!viewingDetailLoan}
                onOpenChange={(open) => !open && setViewingDetailLoan(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <BookOpen className="size-5 text-emerald-600" />
                            Detail Riwayat Peminjaman
                        </DialogTitle>
                    </DialogHeader>

                    {viewingDetailLoan && (
                        <div className="space-y-3 text-xs">
                            <div className="rounded-lg bg-slate-50 p-3 space-y-2 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                <div className="flex justify-between items-center border-b border-slate-200 pb-2 dark:border-slate-800">
                                    <span className="font-semibold text-slate-500">Kode Peminjaman</span>
                                    <span className="font-mono font-bold text-emerald-600">{viewingDetailLoan.loan_code}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500">Nama Siswa</span>
                                    <span className="font-medium text-slate-900 dark:text-white">{viewingDetailLoan.user?.name}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500">NIS / Kelas</span>
                                    <span>{viewingDetailLoan.user?.nis} • {viewingDetailLoan.user?.class_name}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500">Judul Buku</span>
                                    <span className="font-medium text-slate-900 dark:text-white">{viewingDetailLoan.book?.title}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500">Status</span>
                                    <span>{getStatusBadge(viewingDetailLoan.status)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500">Tanggal Pinjam</span>
                                    <span>{formatDate(viewingDetailLoan.loan_date)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500">Jatuh Tempo</span>
                                    <span>{formatDate(viewingDetailLoan.due_date)}</span>
                                </div>
                                {viewingDetailLoan.return_date && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500">Tanggal Kembali</span>
                                        <span className="text-emerald-600 font-semibold">{formatDate(viewingDetailLoan.return_date)}</span>
                                    </div>
                                )}
                                {Number(viewingDetailLoan.fine_amount) > 0 && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500">Denda Keterlambatan</span>
                                        <span className="text-rose-600 font-bold">
                                            Rp {Number(viewingDetailLoan.fine_amount).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                )}
                                {viewingDetailLoan.admin_notes && (
                                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                                        <span className="text-slate-500 block mb-1">Catatan Admin:</span>
                                        <p className="rounded bg-rose-50 p-2 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                                            {viewingDetailLoan.admin_notes}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Tutup</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
