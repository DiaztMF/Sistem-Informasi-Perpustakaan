import { Head, router, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    Check,
    Edit2,
    GraduationCap,
    KeyRound,
    Plus,
    Search,
    Trash2,
    Users,
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
import AdminLayout from '@/layouts/admin-layout';

type Student = {
    id: number;
    name: string;
    nis: string;
    email: string;
    class_name: string;
    phone: string | null;
    active_loans_count?: number;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type StudentsIndexProps = {
    students: {
        data: Student[];
        links: PaginationLink[];
        current_page: number;
        last_page: number;
        total: number;
        from: number;
        to: number;
    };
    filters: {
        search?: string;
    };
};

export default function StudentsIndex({ students, filters }: StudentsIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);

    const form = useForm({
        name: '',
        nis: '',
        email: '',
        class_name: '',
        phone: '',
        password: '',
    });

    const handleFilter = (query?: string) => {
        const s = query !== undefined ? query : search;
        router.get(
            '/admin/siswa',
            { search: s || undefined },
            { preserveState: true, preserveScroll: true }
        );
    };

    const openCreateModal = () => {
        setEditingStudent(null);
        form.reset();
        form.clearErrors();
        setIsFormOpen(true);
    };

    const openEditModal = (student: Student) => {
        setEditingStudent(student);
        form.setData({
            name: student.name,
            nis: student.nis,
            email: student.email,
            class_name: student.class_name,
            phone: student.phone || '',
            password: '',
        });
        form.clearErrors();
        setIsFormOpen(true);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingStudent) {
            form.put(`/admin/siswa/${editingStudent.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsFormOpen(false);
                    form.reset();
                },
            });
        } else {
            form.post('/admin/siswa', {
                preserveScroll: true,
                onSuccess: () => {
                    setIsFormOpen(false);
                    form.reset();
                },
            });
        }
    };

    const confirmDelete = () => {
        if (!deletingStudent) return;
        router.delete(`/admin/siswa/${deletingStudent.id}`, {
            preserveScroll: true,
            onFinish: () => setDeletingStudent(null),
        });
    };

    return (
        <AdminLayout title="Manajemen Data Siswa">
            <Head title="Data Siswa - Admin Perpustakaan" />

            <div className="space-y-6">
                {/* Header & Primary Action */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Data Siswa
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Kelola data akun siswa, NIS, kelas, dan status keanggotaan perpustakaan
                        </p>
                    </div>

                    <Button
                        onClick={openCreateModal}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white"
                    >
                        <Plus className="size-4 mr-1.5" />
                        Tambah Siswa
                    </Button>
                </div>

                {/* Filter & Search */}
                <Card className="border-slate-200/80 shadow-xs dark:border-slate-800">
                    <CardContent className="p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleFilter(search)}
                                    placeholder="Cari berdasarkan nama siswa, NIS, email, atau kelas..."
                                    className="pl-9 text-xs"
                                />
                            </div>

                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleFilter()}
                                className="text-xs"
                            >
                                Cari Data
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Students Data Table */}
                <Card className="border-slate-200/80 shadow-xs dark:border-slate-800">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="border-b border-slate-200/80 bg-slate-50/75 text-slate-500 uppercase tracking-wider dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold text-center w-12">No</th>
                                        <th className="px-4 py-3 font-semibold w-28">NIS</th>
                                        <th className="px-4 py-3 font-semibold">Nama Lengkap</th>
                                        <th className="px-4 py-3 font-semibold">Kelas</th>
                                        <th className="px-4 py-3 font-semibold">Kontak</th>
                                        <th className="px-4 py-3 font-semibold text-center w-32">Pinjaman Aktif</th>
                                        <th className="px-4 py-3 font-semibold text-center w-28">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                    {students.data.length > 0 ? (
                                        students.data.map((student, index) => {
                                            const itemNo = (students.from || 1) + index;
                                            const activeCount = student.active_loans_count || 0;
                                            return (
                                                <tr
                                                    key={student.id}
                                                    className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-900/50"
                                                >
                                                    <td className="px-4 py-3 text-center text-slate-400">
                                                        {itemNo}
                                                    </td>
                                                    <td className="px-4 py-3 font-mono font-medium text-slate-900 dark:text-slate-100">
                                                        {student.nis}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="font-semibold text-slate-900 dark:text-white">
                                                            {student.name}
                                                        </div>
                                                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                                            {student.email}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Badge variant="outline" className="font-normal text-[11px]">
                                                            {student.class_name}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                                        {student.phone || '-'}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <Badge
                                                            variant={activeCount > 0 ? 'secondary' : 'outline'}
                                                            className={`text-[10px] ${activeCount > 0 ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' : 'text-slate-400'}`}
                                                        >
                                                            {activeCount} Pinjaman
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => openEditModal(student)}
                                                                className="size-8 text-slate-600 hover:text-emerald-600 dark:text-slate-300"
                                                            >
                                                                <Edit2 className="size-3.5" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => setDeletingStudent(student)}
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
                                            <td colSpan={7} className="py-12 text-center text-slate-500">
                                                <Users className="mx-auto size-8 text-slate-300 mb-2" />
                                                Tidak ada data siswa ditemukan.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {students.links.length > 3 && (
                            <div className="flex items-center justify-between border-t border-slate-200/80 px-4 py-3 dark:border-slate-800">
                                <div className="text-[11px] text-slate-500">
                                    Menampilkan {students.from || 0} - {students.to || 0} dari {students.total} siswa
                                </div>
                                <div className="flex items-center gap-1">
                                    {students.links.map((link, idx) => (
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

            {/* Modal Tambah / Edit Siswa */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                            <GraduationCap className="size-5 text-emerald-600" />
                            {editingStudent ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingStudent
                                ? 'Perbarui informasi profil dan kelas siswa.'
                                : 'Masukkan kredensial dan identitas siswa untuk pembuatan akun anggota perpustakaan.'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleFormSubmit} className="space-y-4 py-2">
                        <div className="space-y-1">
                            <Label htmlFor="nis" className="text-xs">NIS (Nomor Induk Siswa) *</Label>
                            <Input
                                id="nis"
                                value={form.data.nis}
                                onChange={(e) => form.setData('nis', e.target.value)}
                                placeholder="Contoh: 21221004"
                                className="text-xs"
                                required
                            />
                            {form.errors.nis && (
                                <p className="text-[11px] text-rose-500">{form.errors.nis}</p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="name" className="text-xs">Nama Lengkap *</Label>
                            <Input
                                id="name"
                                value={form.data.name}
                                onChange={(e) => form.setData('name', e.target.value)}
                                placeholder="Nama siswa sesuai absensi"
                                className="text-xs"
                                required
                            />
                            {form.errors.name && (
                                <p className="text-[11px] text-rose-500">{form.errors.name}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="class_name" className="text-xs">Kelas *</Label>
                                <Input
                                    id="class_name"
                                    value={form.data.class_name}
                                    onChange={(e) => form.setData('class_name', e.target.value)}
                                    placeholder="Contoh: XII RPL 1"
                                    className="text-xs"
                                    required
                                />
                                {form.errors.class_name && (
                                    <p className="text-[11px] text-rose-500">{form.errors.class_name}</p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="phone" className="text-xs">Nomor HP / WA</Label>
                                <Input
                                    id="phone"
                                    value={form.data.phone}
                                    onChange={(e) => form.setData('phone', e.target.value)}
                                    placeholder="0812xxxxxxx"
                                    className="text-xs"
                                />
                                {form.errors.phone && (
                                    <p className="text-[11px] text-rose-500">{form.errors.phone}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="email" className="text-xs">Alamat Email *</Label>
                            <Input
                                id="email"
                                type="email"
                                value={form.data.email}
                                onChange={(e) => form.setData('email', e.target.value)}
                                placeholder="siswa@sekolah.sch.id"
                                className="text-xs"
                                required
                            />
                            {form.errors.email && (
                                <p className="text-[11px] text-rose-500">{form.errors.email}</p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="password" className="text-xs flex items-center justify-between">
                                <span>Password {editingStudent && '(Kosongkan jika tidak diubah)'}</span>
                                {!editingStudent && <span className="text-[10px] text-slate-400">Default: password</span>}
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                value={form.data.password}
                                onChange={(e) => form.setData('password', e.target.value)}
                                placeholder={editingStudent ? '••••••••' : 'Default password jika dikosongkan'}
                                className="text-xs"
                            />
                            {form.errors.password && (
                                <p className="text-[11px] text-rose-500">{form.errors.password}</p>
                            )}
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0 pt-2">
                            <DialogClose asChild>
                                <Button type="button" variant="outline">
                                    Batal
                                </Button>
                            </DialogClose>
                            <Button
                                type="submit"
                                disabled={form.processing}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white"
                            >
                                <Check className="size-4 mr-1.5" />
                                {editingStudent ? 'Simpan Perubahan' : 'Tambah Siswa'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Konfirmasi Hapus */}
            <Dialog
                open={!!deletingStudent}
                onOpenChange={(open) => !open && setDeletingStudent(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-rose-600">
                            <AlertCircle className="size-5" />
                            Hapus Siswa?
                        </DialogTitle>
                        <DialogDescription>
                            Anda akan menghapus data siswa <strong>"{deletingStudent?.name}"</strong> ({deletingStudent?.nis}).
                            Tindakan ini tidak dapat dibatalkan. Jika siswa masih memiliki pinjaman buku aktif, penghapusan akan ditolak oleh sistem.
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
