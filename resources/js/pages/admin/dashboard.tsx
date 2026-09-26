import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    ArrowUpRight,
    BookCheck,
    BookmarkCheck,
    BookOpen,
    Clock,
    FolderKanban,
    TrendingUp,
    Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdminLayout from '@/layouts/admin-layout';

type DashboardProps = {
    metrics: {
        totalBooks: number;
        totalStudents: number;
        activeLoans: number;
        totalCategories: number;
    };
    loansChart: Array<{
        date: string;
        count: number;
    }>;
    recentBooks: Array<{
        id: number;
        title: string;
        slug: string;
        author: string;
        stock: number;
        total_stock: number;
        cover_image: string | null;
        category?: { name: string };
    }>;
    recentLoans: Array<{
        id: number;
        loan_code: string;
        loan_date: string;
        due_date: string;
        status: string;
        user?: { name: string; email: string };
        book?: { title: string };
    }>;
};

export default function AdminDashboard({
    metrics,
    loansChart,
    recentBooks,
    recentLoans,
}: DashboardProps) {
    const maxCount = Math.max(...loansChart.map((d) => d.count), 5);

    return (
        <AdminLayout title="Dashboard Administrator">
            <Head title="Admin Dashboard - Sistem Informasi Perpustakaan" />

            <div className="space-y-6">
                {/* Metric Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-slate-200/80 shadow-xs dark:border-slate-800">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">
                                Total Buku
                            </CardTitle>
                            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                                <BookOpen className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                {metrics.totalBooks.toLocaleString('id-ID')}
                            </div>
                            <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">
                                Koleksi fisik & digital
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200/80 shadow-xs dark:border-slate-800">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">
                                Total Siswa
                            </CardTitle>
                            <div className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                                <Users className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                {metrics.totalStudents.toLocaleString('id-ID')}
                            </div>
                            <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">
                                Anggota aktif terdaftar
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200/80 shadow-xs dark:border-slate-800">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">
                                Sedang Dipinjam
                            </CardTitle>
                            <div className="flex size-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                                <Clock className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                {metrics.activeLoans.toLocaleString('id-ID')}
                            </div>
                            <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">
                                Buku dalam masa pinjam
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200/80 shadow-xs dark:border-slate-800">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">
                                Kategori Buku
                            </CardTitle>
                            <div className="flex size-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
                                <FolderKanban className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                {metrics.totalCategories.toLocaleString('id-ID')}
                            </div>
                            <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">
                                Klasifikasi koleksi buku
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Loans Activity Chart */}
                <Card className="border-slate-200/80 shadow-xs dark:border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <div>
                            <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
                                Aktivitas Peminjaman (7 Hari Terakhir)
                            </CardTitle>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Tren peminjaman harian oleh siswa
                            </p>
                        </div>
                        <Badge variant="outline" className="flex items-center gap-1 text-xs">
                            <TrendingUp className="size-3 text-emerald-600" />
                            Live Data
                        </Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="flex h-52 items-end justify-between gap-2 pt-6">
                            {loansChart.map((item, idx) => {
                                const heightPercent = Math.max(8, Math.round((item.count / maxCount) * 100));
                                return (
                                    <div key={idx} className="flex flex-1 flex-col items-center gap-2">
                                        <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                                            {item.count}
                                        </span>
                                        <div className="relative w-full max-w-[48px] rounded-t-lg bg-slate-100 dark:bg-slate-800/80 h-36 flex items-end justify-center p-1">
                                            <div
                                                style={{ height: `${heightPercent}%` }}
                                                className="w-full rounded-md bg-emerald-600 transition-all duration-500 hover:bg-emerald-500 dark:bg-emerald-500"
                                            />
                                        </div>
                                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                            {item.date}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Tables Section */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Recent Books */}
                    <Card className="border-slate-200/80 shadow-xs dark:border-slate-800">
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <div>
                                <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
                                    Buku Terbaru
                                </CardTitle>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    5 judul buku terakhir yang ditambahkan
                                </p>
                            </div>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/admin/buku" className="text-xs text-emerald-600 dark:text-emerald-400">
                                    Lihat Semua
                                    <ArrowRight className="size-3.5 ml-1" />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                {recentBooks.length > 0 ? (
                                    recentBooks.map((book) => (
                                        <div key={book.id} className="flex items-center justify-between px-6 py-3 hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 shrink-0 overflow-hidden rounded-md bg-slate-100 border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                                                    {book.cover_image ? (
                                                        <img
                                                            src={`/storage/${book.cover_image}`}
                                                            alt={book.title}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center text-slate-400">
                                                            <BookOpen className="size-4" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="truncate text-xs font-medium text-slate-900 dark:text-white">
                                                        {book.title}
                                                    </p>
                                                    <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                                                        {book.author} • {book.category?.name || 'Tanpa Kategori'}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge
                                                variant={book.stock > 0 ? 'secondary' : 'destructive'}
                                                className="text-[10px]"
                                            >
                                                {book.stock > 0 ? `Sisa: ${book.stock}` : 'Habis'}
                                            </Badge>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-6 text-center text-xs text-slate-500">
                                        Belum ada data buku.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pending & Active Loans */}
                    <Card className="border-slate-200/80 shadow-xs dark:border-slate-800">
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <div>
                                <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
                                    Peminjaman Perlu Tindakan
                                </CardTitle>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Pengajuan atau pinjaman yang aktif/terlambat
                                </p>
                            </div>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/admin/peminjaman" className="text-xs text-emerald-600 dark:text-emerald-400">
                                    Buka Peminjaman
                                    <ArrowUpRight className="size-3.5 ml-1" />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                {recentLoans.length > 0 ? (
                                    recentLoans.map((loan) => (
                                        <div key={loan.id} className="flex items-center justify-between px-6 py-3 hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                                        {loan.loan_code}
                                                    </span>
                                                    <span className="truncate text-xs font-medium text-slate-900 dark:text-white">
                                                        {loan.book?.title}
                                                    </span>
                                                </div>
                                                <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                                                    Peminjam: {loan.user?.name}
                                                </p>
                                            </div>
                                            <Badge
                                                variant={
                                                    loan.status === 'diproses'
                                                        ? 'outline'
                                                        : loan.status === 'terlambat'
                                                          ? 'destructive'
                                                          : 'secondary'
                                                }
                                                className="text-[10px] capitalize"
                                            >
                                                {loan.status}
                                            </Badge>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-6 text-center text-xs text-slate-500">
                                        Tidak ada peminjaman yang memerlukan tindakan mendesak.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
