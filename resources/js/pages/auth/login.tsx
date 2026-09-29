import { Form, Head } from '@inertiajs/react';
import { BookOpen, KeyRound, ShieldCheck, UserCheck } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    const [emailVal, setEmailVal] = useState('');
    const [passwordVal, setPasswordVal] = useState('');

    const handleQuickFill = (identifier: string, pass: string) => {
        setEmailVal(identifier);
        setPasswordVal(pass);
    };

    return (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900">
            <Head title="Login Perpustakaan" />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="font-semibold text-slate-700 dark:text-slate-300">
                                    Email atau NIS
                                </Label>
                                <Input
                                    id="email"
                                    type="text"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="username"
                                    value={emailVal}
                                    onChange={(e) => setEmailVal(e.target.value)}
                                    placeholder="Masukkan email atau NIS..."
                                    className="h-11 rounded-xl border-slate-200 focus-visible:ring-emerald-500 dark:border-slate-800"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="font-semibold text-slate-700 dark:text-slate-300">
                                        Password
                                    </Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                                            tabIndex={5}
                                        >
                                            Lupa password?
                                        </TextLink>
                                    )}
                                </div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    value={passwordVal}
                                    onChange={(e) => setPasswordVal(e.target.value)}
                                    placeholder="Masukkan password..."
                                    className="h-11 rounded-xl border-slate-200 focus-visible:ring-emerald-500 dark:border-slate-800"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-2.5">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                    className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                                />
                                <Label htmlFor="remember" className="text-sm font-normal text-slate-600 dark:text-slate-400 cursor-pointer">
                                    Ingat saya di perangkat ini
                                </Label>
                            </div>

                            <Button
                                type="submit"
                                className="h-11 w-full rounded-xl bg-emerald-600 font-semibold text-white shadow-sm hover:bg-emerald-700 focus-visible:ring-emerald-500 active:scale-[0.98] transition-all"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner className="mr-2" />}
                                Login
                            </Button>
                        </div>

                        {/* Demo quick fill badge helper */}
                        <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 dark:border-slate-800/80 dark:bg-slate-950/60">
                            <p className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
                                <KeyRound className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                                Akses Cepat Demo:
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleQuickFill('admin@perpustakaan.sch.id', 'password')}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-2xs hover:border-emerald-500 hover:text-emerald-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-emerald-500 dark:hover:text-emerald-400 transition-colors"
                                >
                                    <ShieldCheck className="size-3 text-emerald-600 dark:text-emerald-400" />
                                    <span>Admin (Petugas)</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleQuickFill('2026001', 'password')}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-2xs hover:border-emerald-500 hover:text-emerald-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-emerald-500 dark:hover:text-emerald-400 transition-colors"
                                >
                                    <UserCheck className="size-3 text-emerald-600 dark:text-emerald-400" />
                                    <span>Siswa (NIS 2026001)</span>
                                </button>
                            </div>
                        </div>

                        <div className="text-center text-sm text-slate-500 dark:text-slate-400">
                            Belum punya akun?{' '}
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                                Hubungi petugas perpustakaan.
                            </span>
                        </div>
                    </>
                )}
            </Form>

            {status && (
                <div className="mt-4 rounded-lg bg-emerald-50 p-3 text-center text-sm font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                    {status}
                </div>
            )}
        </div>
    );
}

Login.layout = {
    title: 'Login',
    description: 'Masuk untuk mengakses layanan perpustakaan',
};
