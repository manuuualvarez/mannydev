import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ExperienceSection } from '@/components/sections/experience-section';
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
  },
  useInView: () => true,
}));

// Mock useReducedMotion hook
vi.mock('@/hooks/use-reduced-motion', () => ({
  useReducedMotion: () => true,
}));

describe('ExperienceSection', () => {
  it('renders section heading', () => {
    render(<ExperienceSection />);
    // Should have Experience label
    const experienceTexts = screen.getAllByText(/experience/i);
    expect(experienceTexts.length).toBeGreaterThanOrEqual(1);
  });

  it('renders company logos', () => {
    render(<ExperienceSection />);
    // Should display company names or logos (duplicated for infinite carousel)
    const paypalElements = screen.getAllByText(/paypal/i);
    expect(paypalElements.length).toBeGreaterThanOrEqual(1);
  });

  it('renders as a section element', () => {
    render(<ExperienceSection />);
    expect(document.querySelector('section')).toBeInTheDocument();
  });

  it('displays years of experience', () => {
    render(<ExperienceSection />);
    // Should mention years of experience
    const yearsTexts = screen.getAllByText(/years/i);
    expect(yearsTexts.length).toBeGreaterThanOrEqual(1);
  });

  it('displays trusted by text', () => {
    render(<ExperienceSection />);
    expect(screen.getByText(/trusted|worked/i)).toBeInTheDocument();
  });
});
