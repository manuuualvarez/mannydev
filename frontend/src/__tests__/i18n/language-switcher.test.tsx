import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

// Mock next-intl
const mockReplace = vi.fn();
vi.mock('next-intl', () => ({
  useLocale: vi.fn(() => 'es'),
}));

vi.mock('../../../i18n/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => '/',
}));

import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { useLocale } from 'next-intl';

describe('LanguageSwitcher', () => {
  it('renders EN button when current locale is es', () => {
    vi.mocked(useLocale).mockReturnValue('es');
    render(<LanguageSwitcher />);

    expect(screen.getByText('EN')).toBeInTheDocument();
  });

  it('renders ES button when current locale is en', () => {
    vi.mocked(useLocale).mockReturnValue('en');
    render(<LanguageSwitcher />);

    expect(screen.getByText('ES')).toBeInTheDocument();
  });

  it('calls router.replace with opposite locale when clicked', () => {
    vi.mocked(useLocale).mockReturnValue('es');
    render(<LanguageSwitcher />);

    fireEvent.click(screen.getByText('EN'));

    expect(mockReplace).toHaveBeenCalledWith('/', { locale: 'en' });
  });

  it('has correct aria-label for accessibility', () => {
    vi.mocked(useLocale).mockReturnValue('es');
    render(<LanguageSwitcher />);

    expect(screen.getByLabelText('Switch to English')).toBeInTheDocument();
  });
});
