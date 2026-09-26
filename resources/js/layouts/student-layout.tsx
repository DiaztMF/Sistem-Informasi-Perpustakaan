import { Link, usePage } from '@inertiajs/react';
import { BookOpen, HelpCircle, LogOut, Menu, User as UserIcon, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useInitials } from '@/hooks/use-initials';
import type { User } from '@/types/auth';

type StudentLayoutProps = {
    children: ReactNode;
};

export default function StudentLayout({ children }: StudentLayoutProps) {
    const { auth } = usePage().props as { auth?: { user?: User } };
    const user = auth?.user;
    const getInitials = useInitials();
    const [mobileOpen, setMobileOpen] = useState(false);

    const isSiswa = user?.role === 'siswa';
    const isAdmin = user?.role === 'admin';

    return (
        <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100">
            {/* Header */}
            <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    {/* Brand */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm transition-transform group-hover:scale-105">
                            <BookOpen className="size-5" />
                        </div>
                        <div>
                            <span className="block text-base font-bold leading-tight tracking-tight text-slate-900 dark:text-white">
                                Perpustakaan Sekolah
                            </span>
                            <span className="block text-xs text-slate-500 dark:text-slate-400">
                                Sistem Informasi & Peminjaman
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden items-center gap-1 md:flex">
                        <Link
                            href="/"
                            className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                        >
                            Beranda
                        </Link>
                        <Link
                            href="/katalog"
                            className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                        >
                            Katalog Buku
                        </Link>
                        <Link
                            href="/informasi"
                            className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                        >
                            Informasi
                        </Link>
                    </nav>

                    {/* Auth Area */}
                    <div className="hidden items-center gap-3 md:flex">
                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-white p-1 pr-3 text-left transition-colors hover:bg-slate-50 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800">
                                        <Avatar className="size-8">
                                            <AvatarFallback className="bg-emerald-100 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                                {getInitials(user.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col text-left">
                                            <span className="max-w-[130px] truncate text-xs font-semibold text-slate-800 dark:text-slate-100">
                                                {user.name}
                                            </span>
                                            <span className="text-[11px] text-slate-500">
                                                {user.nis ? `NIS: ${user.nis}` : user.role}
                                            </span>
                                        </div>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>
                                        <p className="text-xs font-semibold text-slate-900 dark:text-white">{user.name}</p>
                                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {isSiswa && (
                                        <DropdownMenuItem asChild>
                                            <Link href="/riwayat" className="cursor-pointer">
                                                <BookOpen className="mr-2 size-4" />
                                                Riwayat Pinjam
                                            </Link>
                                        </DropdownMenuItem>
                                    )}
                                    {isAdmin && (
                                        <DropdownMenuItem asChild>
                                            <Link href="/admin/dashboard" className="cursor-pointer">
                                                <UserIcon className="mr-2 size-4" />
                                                Dashboard Admin
                                            </Link>
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem asChild>
                                        <Link href="/settings/profile" className="cursor-pointer">
                                            <HelpCircle className="mr-2 size-4" />
                                            Pengaturan Akun
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href="/logout"
                                            method="post"
                                            as="button"
                                            className="w-full cursor-pointer text-red-600 dark:text-red-400"
                                        >
                                            <LogOut className="mr-2 size-4" />
                                            Keluar
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm">
                                <Link href="/login">Masuk / Login</Link>
                            </Button>
                        )}
                    </div>

                    {/* Mobile toggle */}
                    <div className="flex md:hidden">
                        <button
                            type="button"
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                            {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Drawer */}
                {mobileOpen && (
                    <div className="border-b border-slate-200 bg-white px-4 pt-2 pb-6 md:hidden dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex flex-col gap-2">
                            <Link
                                href="/"
                                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                                onClick={() => setMobileOpen(false)}
                            >
                                Beranda
                            </Link>
                            <Link
                                href="/katalog"
                                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                                onClick={() => setMobileOpen(false)}
                            >
                                Katalog Buku
                            </Link>
                            <Link
                                href="/informasi"
                                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                                onClick={() => setMobileOpen(false)}
                            >
                                Informasi
                            </Link>
                            <div className="mt-3 border-t border-slate-200 pt-3 dark:border-slate-800">
                                {user ? (
                                    <div className="flex flex-col gap-2">
                                        <div className="px-3 py-1">
                                            <p className="text-sm font-semibold">{user.name}</p>
                                            <p className="text-xs text-slate-500">{user.nis ? `NIS: ${user.nis}` : user.email}</p>
                                        </div>
                                        {isSiswa && (
                                            <Link
                                                href="/riwayat"
                                                className="rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200"
                                            >
                                                Riwayat Pinjam
                                            </Link>
                                        )}
                                        {isAdmin && (
                                            <Link
                                                href="/admin/dashboard"
                                                className="rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200"
                                            >
                                                Dashboard Admin
                                            </Link>
                                        )}
                                        <Link
                                            href="/logout"
                                            method="post"
                                            as="button"
                                            className="w-full text-left rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                                        >
                                            Keluar
                                        </Link>
                                    </div>
                                ) : (
                                    <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                                        <Link href="/login">Masuk / Login</Link>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="flex-1">{children}</main>

            {/* Footer */}
            <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-3">
                                <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-600 text-white">
                                    <BookOpen className="size-5" />
                                </div>
                                <span className="text-base font-bold text-slate-900 dark:text-white">
                                    Perpustakaan Sekolah
                                </span>
                            </div>
                            <p className="mt-3 max-w-md text-sm text-slate-600 dark:text-slate-400">
                                Pusat referensi literasi, ilmu pengetahuan, dan riset bagi seluruh siswa dan tenaga pendidik.
                                Mendukung ekosistem belajar digital yang mudah, terstruktur, dan mudah diakses.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Tautan Cepat</h4>
                            <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                                <li>
                                    <Link href="/" className="hover:text-emerald-600 dark:hover:text-emerald-400">
                                        Beranda
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/katalog" className="hover:text-emerald-600 dark:hover:text-emerald-400">
                                        Katalog Koleksi
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/informasi" className="hover:text-emerald-600 dark:hover:text-emerald-400">
                                        Tata Tertib & Jam Buka
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Layanan</h4>
                            <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                                <li>Peminjaman Mandiri</li>
                                <li>Katalog Digital</li>
                                <li>Ruang Baca Nyaman</li>
                                <li>Konsultasi Referensi</li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-8 border-t border-slate-100 pt-6 text-center text-xs text-slate-500 dark:border-slate-800">
                        &copy; {new Date().getFullYear()} Sistem Informasi Perpustakaan Sekolah. Hak cipta dilindungi.
                    </div>
                </div>
            </footer>
        </div>
    );
}
