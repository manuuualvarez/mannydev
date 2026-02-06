import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from '@/components/layout/header';
import React from 'react';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    header: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <header {...props}>{children}</header>
    ),
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

// Mock useReducedMotion hook
vi.mock('@/hooks/use-reduced-motion', () => ({
  useReducedMotion: () => true,
}));

// Mock ThemeToggle component
vi.mock('@/components/ui/theme-toggle', () => ({
  ThemeToggle: () => <button aria-label="Toggle theme">Theme</button>,
}));

// Mock LanguageSwitcher component
vi.mock('@/components/ui/language-switcher', () => ({
  LanguageSwitcher: () => <button aria-label="Switch language">EN</button>,
}));

// Mock Clerk components
vi.mock('@clerk/nextjs', () => ({
  SignedIn: ({ children }: React.PropsWithChildren) => <>{children}</>,
  SignedOut: ({ children }: React.PropsWithChildren) => <>{children}</>,
  UserButton: () => <button aria-label="User menu">User</button>,
  SignInButton: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

describe('Header', () => {
  it('renders logo/brand name', () => {
    render(<Header />);
    expect(screen.getByText(/manuel alvarez/i)).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(<Header />);

    expect(screen.getByRole('link', { name: /services/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /blog/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /contact/i })).toBeInTheDocument();
  });

  it('renders CTA button', () => {
    render(<Header />);
    expect(screen.getByRole('link', { name: /start a project/i })).toBeInTheDocument();
  });

  it('links to correct pages', () => {
    render(<Header />);

    expect(screen.getByRole('link', { name: /services/i })).toHaveAttribute('href', '/services');
    expect(screen.getByRole('link', { name: /blog/i })).toHaveAttribute('href', '/blog');
    expect(screen.getByRole('link', { name: /contact/i })).toHaveAttribute('href', '/contact');
  });

  it('renders as header element', () => {
    render(<Header />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('contains navigation', () => {
    render(<Header />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('logo links to home page', () => {
    render(<Header />);
    const logoLink = screen.getByText(/manuel alvarez/i).closest('a');
    expect(logoLink).toHaveAttribute('href', '/');
  });

  it('renders language switcher', () => {
    render(<Header />);
    const langButtons = screen.getAllByLabelText(/switch language/i);
    expect(langButtons.length).toBeGreaterThanOrEqual(1);
  });
});
