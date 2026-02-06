'use client';

import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';

function generateBreadcrumbs(pathname: string) {
  const segments = pathname.split('/').filter(Boolean);
  return segments.map((segment, index) => ({
    label: segment.charAt(0).toUpperCase() + segment.slice(1),
    href: '/' + segments.slice(0, index + 1).join('/'),
    isLast: index === segments.length - 1,
  }));
}

interface AdminHeaderProps {
  user: { firstName: string | null; imageUrl: string };
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const pathname = usePathname();
  const breadcrumbs = generateBreadcrumbs(pathname);

  return (
    <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm">
        {breadcrumbs.map((crumb, i) => (
          <div key={crumb.href} className="flex items-center gap-2">
            {i > 0 && <span className="text-muted-foreground">/</span>}
            <span
              className={
                crumb.isLast
                  ? 'font-medium text-foreground'
                  : 'text-muted-foreground'
              }
            >
              {crumb.label}
            </span>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">
          {user.firstName || 'Admin'}
        </span>
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: 'h-8 w-8',
            },
          }}
        />
      </div>
    </header>
  );
}
