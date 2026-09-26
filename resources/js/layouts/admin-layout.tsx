import { Link, usePage } from '@inertiajs/react';
import {
    ArrowLeftRight,
    BookOpen,
    ExternalLink,
    FileText,
    LayoutDashboard,
    LogOut,
    Menu,
    Settings,
    Users,
    X,
} from 'lucide-react';
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

type AdminLayoutProps = {
    children: ReactNode;
    title?: string;
};

const navItems = [
    { title: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { title: 'Data Buku', href: '/admin/buku', icon: BookOpen },
    { title: 'Data Siswa', href: '/admin/siswa', icon: Users },
    { title: 'Data Peminjaman', href: '/admin/peminjaman', icon: ArrowLeftRight },
    { title: 'Laporan', href: '/admin/laporan', icon: FileText },
    { title: 'Pengaturan', href: '/admin/pengaturan', icon: Settings },
];

export default function AdminLayout({ children, title }: AdminLayoutProps) {
    const { url, props } = usePage();
    const { auth } = props as { auth?: { user?: User } };
    const user = auth?.user;
    const getInitials = useInitials();
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-slate-50 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100">
            {/* Desktop Sidebar */}
            <aside className="hidden w-64 flex-col border-r border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 md:flex">
                {/* Logo & School Header */}
                <div className="flex h-16 items-center gap-3 border-b border-slate-200/80 px-6 dark:border-slate-800">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
                        <BookOpen className="size-5" />
                    </div>
                    <div>
                        <span className="block text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                            Perpustakaan
                        </span>
                        <span className="block text-xs text-slate-500 dark:text-slate-400">
                            Panel Administrator
                        </span>
                    </div>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 space-y-1 px-3 py-4">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = url.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                                    active
                                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                                }`}
                            >
                                <Icon className={`size-4 ${active ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`} />
                                {item.title}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer User Info */}
                <div className="border-t border-slate-200/80 p-4 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <Avatar className="size-9 shrink-0">
                                <AvatarFallback className="bg-emerald-100 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                    {getInitials(user?.name || 'A')}
                                </AvatarFallback>
                            </Avatar>
                            <div className="truncate">
                                <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                                    {user?.name || 'Admin Perpustakaan'}
                                </p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                    Administrator
                                </p>
                            </div>
                        </div>
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-rose-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-rose-400"
                            title="Keluar"
                        >
                            <LogOut className="size-4" />
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Mobile Drawer */}
            {mobileOpen && (
                <div className="fixed inset-0 z-50 flex md:hidden">
                    <div
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
                        onClick={() => setMobileOpen(false)}
                    />
                    <div className="relative flex w-72 max-w-xs flex-1 flex-col bg-white p-4 shadow-xl dark:bg-slate-900">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
                            <div className="flex items-center gap-2.5">
                                <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
                                    <BookOpen className="size-4" />
                                </div>
                                <span className="font-bold text-slate-900 dark:text-white">
                                    Perpustakaan
                                </span>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setMobileOpen(false)}
                            >
                                <X className="size-5" />
                            </Button>
                        </div>
                        <nav className="mt-4 flex-1 space-y-1">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const active = url.startsWith(item.href);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMobileOpen(false)}
                                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                                            active
                                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                                                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                                        }`}
                                    >
                                        <Icon className="size-4" />
                                        {item.title}
                                    </Link>
                                );
                            })}
                        </nav>
                        <div className="border-t border-slate-200 pt-3 dark:border-slate-800">
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                            >
                                <LogOut className="size-4" />
                                Keluar
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex flex-1 flex-col overflow-x-hidden">
                {/* Topbar */}
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden"
                            onClick={() => setMobileOpen(true)}
                        >
                            <Menu className="size-5" />
                        </Button>
                        <div>
                            <h1 className="text-base font-semibold text-slate-900 dark:text-white">
                                {title || 'Panel Admin'}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/"
                            target="_blank"
                            className="hidden items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-emerald-600 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 sm:inline-flex"
                        >
                            <ExternalLink className="size-3.5" />
                            Lihat Portal Siswa
                        </Link>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-2 rounded-full p-1 focus:outline-none">
                                    <Avatar className="size-8">
                                        <AvatarFallback className="bg-emerald-100 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                            {getInitials(user?.name || 'A')}
                                        </AvatarFallback>
                                    </Avatar>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52">
                                <DropdownMenuLabel>
                                    <p className="text-xs font-semibold text-slate-900 dark:text-white">
                                        {user?.name}
                                    </p>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                        {user?.email}
                                    </p>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/" target="_blank" className="flex items-center gap-2 text-xs">
                                        <ExternalLink className="size-3.5" />
                                        Portal Siswa
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link
                                        href="/logout"
                                        method="post"
                                        as="button"
                                        className="flex w-full items-center gap-2 text-xs text-rose-600"
                                    >
                                        <LogOut className="size-3.5" />
                                        Keluar
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
