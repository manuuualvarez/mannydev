import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactSection } from '@/components/sections/contact-section';
import React from 'react';

// Mock useMutation from the correct path
const mockMutate = vi.fn();
vi.mock('@apollo/client/react', async () => {
  const actual = await vi.importActual('@apollo/client/react');
  return {
    ...actual,
    useMutation: vi.fn(() => [mockMutate, { loading: false }]),
  };
});

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
    form: ({ children, onSubmit, ...props }: React.PropsWithChildren<{ onSubmit?: React.FormEventHandler } & Record<string, unknown>>) => <form onSubmit={onSubmit} {...props}>{children}</form>,
  },
  useInView: () => true,
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

describe('ContactSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMutate.mockResolvedValue({
      data: {
        createLead: {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          status: 'NEW',
        },
      },
    });
  });

  it('renders form fields', () => {
    render(<ContactSection />);

    // The actual component uses floating labels
    // Find by exact label text to avoid duplicates
    expect(screen.getByLabelText(/your name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/company \(optional\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tell us about your project\.\.\./i)).toBeInTheDocument();
  });

  it('renders submit button', () => {
    render(<ContactSection />);

    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();

    render(<ContactSection />);

    const submitButton = screen.getByRole('button', { name: /send message/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument();
    });
  });

  it('validates message length', async () => {
    const user = userEvent.setup();

    render(<ContactSection />);

    // Find inputs by their label text (more specific to avoid duplicates)
    const nameInput = screen.getByLabelText(/your name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const messageInput = screen.getByLabelText(/tell us about your project\.\.\./i);

    await user.type(nameInput, 'John Doe');
    await user.type(emailInput, 'john@example.com');
    await user.type(messageInput, 'short');

    const submitButton = screen.getByRole('button', { name: /send message/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/message must be at least 10 characters/i)).toBeInTheDocument();
    });
  });

  it('submits form successfully', async () => {
    const user = userEvent.setup();

    render(<ContactSection />);

    const nameInput = screen.getByLabelText(/your name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const companyInput = screen.getByLabelText(/company \(optional\)/i);
    const messageInput = screen.getByLabelText(/tell us about your project\.\.\./i);

    await user.type(nameInput, 'John Doe');
    await user.type(emailInput, 'john@example.com');
    await user.type(companyInput, 'Acme Inc');
    await user.type(messageInput, 'I need a website built');

    await user.click(screen.getByRole('button', { name: /send message/i }));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
    });
  });

  it('shows success message after submission', async () => {
    const user = userEvent.setup();

    render(<ContactSection />);

    const nameInput = screen.getByLabelText(/your name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const companyInput = screen.getByLabelText(/company \(optional\)/i);
    const messageInput = screen.getByLabelText(/tell us about your project\.\.\./i);

    await user.type(nameInput, 'John Doe');
    await user.type(emailInput, 'john@example.com');
    await user.type(companyInput, 'Acme Inc');
    await user.type(messageInput, 'I need a website built');

    await user.click(screen.getByRole('button', { name: /send message/i }));

    await waitFor(() => {
      expect(screen.getByText(/message sent/i)).toBeInTheDocument();
    });
  });

  it('renders section heading', () => {
    render(<ContactSection />);

    // The actual component heading is "Let's build something amazing"
    expect(screen.getByText(/let's build something/i)).toBeInTheDocument();
  });
});
