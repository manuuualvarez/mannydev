import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/admin',
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  LayoutDashboard: () => <span data-testid="icon-dashboard">DashboardIcon</span>,
  Briefcase: () => <span data-testid="icon-services">BriefcaseIcon</span>,
  FileText: () => <span data-testid="icon-blog">FileTextIcon</span>,
  Users: () => <span data-testid="icon-leads">UsersIcon</span>,
  UserCog: () => <span data-testid="icon-users">UserCogIcon</span>,
  Settings: () => <span data-testid="icon-settings">SettingsIcon</span>,
  ChevronLeft: () => <span data-testid="icon-chevron-left">ChevronLeft</span>,
  ChevronRight: () => <span data-testid="icon-chevron-right">ChevronRight</span>,
  ExternalLink: () => <span data-testid="icon-external">ExternalLink</span>,
}));

// Mock ThemeToggle
vi.mock('@/components/ui/theme-toggle', () => ({
  ThemeToggle: () => <button aria-label="Toggle theme">Theme</button>,
}));

import { AdminSidebar } from '@/components/admin/admin-sidebar';

describe('AdminSidebar Collapse', () => {
  it('starts expanded with labels visible', () => {
    render(<AdminSidebar />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getByText('Blog Posts')).toBeInTheDocument();
  });

  it('collapses when toggle button is clicked', () => {
    render(<AdminSidebar />);

    // Click collapse
    fireEvent.click(screen.getByText('Collapse'));

    // Labels should be hidden
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    expect(screen.queryByText('Services')).not.toBeInTheDocument();
  });

  it('expands back when toggle is clicked again', () => {
    render(<AdminSidebar />);

    // Collapse
    fireEvent.click(screen.getByText('Collapse'));
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();

    // Find the expand button (ChevronRight icon)
    const expandButton = screen.getByTestId('icon-chevron-right').closest('button');
    if (expandButton) {
      fireEvent.click(expandButton);
    }

    // Labels should be visible again
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders View Site link', () => {
    render(<AdminSidebar />);

    expect(screen.getByText('View Site')).toBeInTheDocument();
  });

  it('highlights active route', () => {
    render(<AdminSidebar />);

    const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
    expect(dashboardLink).toHaveClass('bg-primary/10');
  });
});
