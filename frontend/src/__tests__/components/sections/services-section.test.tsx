import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ServicesSection } from '@/components/sections/services-section';
import React from 'react';

// Mock the useServices hook
vi.mock('@/hooks/use-services', () => ({
  useServices: vi.fn(() => ({
    data: {
      services: [
        {
          id: '1',
          name: 'Web Development',
          slug: 'web-development',
          description: 'Build modern web applications',
          icon: 'globe',
          order: 1,
          isActive: true,
          startingPrice: 29900,
        },
        {
          id: '2',
          name: 'MVP Development',
          slug: 'mvp-development',
          description: 'Launch your startup fast',
          icon: 'rocket',
          order: 2,
          isActive: true,
          startingPrice: null,
        },
      ],
    },
    loading: false,
    error: undefined,
  })),
}));

// Mock useReducedMotion hook
vi.mock('@/hooks/use-reduced-motion', () => ({
  useReducedMotion: () => true, // Disable animations in tests
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <span {...props}>{children}</span>,
    h2: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <h2 {...props}>{children}</h2>,
    p: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <p {...props}>{children}</p>,
    a: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <a {...props}>{children}</a>,
  },
  useInView: () => true,
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

describe('ServicesSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders service cards when data is available', async () => {
    render(<ServicesSection />);

    await waitFor(() => {
      expect(screen.getByText('Web Development')).toBeInTheDocument();
    });

    expect(screen.getByText('MVP Development')).toBeInTheDocument();
  });

  it('renders section heading', async () => {
    render(<ServicesSection />);

    await waitFor(() => {
      expect(screen.getByText(/services designed for/i)).toBeInTheDocument();
    });
  });

  it('renders service descriptions', async () => {
    render(<ServicesSection />);

    await waitFor(() => {
      expect(screen.getByText(/build modern web applications/i)).toBeInTheDocument();
    });
  });

  it('has id="services" for anchor navigation', () => {
    render(<ServicesSection />);
    const section = document.querySelector('#services');
    expect(section).toBeTruthy();
    expect(section?.tagName.toLowerCase()).toBe('section');
  });

  it('renders as a section element', () => {
    render(<ServicesSection />);
    const sections = document.querySelectorAll('section');
    expect(sections.length).toBeGreaterThan(0);
  });
});

describe('ServicesSection - Loading State', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading skeleton when loading', async () => {
    // Override mock for this test
    const { useServices } = await import('@/hooks/use-services');
    vi.mocked(useServices).mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
    } as ReturnType<typeof useServices>);

    render(<ServicesSection />);

    expect(screen.getByTestId('services-loading')).toBeInTheDocument();
  });
});
