import { useLocale } from 'next-intl';

type Locale = 'es' | 'en';

interface TranslatedFields {
  [key: string]: string | undefined;
}

interface TranslationsMap {
  [locale: string]: TranslatedFields | undefined;
}

/**
 * Extracts the translated field from an object with `translations`.
 * Falls back to the base field if no translation exists for the current locale.
 */
export function useTranslatedField<T extends Record<string, unknown>>(
  item: T,
  field: keyof T & string,
  translations?: TranslationsMap | null,
): string {
  const locale = useLocale() as Locale;

  if (translations && translations[locale] && translations[locale]![field]) {
    return translations[locale]![field] as string;
  }

  return item[field] as string;
}

/**
 * Returns an object with all translatable fields resolved to the current locale.
 */
export function useTranslatedItem<T extends Record<string, unknown>>(
  item: T,
  translatableFields: (keyof T & string)[],
): T {
  const locale = useLocale() as Locale;
  const translations = (item as Record<string, unknown>).translations as TranslationsMap | null | undefined;

  if (!translations || !translations[locale]) {
    return item;
  }

  const translated = { ...item };
  for (const field of translatableFields) {
    if (translations[locale]![field as string]) {
      (translated as Record<string, unknown>)[field] = translations[locale]![field as string];
    }
  }

  return translated;
}
