import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';

// Mock next-intl
vi.mock('next-intl', () => ({
  useLocale: vi.fn(() => 'es'),
}));

import { useTranslatedField, useTranslatedItem } from '@/hooks/use-translated-content';
import { useLocale } from 'next-intl';

describe('useTranslatedField', () => {
  it('returns translated field when translation exists for current locale', () => {
    vi.mocked(useLocale).mockReturnValue('es');

    const item = { name: 'Web Development', description: 'Build web apps' };
    const translations = {
      es: { name: 'Desarrollo Web', description: 'Construir apps web' },
      en: { name: 'Web Development', description: 'Build web apps' },
    };

    const { result } = renderHook(() =>
      useTranslatedField(item, 'name', translations)
    );

    expect(result.current).toBe('Desarrollo Web');
  });

  it('falls back to base field when no translations', () => {
    vi.mocked(useLocale).mockReturnValue('en');

    const item = { name: 'Web Development' };

    const { result } = renderHook(() =>
      useTranslatedField(item, 'name', null)
    );

    expect(result.current).toBe('Web Development');
  });

  it('falls back to base field when locale not in translations', () => {
    vi.mocked(useLocale).mockReturnValue('fr' as 'es');

    const item = { name: 'Web Development' };
    const translations = {
      es: { name: 'Desarrollo Web' },
    };

    const { result } = renderHook(() =>
      useTranslatedField(item, 'name', translations)
    );

    expect(result.current).toBe('Web Development');
  });
});

describe('useTranslatedItem', () => {
  it('returns item with translated fields for current locale', () => {
    vi.mocked(useLocale).mockReturnValue('es');

    const item = {
      id: '1',
      name: 'Web Development',
      description: 'Build web apps',
      translations: {
        es: { name: 'Desarrollo Web', description: 'Construir apps web' },
      },
    };

    const { result } = renderHook(() =>
      useTranslatedItem(item, ['name', 'description'])
    );

    expect(result.current.name).toBe('Desarrollo Web');
    expect(result.current.description).toBe('Construir apps web');
    expect(result.current.id).toBe('1');
  });

  it('returns original item when translations is null', () => {
    vi.mocked(useLocale).mockReturnValue('en');

    const item = {
      id: '1',
      name: 'Web Development',
      description: 'Build web apps',
      translations: null,
    };

    const { result } = renderHook(() =>
      useTranslatedItem(item, ['name', 'description'])
    );

    expect(result.current.name).toBe('Web Development');
    expect(result.current.description).toBe('Build web apps');
  });
});
