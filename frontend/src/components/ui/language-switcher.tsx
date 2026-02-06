'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '../../../i18n/navigation';
import { cn } from '@/lib/utils';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggleLocale = () => {
    const nextLocale = locale === 'es' ? 'en' : 'es';
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <button
      onClick={toggleLocale}
      className={cn(
        'inline-flex items-center justify-center',
        'w-9 h-9 rounded-full',
        'text-sm font-medium',
        'border border-border/50',
        'hover:bg-muted',
        'transition-colors duration-200'
      )}
      aria-label={locale === 'es' ? 'Switch to English' : 'Cambiar a Espanol'}
    >
      {locale === 'es' ? 'EN' : 'ES'}
    </button>
  );
}
