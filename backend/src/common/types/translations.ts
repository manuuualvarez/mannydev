// Translation shapes for each model
export interface ServiceTranslation {
  name: string;
  description: string;
}

export interface BlogPostTranslation {
  title: string;
  excerpt?: string;
  content: string;
}

export type Locale = 'es' | 'en';

export type TranslationsMap<T> = Partial<Record<Locale, Partial<T>>>;

// Type guards
export function isValidLocale(locale: string): locale is Locale {
  return locale === 'es' || locale === 'en';
}

export function getTranslation<T>(
  translations: TranslationsMap<T> | null | undefined,
  locale: Locale,
  fallbackLocale: Locale = 'es',
): Partial<T> | undefined {
  if (!translations) return undefined;
  return translations[locale] ?? translations[fallbackLocale];
}
