'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-9 w-9 rounded-md" />;
  }

  const isDark = theme === 'dark';

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="w-9 h-9 px-0"
      aria-label="Toggle theme"
      title={isDark ? 'Ganti ke Light Mode' : 'Ganti ke Dark Mode'}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-yellow-500" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4 text-slate-600" aria-hidden="true" />
      )}
    </Button>
  );
}
