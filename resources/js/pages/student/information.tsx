import { Head } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle2,
    Clock,
    FileCheck,
    Info,
    Mail,
    MapPin,
    Phone,
    Shield,
} from 'lucide-react';
import StudentLayout from '@/layouts/student-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { LibrarySetting } from '@/types/library';

type Props = {
    settings: LibrarySetting | null;
};

export default function Information({ settings }: Props) {
    const rules = settings?.rules_text
        ? settings.rules_text.split('\n').filter((line) => line.trim().length > 0)
        : [
              'Setiap siswa wajib membawa Kartu Pelajar atau NIS yang valid saat meminjam buku.',
              'Maksimal peminjaman buku adalah 3 eksemplar per siswa secara bersamaan.',
              'Durasi peminjaman standar adalah 7 hari kerja sejak tanggal pengambilan buku.',
              'Keterlambatan pengembalian buku akan dikenakan denda sesuai ketentuan perpustakaan.',
              'Dilarang mencoret, merobek, atau merusak buku koleksi perpustakaan.',
              'Buku yang hilang atau rusak berat menjadi tanggung jawab peminjam untuk mengganti.',
              'Menjaga ketenangan, ketertiban, dan kebersihan di dalam area perpustakaan.',
          ];

    return (
        <StudentLayout>
            <Head title="Informasi & Tata Tertib - Perpustakaan Sekolah" />

            <div className="border-b border-slate-200 bg-white py-10 dark:border-slate-800 dark:bg-slate-900">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        Layanan & Kebijakan
                    </span>
                    <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                        Informasi & Tata Tertib Perpustakaan
                    </h1>
                    <p className="mt-2 text-sm text-slate-500 sm:text-base dark:text-slate-400">
                        Panduan jam operasional, ketentuan peminjaman, serta tata tertib bagi seluruh civitas akademika sekolah.
                    </p>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                    {/* Left: General Info, Schedule, Contacts */}
                    <div className="space-y-6 lg:col-span-5">
                        {/* Jam Buka */}
                        <Card className="border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base text-slate-900 dark:text-white">
                                    <Clock className="size-5 text-emerald-600" />
                                    Jam Operasional
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 pt-0 text-sm">
                                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                                    <p className="font-semibold text-slate-800 dark:text-slate-100">
                                        Waktu Layanan Perpustakaan:
                                    </p>
                                    <p className="mt-1 text-slate-600 dark:text-slate-300 whitespace-pre-line">
                                        {settings?.open_hours || 'Senin - Jumat: 07.00 - 15.00 WIB\nSabtu: 07.00 - 12.00 WIB'}
                                    </p>
                                </div>
                                <p className="text-xs text-slate-500">
                                    * Hari Minggu dan Hari Libur Nasional layanan perpustakaan tutup.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Kontak & Lokasi */}
                        <Card className="border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base text-slate-900 dark:text-white">
                                    <MapPin className="size-5 text-emerald-600" />
                                    Lokasi & Kontak
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-0 text-sm">
                                <div className="flex items-start gap-3">
                                    <MapPin className="mt-0.5 size-4 shrink-0 text-slate-400" />
                                    <div>
                                        <p className="font-semibold text-slate-800 dark:text-slate-200">Alamat</p>
                                        <p className="text-slate-600 dark:text-slate-400">
                                            {settings?.address || 'Gedung Perpustakaan Utama, Lantai 2, Sekolah Menengah Atas.'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Phone className="mt-0.5 size-4 shrink-0 text-slate-400" />
                                    <div>
                                        <p className="font-semibold text-slate-800 dark:text-slate-200">Telepon / WhatsApp</p>
                                        <p className="text-slate-600 dark:text-slate-400">
                                            {settings?.contact_phone || '021-78901234'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Mail className="mt-0.5 size-4 shrink-0 text-slate-400" />
                                    <div>
                                        <p className="font-semibold text-slate-800 dark:text-slate-200">Email Resmi</p>
                                        <p className="text-slate-600 dark:text-slate-400">
                                            {settings?.contact_email || 'perpustakaan@sekolah.sch.id'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Ringkasan Biaya & Sanksi */}
                        <Card className="border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base text-slate-900 dark:text-white">
                                    <Shield className="size-5 text-emerald-600" />
                                    Ketentuan Pokok
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 pt-0 text-sm">
                                <div className="flex justify-between border-b border-slate-100 py-2 dark:border-slate-800">
                                    <span className="text-slate-500">Maks. Peminjaman Aktif</span>
                                    <strong className="text-slate-800 dark:text-slate-200">
                                        {settings?.max_active_loans ?? 3} Buku
                                    </strong>
                                </div>
                                <div className="flex justify-between border-b border-slate-100 py-2 dark:border-slate-800">
                                    <span className="text-slate-500">Masa Peminjaman</span>
                                    <strong className="text-slate-800 dark:text-slate-200">
                                        {settings?.loan_duration_days ?? 7} Hari
                                    </strong>
                                </div>
                                <div className="flex justify-between py-2">
                                    <span className="text-slate-500">Denda Keterlambatan</span>
                                    <strong className="text-rose-600">
                                        Rp {(settings?.fine_per_day ?? 1000).toLocaleString('id-ID')} / hari / buku
                                    </strong>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right: Rules and Regulations */}
                    <div className="lg:col-span-7">
                        <Card className="border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg text-slate-900 dark:text-white">
                                    <FileCheck className="size-5 text-emerald-600" />
                                    Tata Tertib & Ketentuan Anggota
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    {rules.map((rule, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-950/40"
                                        >
                                            <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                                {idx + 1}
                                            </div>
                                            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                                                {rule}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300">
                                    <div className="flex items-center gap-2 font-bold">
                                        <AlertCircle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                                        <span>Catatan Penting Pengembalian Buku</span>
                                    </div>
                                    <p className="mt-1">
                                        Harap mengembalikan buku tepat waktu sebelum tanggal jatuh tempo. Pengembalian buku yang terlambat akan menghambat siswa lain yang membutuhkan buku tersebut dan akan memberlakukan denda otomatis pada akun peminjam.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
}
