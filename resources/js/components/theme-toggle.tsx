import { Moon, Sun } from 'lucide-react';
import { useAppearance } from '@/hooks/use-appearance';
import { Button } from '@/components/ui/button';

type ThemeToggleProps = {
    className?: string;
};

export default function ThemeToggle({ className = '' }: ThemeToggleProps) {
    const { resolvedAppearance, updateAppearance } = useAppearance();

    const isDark = resolvedAppearance === 'dark';

    const toggleTheme = () => {
        updateAppearance(isDark ? 'light' : 'dark');
    };

    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={isDark ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'}
            title={isDark ? 'Mode Terang' : 'Mode Gelap'}
            className={`size-9 rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white ${className}`}
        >
            {isDark ? (
                <Sun className="size-4.5 text-amber-400 transition-transform hover:rotate-45" />
            ) : (
                <Moon className="size-4.5 text-slate-700 transition-transform hover:-rotate-12 dark:text-slate-300" />
            )}
        </Button>
    );
}
