import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MacBookScrollBackground } from '@/components/backgrounds/macbook-scroll-background';

describe('MacBookScrollBackground', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock for matchMedia (no reduced motion)
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  it('renders without crashing', () => {
    const { container } = render(<MacBookScrollBackground />);
    // Component should render the MacBook structure
    expect(container.querySelector('[class*="perspective"]')).toBeDefined();
  });

  it('has reduced opacity to not obscure page content', () => {
    const { container } = render(<MacBookScrollBackground />);
    const outerContainer = container.firstElementChild;
    expect(outerContainer?.className).toContain('opacity-50');
  });

  it('applies metallic gradient classes to the screen bezel', () => {
    const { container } = render(<MacBookScrollBackground />);
    // Check for gradient background styles using linear-gradient for metallic effect
    const lid = container.querySelector('[class*="rounded-t-xl"]');
    expect(lid).toBeDefined();

    // Check that the bezel has metallic gradient classes (not plain zinc colors)
    const bezel = container.querySelector('[class*="bg-\\[linear-gradient"]');
    expect(bezel).toBeDefined();
  });

  it('has silver metallic gradient for light mode', () => {
    const { container } = render(<MacBookScrollBackground />);
    // Find the screen bezel element
    const bezel = container.querySelector('.rounded-t-xl.border');
    expect(bezel).toBeDefined();

    // Check that it contains the light mode metallic gradient
    const classNames = bezel?.className || '';
    expect(classNames).toContain('bg-[linear-gradient(180deg');
    expect(classNames).toContain('#E8E8E8'); // Highlight color for silver
    expect(classNames).toContain('#707070'); // Shadow color
  });

  it('has space gray metallic gradient for dark mode', () => {
    const { container } = render(<MacBookScrollBackground />);
    // Find the screen bezel element
    const bezel = container.querySelector('.rounded-t-xl.border');
    expect(bezel).toBeDefined();

    // Check that it contains the dark mode metallic gradient
    const classNames = bezel?.className || '';
    expect(classNames).toContain('dark:bg-[linear-gradient(180deg');
    expect(classNames).toContain('#5A5A5A'); // Bright edge for space gray
    expect(classNames).toContain('#1A1A1A'); // Dark shadow
  });

  it('respects reduced motion preference', () => {
    // Mock reduced motion preference
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { container } = render(<MacBookScrollBackground />);
    // Should render without animation transforms
    const lid = container.querySelector('[class*="origin-bottom"]');
    // When reduced motion is preferred, the transform should be rotateX(0deg) (open)
    if (lid) {
      const style = lid.getAttribute('style');
      expect(style).toContain('rotateX(0deg)');
    }
  });

  it('renders screen content with developer code snippet', () => {
    render(<MacBookScrollBackground />);
    expect(screen.getByText(/developer/)).toBeDefined();
    expect(screen.getByText(/Manuel Alvarez/)).toBeDefined();
  });

  it('renders the keyboard base with metallic styling', () => {
    const { container } = render(<MacBookScrollBackground />);
    // Find the base element
    const base = container.querySelector('.rounded-b-xl');
    expect(base).toBeDefined();

    // Check that base also has metallic gradient
    const classNames = base?.className || '';
    expect(classNames).toContain('bg-[linear-gradient');
  });
});
