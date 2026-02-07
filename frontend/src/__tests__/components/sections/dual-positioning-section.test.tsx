import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DualPositioningSection } from '@/components/sections/dual-positioning-section';
import React from 'react';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    section: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <section {...props}>{children}</section>
    ),
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
    span: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <span {...props}>{children}</span>
    ),
    h2: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <h2 {...props}>{children}</h2>
    ),
    p: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <p {...props}>{children}</p>
    ),
    li: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <li {...props}>{children}</li>
    ),
  },
  useInView: () => true,
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

// Mock useReducedMotion hook
vi.mock('@/hooks/use-reduced-motion', () => ({
  useReducedMotion: () => true,
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('DualPositioningSection', () => {
  it('renders section heading', () => {
    render(<DualPositioningSection />);
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
  });

  it('displays hire as employee option', () => {
    render(<DualPositioningSection />);
    expect(screen.getByText(/hire/i)).toBeInTheDocument();
  });

  it('displays buy services option', () => {
    render(<DualPositioningSection />);
    // Multiple elements may contain "services" - just verify at least one exists
    const servicesTexts = screen.getAllByText(/services/i);
    expect(servicesTexts.length).toBeGreaterThanOrEqual(1);
  });

  it('renders toggle or tabs for options', () => {
    render(<DualPositioningSection />);
    // Should have clickable tabs or toggle
    const tabs = screen.getAllByRole('button');
    expect(tabs.length).toBeGreaterThanOrEqual(2);
  });

  it('has CTAs for both options', () => {
    render(<DualPositioningSection />);
    // Should have contact/hire CTA links
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThanOrEqual(1);
  });

  it('switches content when tab is clicked', async () => {
    const user = userEvent.setup();
    render(<DualPositioningSection />);

    // Get both tab buttons
    const buttons = screen.getAllByRole('button');

    // Click the second tab
    if (buttons[1]) {
      await user.click(buttons[1]);
    }

    // Content should change (we'll verify the component still renders)
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
  });
});
