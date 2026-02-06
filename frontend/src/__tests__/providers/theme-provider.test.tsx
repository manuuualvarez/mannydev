import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@/components/providers/theme-provider';
import React from 'react';

// Mock next-themes
vi.mock('next-themes', () => ({
  ThemeProvider: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <div data-testid="theme-provider" data-props={JSON.stringify(props)}>
      {children}
    </div>
  ),
}));

describe('ThemeProvider', () => {
  it('renders children', () => {
    render(
      <ThemeProvider>
        <div>Test content</div>
      </ThemeProvider>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('passes correct props to next-themes ThemeProvider', () => {
    render(
      <ThemeProvider>
        <div>Test content</div>
      </ThemeProvider>
    );

    const provider = screen.getByTestId('theme-provider');
    const props = JSON.parse(provider.getAttribute('data-props') || '{}');

    // Should use class-based theme switching
    expect(props.attribute).toBe('class');
    // Should default to light
    expect(props.defaultTheme).toBe('system');
    // Should enable system theme detection
    expect(props.enableSystem).toBe(true);
  });

  it('disables color scheme transition to prevent flash', () => {
    render(
      <ThemeProvider>
        <div>Test content</div>
      </ThemeProvider>
    );

    const provider = screen.getByTestId('theme-provider');
    const props = JSON.parse(provider.getAttribute('data-props') || '{}');

    // Should disable transition on change to prevent flash
    expect(props.disableTransitionOnChange).toBe(true);
  });
});
