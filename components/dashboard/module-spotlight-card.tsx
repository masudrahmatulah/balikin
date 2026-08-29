'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSpotlightModule, getSpotlightCopy, dismissSpotlight, hasDismissedSpotlight } from '@/lib/promo-modules';
import { getModuleColor } from '@/lib/admin-modules';
import { X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function ModuleSpotlightCard() {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [moduleType, setModuleType] = useState<ReturnType<typeof getSpotlightModule>>('student');

  useEffect(() => {
    // Check if user has already dismissed this spotlight
    if (hasDismissedSpotlight()) {
      return;
    }

    // Get the current spotlight module
    const currentModule = getSpotlightModule();
    setModuleType(currentModule);

    // Show with a slight delay for smooth animation
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsExiting(true);
    dismissSpotlight();
    // Remove from DOM after animation completes
    setTimeout(() => setIsVisible(false), 300);
  };

  if (!isVisible) return null;

  const copy = getSpotlightCopy(moduleType);
  const moduleColor = getModuleColor(moduleType);

  return (
    <Card
      className={cn(
        'border-2 overflow-hidden transition-all duration-300',
        isExiting ? 'opacity-0 scale-95 mb-0' : 'opacity-100 scale-100 mb-6',
        'bg-gradient-to-r from-blue-50 via-white to-purple-50 dark:from-blue-950/40 dark:via-slate-900 dark:to-purple-950/30',
        'border-blue-100 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-800'
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left side - Content */}
          <div className="flex items-start gap-3 flex-1">
            {/* Icon */}
            <div className={cn(
              'flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0',
              moduleColor.replace('bg-', 'bg-opacity-10 bg-')
            )}>
              <Sparkles className={cn('h-5 w-5', moduleColor.replace('bg-', 'text-'))} />
            </div>

            {/* Text content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm md:text-base">
                {copy.emoji} {copy.headline}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-1 md:line-clamp-2">
                {copy.description}
              </p>
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link href="/dashboard/modules">
              <Button
                size="sm"
                variant="ghost"
                className="font-medium text-blue-600 hover:bg-blue-100 hover:text-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/30"
              >
                <span className="hidden sm:inline">Lihat</span>
                <span className="sm:hidden">→</span>
              </Button>
            </Link>
             <button
               onClick={handleDismiss}
               className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-blue-100 dark:hover:bg-slate-800"
              aria-label="Tutup"
            >
              <X className="h-4 w-4 text-slate-400" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
