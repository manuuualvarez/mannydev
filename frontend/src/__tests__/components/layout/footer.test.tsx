import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from '@/components/layout/footer';
import React from 'react';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock useReducedMotion hook
vi.mock('@/hooks/use-reduced-motion', () => ({
  useReducedMotion: () => true,
}));

// Mock GSAP
vi.mock('@/lib/gsap-config', () => ({
  gsap: {
    fromTo: vi.fn(),
    context: vi.fn(() => ({ revert: vi.fn() })),
  },
  ScrollTrigger: {},
}));

describe('Footer', () => {
  it('renders brand name', () => {
    render(<Footer />);
    const brandElements = screen.getAllByText(/manuel alvarez/i);
    expect(brandElements.length).toBeGreaterThanOrEqual(1);
  });

  it('renders as footer element', () => {
    render(<Footer />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('renders service links as anchor links to sections', () => {
    render(<Footer />);
    // Service links should use anchor links, not route links
    const webDevLink = screen.getByText(/web development/i).closest('a');
    expect(webDevLink).toHaveAttribute('href', '/#services');

    const mobileLink = screen.getByText(/mobile apps/i).closest('a');
    expect(mobileLink).toHaveAttribute('href', '/#services');
  });

  it('does NOT render links to non-existent pages', () => {
    render(<Footer />);
    // These pages don't exist - should NOT have links to them
    const allLinks = screen.getAllByRole('link');
    const hrefs = allLinks.map(link => link.getAttribute('href'));

    expect(hrefs).not.toContain('/about');
    expect(hrefs).not.toContain('/privacy');
    expect(hrefs).not.toContain('/terms');
  });

  it('renders blog and contact links', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: /blog/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /contact/i })).toBeInTheDocument();
  });

  it('renders copyright text', () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`${currentYear}`))).toBeInTheDocument();
  });

  it('renders social links', () => {
    render(<Footer />);
    expect(screen.getByLabelText('GitHub')).toBeInTheDocument();
    expect(screen.getByLabelText('Twitter')).toBeInTheDocument();
    expect(screen.getByLabelText('LinkedIn')).toBeInTheDocument();
  });

  it('renders tagline from translations', () => {
    render(<Footer />);
    expect(screen.getByText(/expert development studio/i)).toBeInTheDocument();
  });
});
