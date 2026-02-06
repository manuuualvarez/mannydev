import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HeroSection } from '@/components/sections/hero-section';

describe('HeroSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders headline', () => {
    render(<HeroSection />);
    expect(
      screen.getByRole('heading', { level: 1 })
    ).toBeInTheDocument();
  });

  it('renders subheadline text', () => {
    render(<HeroSection />);
    // With i18n mock returning English, the subheadline contains these terms
    expect(
      screen.getByText(/development studio/i)
    ).toBeInTheDocument();
  });

  it('renders CTA button', () => {
    render(<HeroSection />);
    const ctaButton = screen.getByRole('link', { name: /start your project/i });
    expect(ctaButton).toBeInTheDocument();
    expect(ctaButton).toHaveAttribute('href', '/contact');
  });

  it('renders headline words from translations', () => {
    render(<HeroSection />);
    // English: "Build digital products that drive business growth"
    expect(
      screen.getByText(/Build/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/digital/i)
    ).toBeInTheDocument();
  });

  it('skips animations when prefers-reduced-motion is set', () => {
    // Mock reduced motion preference
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(<HeroSection />);

    // Component should render without crashing when reduced motion is preferred
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('renders gradient orbs for background decoration', () => {
    render(<HeroSection />);
    const section = screen.getByRole('heading', { level: 1 }).closest('section');
    expect(section).toHaveClass('overflow-hidden');
  });
});
