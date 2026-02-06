import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

// Mock next/navigation
const mockPathname = vi.fn(() => '/admin');
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
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

// Import after mocks
import { AdminSidebar } from '@/components/admin/admin-sidebar';

describe('AdminSidebar', () => {
  beforeEach(() => {
    mockPathname.mockReturnValue('/admin');
  });

  it('renders the Admin Panel title', () => {
    render(<AdminSidebar />);
    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
  });

  it('renders all navigation items', () => {
    render(<AdminSidebar />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getByText('Blog Posts')).toBeInTheDocument();
    expect(screen.getByText('Leads')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('renders navigation links with correct hrefs', () => {
    render(<AdminSidebar />);

    expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute('href', '/admin');
    expect(screen.getByRole('link', { name: /services/i })).toHaveAttribute('href', '/admin/services');
    expect(screen.getByRole('link', { name: /blog posts/i })).toHaveAttribute('href', '/admin/blog');
    expect(screen.getByRole('link', { name: /leads/i })).toHaveAttribute('href', '/admin/leads');
    expect(screen.getByRole('link', { name: /UserCogIcon/ })).toHaveAttribute('href', '/admin/users');
    expect(screen.getByRole('link', { name: /settings/i })).toHaveAttribute('href', '/admin/settings');
  });

  it('renders icons for each navigation item', () => {
    render(<AdminSidebar />);

    expect(screen.getByTestId('icon-dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('icon-services')).toBeInTheDocument();
    expect(screen.getByTestId('icon-blog')).toBeInTheDocument();
    expect(screen.getByTestId('icon-leads')).toBeInTheDocument();
    expect(screen.getByTestId('icon-users')).toBeInTheDocument();
    expect(screen.getByTestId('icon-settings')).toBeInTheDocument();
  });

  it('highlights Dashboard link when on /admin route', () => {
    mockPathname.mockReturnValue('/admin');
    render(<AdminSidebar />);

    const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
    expect(dashboardLink.className).toContain('bg-primary');
  });

  it('highlights Services link when on /admin/services route', () => {
    mockPathname.mockReturnValue('/admin/services');
    render(<AdminSidebar />);

    const servicesLink = screen.getByRole('link', { name: /services/i });
    expect(servicesLink.className).toContain('bg-primary');
  });

  it('highlights Blog link when on /admin/blog route', () => {
    mockPathname.mockReturnValue('/admin/blog');
    render(<AdminSidebar />);

    const blogLink = screen.getByRole('link', { name: /blog posts/i });
    expect(blogLink.className).toContain('bg-primary');
  });

  it('highlights Leads link when on /admin/leads route', () => {
    mockPathname.mockReturnValue('/admin/leads');
    render(<AdminSidebar />);

    const leadsLink = screen.getByRole('link', { name: /leads/i });
    expect(leadsLink.className).toContain('bg-primary');
  });

  it('does not highlight other links when Dashboard is active', () => {
    mockPathname.mockReturnValue('/admin');
    render(<AdminSidebar />);

    const servicesLink = screen.getByRole('link', { name: /services/i });
    const blogLink = screen.getByRole('link', { name: /blog posts/i });
    const leadsLink = screen.getByRole('link', { name: /leads/i });

    // These should NOT have the active class (bg-primary/10)
    expect(servicesLink.className).not.toContain('bg-primary/10');
    expect(blogLink.className).not.toContain('bg-primary/10');
    expect(leadsLink.className).not.toContain('bg-primary/10');
  });

  it('renders as aside element for semantic HTML', () => {
    const { container } = render(<AdminSidebar />);
    const aside = container.querySelector('aside');
    expect(aside).toBeInTheDocument();
  });

  it('contains a nav element for navigation links', () => {
    render(<AdminSidebar />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('Admin Panel title links to /admin', () => {
    render(<AdminSidebar />);
    const titleLink = screen.getByText('Admin Panel').closest('a');
    expect(titleLink).toHaveAttribute('href', '/admin');
  });
});
