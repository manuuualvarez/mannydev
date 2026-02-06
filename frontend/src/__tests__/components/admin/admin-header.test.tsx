import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/admin/services/new',
}));

// Mock Clerk
vi.mock('@clerk/nextjs', () => ({
  UserButton: () => <button aria-label="User menu">User</button>,
}));

import { AdminHeader } from '@/components/admin/admin-header';

describe('AdminHeader', () => {
  const mockUser = {
    firstName: 'Manuel',
    imageUrl: 'https://example.com/avatar.jpg',
  };

  it('renders breadcrumbs from pathname', () => {
    render(<AdminHeader user={mockUser} />);

    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('renders user first name', () => {
    render(<AdminHeader user={mockUser} />);

    expect(screen.getByText('Manuel')).toBeInTheDocument();
  });

  it('renders breadcrumb separators', () => {
    render(<AdminHeader user={mockUser} />);

    const separators = screen.getAllByText('/');
    expect(separators.length).toBe(2);
  });

  it('shows Admin as fallback when firstName is null', () => {
    render(<AdminHeader user={{ firstName: null, imageUrl: '' }} />);

    // The breadcrumb "Admin" and the fallback user name "Admin" both appear
    const adminTexts = screen.getAllByText('Admin');
    expect(adminTexts.length).toBeGreaterThanOrEqual(2);
  });
});
