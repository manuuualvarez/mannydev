import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';

// Create mocks for the hooks
const mockDashboardData = {
  dashboardStats: {
    totalServices: 6,
    activeServices: 4,
    totalBlogPosts: 5,
    publishedBlogPosts: 3,
    draftBlogPosts: 2,
    totalLeads: 20,
    newLeads: 8,
    contactedLeads: 5,
    qualifiedLeads: 3,
    leadsThisMonth: 12,
    leadsLastMonth: 8,
    totalUsers: 15,
  },
};

const mockLeadsData = {
  leads: [],
  leadsCount: 0,
};

let dashboardLoading = false;

vi.mock('@apollo/client/react', () => ({
  useQuery: vi.fn((_query: unknown, _options?: unknown) => {
    // Check if this is a leads query by looking at variables
    const opts = _options as { variables?: Record<string, unknown> } | undefined;
    if (opts?.variables?.pagination) {
      return {
        data: mockLeadsData,
        loading: false,
      };
    }
    // Otherwise it's the dashboard stats query
    return {
      data: dashboardLoading ? undefined : mockDashboardData,
      loading: dashboardLoading,
    };
  }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/admin',
}));

vi.mock('lucide-react', () => ({
  Briefcase: ({ className }: { className?: string }) => <span data-testid="icon-briefcase" className={className}>Briefcase</span>,
  FileText: ({ className }: { className?: string }) => <span data-testid="icon-filetext" className={className}>FileText</span>,
  Users: ({ className }: { className?: string }) => <span data-testid="icon-users" className={className}>Users</span>,
  UserCog: ({ className }: { className?: string }) => <span data-testid="icon-usercog" className={className}>UserCog</span>,
  TrendingUp: ({ className }: { className?: string }) => <span data-testid="icon-trending-up" className={className}>TrendingUp</span>,
  TrendingDown: ({ className }: { className?: string }) => <span data-testid="icon-trending-down" className={className}>TrendingDown</span>,
  Plus: ({ className }: { className?: string }) => <span data-testid="icon-plus" className={className}>Plus</span>,
  ArrowRight: ({ className }: { className?: string }) => <span data-testid="icon-arrow" className={className}>Arrow</span>,
  Loader2: ({ className }: { className?: string }) => <span data-testid="icon-loader" className={className}>Loading</span>,
}));

import AdminDashboard from '@/app/admin/page';

describe('AdminDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dashboardLoading = false;
  });

  it('renders dashboard title', async () => {
    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });

  it('renders real stats from GraphQL', async () => {
    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Active Services')).toBeInTheDocument();
    });

    // Check that stat values are rendered (use getAllByText for values that may appear multiple times)
    const fours = screen.getAllByText('4');
    expect(fours.length).toBeGreaterThanOrEqual(1); // activeServices = 4
    const twenties = screen.getAllByText('20');
    expect(twenties.length).toBeGreaterThanOrEqual(1); // totalLeads = 20
    const twelves = screen.getAllByText('12');
    expect(twelves.length).toBeGreaterThanOrEqual(1); // leadsThisMonth = 12
  });

  it('renders stat card titles', async () => {
    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Active Services')).toBeInTheDocument();
    });

    expect(screen.getByText('Published Posts')).toBeInTheDocument();
    expect(screen.getByText('Total Leads')).toBeInTheDocument();
    expect(screen.getByText('Leads This Month')).toBeInTheDocument();
  });

  it('renders quick action buttons', async () => {
    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('New Service')).toBeInTheDocument();
    });

    expect(screen.getByText('New Post')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    dashboardLoading = true;
    render(<AdminDashboard />);

    expect(screen.getByTestId('icon-loader')).toBeInTheDocument();
  });
});
