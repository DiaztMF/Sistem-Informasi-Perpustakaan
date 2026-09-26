import { Head, router } from '@inertiajs/react';
import {
    BookOpen,
    Calendar,
    CheckCircle2,
    Clock,
    Coins,
    Download,
    FileSpreadsheet,
    FileText,
    Filter,
    Layers,
    Printer,
    RotateCcw,
    TrendingUp,
} from 'lucide-react';
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
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
import AdminLayout from '@/layouts/admin-layout';

type Category = {
    id: number;
    name: string;
};

type Loan = {
    id: number;
    loan_code: string;
    loan_date: string | null;
    due_date: string | null;
    return_date: string | null;
    status: string;
    fine_amount: number;
    user: {
        id: number;
        name: string;
        nis: string;
        class_name: string;
    } | null;
    book: {
        id: number;
        title: string;
        category: {
            id: number;
            name: string;
        } | null;
    } | null;
};

type Summary = {
    totalLoans: number;
    totalCompleted: number;
    totalFines: number;
    mostBorrowedBooks: Array<{
        id: number;
        title: string;
        borrow_count: number;
    }>;
};

type FilterState = {
    start_date: string;
    end_date: string;
    status: string;
    category_id: string;
};

type Props = {
    loans: Loan[];
    summary: Summary;
    categories: Category[];
    filters: FilterState;
};

const formatRupiah = (val: number): string => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(val);
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

export default function ReportsIndex({ loans, summary, categories, filters }: Props) {
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [categoryId, setCategoryId] = useState(filters.category_id || 'all');

    const handleApplyFilter = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/admin/laporan',
            {
                start_date: startDate || undefined,
                end_date: endDate || undefined,
                status: status !== 'all' ? status : undefined,
                category_id: categoryId !== 'all' ? categoryId : undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleReset = () => {
        setStartDate('');
        setEndDate('');
        setStatus('all');
        setCategoryId('all');
        router.get('/admin/laporan', {}, { preserveState: true });
    };

    const handlePrint = () => {
        window.print();
    };

    const exportCsvUrl = () => {
        const params = new URLSearchParams();
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        if (status && status !== 'all') params.append('status', status);
        if (categoryId && categoryId !== 'all') params.append('category_id', categoryId);
        const query = params.toString();
        return `/admin/laporan/export-csv${query ? `?${query}` : ''}`;
    };

    const getStatusBadge = (s: string) => {
        switch (s.toLowerCase()) {
            case 'selesai':
                return (
                    <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                        Selesai
                    </Badge>
                );
            case 'dipinjam':
                return (
                    <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300">
                        Dipinjam
                    </Badge>
                );
            case 'diproses':
                return (
                    <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
                        Diproses
                    </Badge>
                );
            case 'terlambat':
                return (
                    <Badge variant="outline" className="border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
                        Terlambat
                    </Badge>
                );
            case 'ditolak':
                return (
                    <Badge variant="outline" className="border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300">
                        Ditolak
                    </Badge>
                );
            default:
                return <Badge variant="outline">{s}</Badge>;
        }
    };

    return (
        <AdminLayout title="Laporan Perpustakaan">
            <Head title="Laporan Perpustakaan" />

            {/* Custom Print Style */}
            <style>{`
                @media print {
                    aside, nav, header, .no-print, button, form {
                        display: none !important;
                    }
                    body, main {
                        background: white !important;
                        color: black !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    .print-header {
                        display: block !important;
                        margin-bottom: 24px;
                    }
                    .print-table {
                        width: 100% !important;
                        border-collapse: collapse !important;
                    }
                    .print-table th, .print-table td {
                        border: 1px solid #cbd5e1 !important;
                        padding: 6px 8px !important;
                        font-size: 11px !important;
                    }
                    .shadow-sm, .shadow {
                        box-shadow: none !important;
                    }
                }
                @media screen {
                    .print-header {
                        display: none;
                    }
                }
            `}</style>

            <div className="space-y-6">
                {/* Print Only Header */}
                <div className="print-header text-center border-b pb-4">
                    <div className="flex items-center justify-center gap-3 mb-2">
                        <BookOpen className="size-8 text-emerald-700 inline-block" />
                        <h1 className="text-xl font-bold uppercase tracking-wider">
                            Laporan Peminjaman Perpustakaan Sekolah
                        </h1>
                    </div>
                    <p className="text-xs text-slate-500">
                        Periode:{' '}
                        {startDate || endDate
                            ? `${startDate ? formatDate(startDate) : 'Awal'} s.d. ${endDate ? formatDate(endDate) : 'Sekarang'}`
                            : 'Semua Waktu'}{' '}
                        | Dicetak pada: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>

                {/* Top Header & Actions */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between no-print">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Laporan Perpustakaan
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Pantau ringkasan sirkulasi, denda terkumpul, dan cetak laporan resmi.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5">
                        <Button
                            variant="outline"
                            onClick={handlePrint}
                            className="gap-2 border-slate-300 dark:border-slate-700"
                        >
                            <Printer className="size-4 text-slate-600 dark:text-slate-300" />
                            Cetak Laporan
                        </Button>
                        <a href={exportCsvUrl()}>
                            <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                                <FileSpreadsheet className="size-4" />
                                Export CSV / Excel
                            </Button>
                        </a>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 no-print">
                    {/* Total Peminjaman */}
                    <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">
                                Total Peminjaman
                            </CardTitle>
                            <div className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                                <FileText className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                {summary.totalLoans}
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                                Transaksi pada periode terpilih
                            </p>
                        </CardContent>
                    </Card>

                    {/* Peminjaman Selesai */}
                    <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">
                                Peminjaman Selesai
                            </CardTitle>
                            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                                <CheckCircle2 className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                {summary.totalCompleted}
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                                Buku telah dikembalikan aman
                            </p>
                        </CardContent>
                    </Card>

                    {/* Total Denda */}
                    <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">
                                Total Denda Terkumpul
                            </CardTitle>
                            <div className="flex size-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                                <Coins className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                                {formatRupiah(summary.totalFines)}
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                                Akumulasi denda keterlambatan
                            </p>
                        </CardContent>
                    </Card>

                    {/* Buku Terpopuler */}
                    <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">
                                Buku Terpopuler
                            </CardTitle>
                            <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                                <TrendingUp className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm font-semibold text-slate-900 truncate dark:text-white" title={summary.mostBorrowedBooks[0]?.title}>
                                {summary.mostBorrowedBooks[0]?.title || 'Belum ada data'}
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                                {summary.mostBorrowedBooks[0]
                                    ? `${summary.mostBorrowedBooks[0].borrow_count} kali dipinjam`
                                    : 'Belum ada peminjaman'}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter Box */}
                <Card className="border-slate-200/80 shadow-sm dark:border-slate-800 no-print">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <Filter className="size-4 text-emerald-600" />
                            Filter Data Laporan
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleApplyFilter} className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 items-end">
                            {/* Start Date */}
                            <div className="space-y-1.5">
                                <Label htmlFor="start_date" className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                    Tanggal Mulai
                                </Label>
                                <Input
                                    id="start_date"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="h-9 text-xs"
                                />
                            </div>

                            {/* End Date */}
                            <div className="space-y-1.5">
                                <Label htmlFor="end_date" className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                    Tanggal Selesai
                                </Label>
                                <Input
                                    id="end_date"
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="h-9 text-xs"
                                />
                            </div>

                            {/* Status */}
                            <div className="space-y-1.5">
                                <Label htmlFor="status" className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                    Status
                                </Label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger id="status" className="h-9 text-xs">
                                        <SelectValue placeholder="Pilih status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Status</SelectItem>
                                        <SelectItem value="diproses">Diproses</SelectItem>
                                        <SelectItem value="dipinjam">Dipinjam</SelectItem>
                                        <SelectItem value="selesai">Selesai</SelectItem>
                                        <SelectItem value="terlambat">Terlambat</SelectItem>
                                        <SelectItem value="ditolak">Ditolak</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Kategori */}
                            <div className="space-y-1.5">
                                <Label htmlFor="category" className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                    Kategori Buku
                                </Label>
                                <Select value={categoryId} onValueChange={setCategoryId}>
                                    <SelectTrigger id="category" className="h-9 text-xs">
                                        <SelectValue placeholder="Semua Kategori" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Kategori</SelectItem>
                                        {categories.map((c) => (
                                            <SelectItem key={c.id} value={c.id.toString()}>
                                                {c.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Action Buttons */}
                            <div className="sm:col-span-2 md:col-span-4 flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleReset}
                                    className="text-xs text-slate-500 hover:text-slate-800"
                                >
                                    <RotateCcw className="size-3.5 mr-1.5" />
                                    Reset
                                </Button>
                                <Button
                                    type="submit"
                                    size="sm"
                                    className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                    <Filter className="size-3.5 mr-1.5" />
                                    Terapkan Filter
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Printable Report Table */}
                <Card className="border-slate-200/80 shadow-sm dark:border-slate-800 overflow-hidden">
                    <CardHeader className="py-4 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between no-print">
                        <div>
                            <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                                Riwayat Transaksi Peminjaman
                            </CardTitle>
                            <p className="text-xs text-slate-500">
                                Total {loans.length} transaksi ditemukan sesuai kriteria filter.
                            </p>
                        </div>
                    </CardHeader>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs print-table">
                            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200/80 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400">
                                <tr>
                                    <th className="px-4 py-3 text-center w-12">No</th>
                                    <th className="px-4 py-3">Kode Pinjam</th>
                                    <th className="px-4 py-3">Siswa (NIS)</th>
                                    <th className="px-4 py-3">Buku & Kategori</th>
                                    <th className="px-4 py-3">Tgl Pinjam</th>
                                    <th className="px-4 py-3">Tgl Kembali</th>
                                    <th className="px-4 py-3 text-center">Status</th>
                                    <th className="px-4 py-3 text-right">Denda</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {loans.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                                            Tidak ada data transaksi peminjaman untuk periode ini.
                                        </td>
                                    </tr>
                                ) : (
                                    loans.map((loan, idx) => (
                                        <tr key={loan.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40">
                                            <td className="px-4 py-2.5 text-center text-slate-500">
                                                {idx + 1}
                                            </td>
                                            <td className="px-4 py-2.5 font-mono font-medium text-slate-900 dark:text-white">
                                                {loan.loan_code}
                                            </td>
                                            <td className="px-4 py-2.5">
                                                <div className="font-semibold text-slate-900 dark:text-white">
                                                    {loan.user?.name || '-'}
                                                </div>
                                                <div className="text-[11px] text-slate-500">
                                                    NIS: {loan.user?.nis || '-'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-2.5">
                                                <div className="font-medium text-slate-900 dark:text-white line-clamp-1">
                                                    {loan.book?.title || '-'}
                                                </div>
                                                <div className="text-[11px] text-emerald-600 dark:text-emerald-400">
                                                    {loan.book?.category?.name || 'Umum'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-2.5 text-slate-600 dark:text-slate-300">
                                                {formatDate(loan.loan_date)}
                                            </td>
                                            <td className="px-4 py-2.5 text-slate-600 dark:text-slate-300">
                                                {formatDate(loan.return_date || loan.due_date)}
                                            </td>
                                            <td className="px-4 py-2.5 text-center">
                                                {getStatusBadge(loan.status)}
                                            </td>
                                            <td className="px-4 py-2.5 text-right font-medium text-slate-900 dark:text-white">
                                                {loan.fine_amount > 0 ? (
                                                    <span className="text-rose-600 dark:text-rose-400">
                                                        {formatRupiah(loan.fine_amount)}
                                                    </span>
                                                ) : (
                                                    '-'
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </AdminLayout>
    );
}
