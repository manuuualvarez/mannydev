import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/admin/data-table';

interface TestData {
  id: string;
  name: string;
  email: string;
}

const columns: ColumnDef<TestData>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
];

const testData: TestData[] = [
  { id: '1', name: 'Alice', email: 'alice@test.com' },
  { id: '2', name: 'Bob', email: 'bob@test.com' },
  { id: '3', name: 'Charlie', email: 'charlie@test.com' },
  { id: '4', name: 'Diana', email: 'diana@test.com' },
  { id: '5', name: 'Eve', email: 'eve@test.com' },
  { id: '6', name: 'Frank', email: 'frank@test.com' },
  { id: '7', name: 'Grace', email: 'grace@test.com' },
  { id: '8', name: 'Hank', email: 'hank@test.com' },
  { id: '9', name: 'Ivy', email: 'ivy@test.com' },
  { id: '10', name: 'Jack', email: 'jack@test.com' },
  { id: '11', name: 'Web Developer', email: 'webdev@test.com' },
];

describe('DataTable', () => {
  it('renders table with data', () => {
    render(<DataTable columns={columns} data={testData.slice(0, 3)} />);

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
  });

  it('renders column headers', () => {
    render(<DataTable columns={columns} data={testData.slice(0, 3)} />);

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('filters data based on search input', async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        columns={columns}
        data={testData}
        searchPlaceholder="Search..."
        searchColumn="name"
      />
    );

    const searchInput = screen.getByPlaceholderText('Search...');
    await user.type(searchInput, 'Web');

    expect(screen.getByText('Web Developer')).toBeInTheDocument();
    expect(screen.queryByText('Alice')).not.toBeInTheDocument();
  });

  it('paginates data with default page size', () => {
    render(<DataTable columns={columns} data={testData} />);

    // Default page size is 10
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Jack')).toBeInTheDocument();
    // 11th item should not be on first page
    expect(screen.queryByText('Web Developer')).not.toBeInTheDocument();
  });

  it('navigates to next page', () => {
    render(<DataTable columns={columns} data={testData} />);

    // Verify first page shows first 10 items
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.queryByText('Web Developer')).not.toBeInTheDocument();

    // Click next
    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);

    // 11th item should now be visible
    expect(screen.getByText('Web Developer')).toBeInTheDocument();
    // First page items should not be visible
    expect(screen.queryByText('Alice')).not.toBeInTheDocument();
  });
});
