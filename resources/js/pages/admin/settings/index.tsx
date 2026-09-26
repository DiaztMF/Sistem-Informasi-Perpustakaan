import { Head, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    Building2,
    Calendar,
    Clock,
    Coins,
    FileText,
    HelpCircle,
    Info,
    Mail,
    MapPin,
    Phone,
    Save,
    ShieldAlert,
} from 'lucide-react';
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/admin-layout';

type SettingsData = {
    id?: number;
    name: string;
    address: string;
    open_hours: string;
    contact_phone: string;
    contact_email: string;
    rules_text: string;
    loan_duration_days: number;
    fine_per_day: number;
    max_active_loans: number;
};

type Props = {
    settings: SettingsData | null;
};

export default function SettingsIndex({ settings }: Props) {
    const { data, setData, put, processing, errors, recentlySuccessful } = useForm({
        name: settings?.name || 'Perpustakaan SMK Bunga Bangsa',
        address: settings?.address || 'Jl. Raya Pendidikan No. 123, Jakarta Timur',
        open_hours: settings?.open_hours || 'Senin - Jumat: 07:30 - 16:00 WIB',
        contact_phone: settings?.contact_phone || '0812-3456-7890',
        contact_email: settings?.contact_email || 'perpustakaan@smkbungabangsa.sch.id',
        rules_text:
            settings?.rules_text ||
            '1. Setiap anggota wajib menjaga ketertiban, ketenangan, dan kebersihan di dalam ruang perpustakaan.\n' +
                '2. Kartu anggota perpustakaan atau NIS wajib ditunjukkan saat peminjaman buku fisik.\n' +
                '3. Peminjam bertanggung jawab penuh atas keutuhan buku yang dipinjam.\n' +
                '4. Keterlambatan pengembalian dikenakan denda sesuai ketentuan yang berlaku.\n' +
                '5. Buku yang rusak atau hilang wajib diganti dengan judul dan edisi yang sama atau setara.',
        loan_duration_days: settings?.loan_duration_days ?? 7,
        fine_per_day: settings?.fine_per_day ?? 1000,
        max_active_loans: settings?.max_active_loans ?? 2,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put('/admin/pengaturan', {
            preserveScroll: true,
        });
    };

    return (
        <AdminLayout title="Pengaturan Perpustakaan">
            <Head title="Pengaturan Perpustakaan" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Pengaturan Perpustakaan
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Konfigurasi profil institusi, kebijakan sirkulasi peminjaman, tarif denda, dan tata tertib.
                        </p>
                    </div>
                </div>

                {recentlySuccessful && (
                    <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                        <Info className="size-4 text-emerald-600 dark:text-emerald-400" />
                        <AlertTitle className="font-semibold">Berhasil Disimpan</AlertTitle>
                        <AlertDescription>
                            Pengaturan perpustakaan berhasil diperbarui dan telah diterapkan ke seluruh sistem.
                        </AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Profil Perpustakaan */}
                    <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                                <Building2 className="size-5 text-emerald-600" />
                                <CardTitle className="text-base font-bold">
                                    Profil Perpustakaan
                                </CardTitle>
                            </div>
                            <CardDescription>
                                Informasi kontak dan operasional yang ditampilkan kepada siswa dan publik.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {/* Nama */}
                                <div className="space-y-1.5 sm:col-span-2">
                                    <Label htmlFor="name" className="text-xs font-semibold">
                                        Nama Perpustakaan <span className="text-rose-500">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="cth. Perpustakaan SMK Bunga Bangsa"
                                        className={errors.name ? 'border-rose-500' : ''}
                                    />
                                    {errors.name && (
                                        <p className="text-xs text-rose-500">{errors.name}</p>
                                    )}
                                </div>

                                {/* Jam Operasional */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="open_hours" className="text-xs font-semibold">
                                        Jam Operasional <span className="text-rose-500">*</span>
                                    </Label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-2.5 size-4 text-slate-400" />
                                        <Input
                                            id="open_hours"
                                            value={data.open_hours}
                                            onChange={(e) => setData('open_hours', e.target.value)}
                                            placeholder="cth. Senin - Jumat: 08:00 - 15:00"
                                            className={`pl-9 ${errors.open_hours ? 'border-rose-500' : ''}`}
                                        />
                                    </div>
                                    {errors.open_hours && (
                                        <p className="text-xs text-rose-500">{errors.open_hours}</p>
                                    )}
                                </div>

                                {/* No. Telepon */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="contact_phone" className="text-xs font-semibold">
                                        No. Telepon / WhatsApp <span className="text-rose-500">*</span>
                                    </Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-2.5 size-4 text-slate-400" />
                                        <Input
                                            id="contact_phone"
                                            value={data.contact_phone}
                                            onChange={(e) => setData('contact_phone', e.target.value)}
                                            placeholder="cth. 08123456789"
                                            className={`pl-9 ${errors.contact_phone ? 'border-rose-500' : ''}`}
                                        />
                                    </div>
                                    {errors.contact_phone && (
                                        <p className="text-xs text-rose-500">{errors.contact_phone}</p>
                                    )}
                                </div>

                                {/* Email */}
                                <div className="space-y-1.5 sm:col-span-2">
                                    <Label htmlFor="contact_email" className="text-xs font-semibold">
                                        Alamat Email <span className="text-rose-500">*</span>
                                    </Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-2.5 size-4 text-slate-400" />
                                        <Input
                                            id="contact_email"
                                            type="email"
                                            value={data.contact_email}
                                            onChange={(e) => setData('contact_email', e.target.value)}
                                            placeholder="cth. perpustakaan@sekolah.sch.id"
                                            className={`pl-9 ${errors.contact_email ? 'border-rose-500' : ''}`}
                                        />
                                    </div>
                                    {errors.contact_email && (
                                        <p className="text-xs text-rose-500">{errors.contact_email}</p>
                                    )}
                                </div>

                                {/* Alamat */}
                                <div className="space-y-1.5 sm:col-span-2">
                                    <Label htmlFor="address" className="text-xs font-semibold">
                                        Alamat Lengkap <span className="text-rose-500">*</span>
                                    </Label>
                                    <Textarea
                                        id="address"
                                        rows={2}
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        placeholder="Alamat fisik gedung atau ruang perpustakaan"
                                        className={errors.address ? 'border-rose-500' : ''}
                                    />
                                    {errors.address && (
                                        <p className="text-xs text-rose-500">{errors.address}</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Kebijakan Peminjaman & Denda */}
                    <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                                <Coins className="size-5 text-amber-600" />
                                <CardTitle className="text-base font-bold">
                                    Kebijakan Peminjaman & Denda
                                </CardTitle>
                            </div>
                            <CardDescription>
                                Menentukan batasan kuota peminjaman siswa, masa tenggang pengembalian, dan denda harian.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                {/* Durasi Peminjaman */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="loan_duration_days" className="text-xs font-semibold">
                                        Durasi Pinjam (Hari) <span className="text-rose-500">*</span>
                                    </Label>
                                    <Input
                                        id="loan_duration_days"
                                        type="number"
                                        min={1}
                                        max={30}
                                        value={data.loan_duration_days}
                                        onChange={(e) => setData('loan_duration_days', parseInt(e.target.value) || 0)}
                                        className={errors.loan_duration_days ? 'border-rose-500' : ''}
                                    />
                                    <p className="text-[11px] text-slate-500">
                                        Default: 7 hari sebelum jatuh tempo
                                    </p>
                                    {errors.loan_duration_days && (
                                        <p className="text-xs text-rose-500">{errors.loan_duration_days}</p>
                                    )}
                                </div>

                                {/* Tarif Denda per Hari */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="fine_per_day" className="text-xs font-semibold">
                                        Denda per Hari (Rp) <span className="text-rose-500">*</span>
                                    </Label>
                                    <Input
                                        id="fine_per_day"
                                        type="number"
                                        min={0}
                                        step={500}
                                        value={data.fine_per_day}
                                        onChange={(e) => setData('fine_per_day', parseInt(e.target.value) || 0)}
                                        className={errors.fine_per_day ? 'border-rose-500' : ''}
                                    />
                                    <p className="text-[11px] text-slate-500">
                                        Dihitung per buku yang terlambat dikembalikan
                                    </p>
                                    {errors.fine_per_day && (
                                        <p className="text-xs text-rose-500">{errors.fine_per_day}</p>
                                    )}
                                </div>

                                {/* Maksimal Buku Dipinjam */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="max_active_loans" className="text-xs font-semibold">
                                        Batas Pinjaman Aktif <span className="text-rose-500">*</span>
                                    </Label>
                                    <Input
                                        id="max_active_loans"
                                        type="number"
                                        min={1}
                                        max={10}
                                        value={data.max_active_loans}
                                        onChange={(e) => setData('max_active_loans', parseInt(e.target.value) || 0)}
                                        className={errors.max_active_loans ? 'border-rose-500' : ''}
                                    />
                                    <p className="text-[11px] text-slate-500">
                                        Maksimum buku dipinjam bersamaan per siswa
                                    </p>
                                    {errors.max_active_loans && (
                                        <p className="text-xs text-rose-500">{errors.max_active_loans}</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Aturan & Tata Tertib */}
                    <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                                <FileText className="size-5 text-indigo-600" />
                                <CardTitle className="text-base font-bold">
                                    Aturan & Tata Tertib Perpustakaan
                                </CardTitle>
                            </div>
                            <CardDescription>
                                Teks tata tertib yang ditampilkan pada halaman informasi perpustakaan bagi siswa.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Textarea
                                id="rules_text"
                                rows={6}
                                value={data.rules_text}
                                onChange={(e) => setData('rules_text', e.target.value)}
                                placeholder="Tuliskan poin-poin tata tertib perpustakaan..."
                                className={`font-sans text-xs leading-relaxed ${errors.rules_text ? 'border-rose-500' : ''}`}
                            />
                            {errors.rules_text && (
                                <p className="text-xs text-rose-500">{errors.rules_text}</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Action Button */}
                    <div className="flex justify-end pt-2">
                        <Button
                            type="submit"
                            disabled={processing}
                            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 shadow-sm"
                        >
                            <Save className="size-4" />
                            {processing ? 'Menyimpan...' : 'Simpan Pengaturan'}
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
