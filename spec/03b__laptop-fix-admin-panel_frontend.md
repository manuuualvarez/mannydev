# Spec: MacBook Fix + Admin Panel - Frontend Tasks

**Estado:** PENDIENTE
**Fecha:** 2026-02-04
**Agente:** frontend-dev
**Dependencias:**
- Fase 1 (MacBook): Ninguna
- Fase 2-3 (Admin): Backend debe tener query `me` y validación de roles

---

## Resumen

Este spec cubre tres fases de trabajo frontend:

1. **Fase 1:** Mejorar colores del MacBook animation
2. **Fase 2:** Crear infraestructura del admin panel
3. **Fase 3:** Implementar páginas CRUD admin

---

## Fase 1: MacBook Animation Fix

### Problema Actual

Los colores actuales (`zinc-700/800/900`) no simulan aluminio real:
- Light mode: muy opaco, sin brillo metálico
- Dark mode: se confunde con el fondo, casi invisible

### Solución

Usar gradientes que simulen aluminio con reflejos:

**Light Mode (Silver MacBook):**
```css
background: linear-gradient(180deg,
  #E8E8E8 0%,    /* Highlight */
  #C4C4C4 20%,   /* Light aluminum */
  #A8A8A8 50%,   /* Medium */
  #8C8C8C 80%,   /* Dark */
  #707070 100%   /* Shadow */
);
```

**Dark Mode (Space Gray):**
```css
background: linear-gradient(180deg,
  #5A5A5A 0%,    /* Bright edge */
  #4A4A4A 20%,
  #3A3A3A 50%,
  #2A2A2A 80%,
  #1A1A1A 100%
);
```

### Archivo a Modificar

`frontend/src/components/backgrounds/macbook-scroll-background.tsx`

### Test Cases

```typescript
// frontend/src/__tests__/components/backgrounds/macbook-scroll-background.test.tsx

import { render, screen } from '@testing-library/react';
import { MacBookScrollBackground } from '@/components/backgrounds/macbook-scroll-background';

describe('MacBookScrollBackground', () => {
  beforeEach(() => {
    // Mock matchMedia for reduced motion
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }));
  });

  it('renders without crashing', () => {
    render(<MacBookScrollBackground />);
    // Component should render
  });

  it('applies metallic gradient classes', () => {
    const { container } = render(<MacBookScrollBackground />);
    // Check for gradient background styles
    const lid = container.querySelector('[class*="rounded-t-xl"]');
    expect(lid).toBeInTheDocument();
  });

  it('respects reduced motion preference', () => {
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }));

    const { container } = render(<MacBookScrollBackground />);
    // Should not have animation transforms initially
    const lid = container.querySelector('[class*="origin-bottom"]');
    expect(lid).toHaveStyle({ transform: 'rotateX(0deg)' });
  });

  it('renders screen content with code snippet', () => {
    render(<MacBookScrollBackground />);
    expect(screen.getByText(/developer/)).toBeInTheDocument();
    expect(screen.getByText(/Manuel Alvarez/)).toBeInTheDocument();
  });
});
```

### Implementación

```tsx
// Reemplazar en macbook-scroll-background.tsx

{/* Screen bezel - Metallic aluminum appearance */}
<div
  className={cn(
    'absolute inset-0 rounded-t-xl',
    'border shadow-2xl',
    // Light mode: Silver MacBook with metallic gradient
    'bg-[linear-gradient(180deg,#E8E8E8_0%,#C4C4C4_20%,#A8A8A8_50%,#8C8C8C_80%,#707070_100%)]',
    'border-[#B4B4B4]/50',
    // Dark mode: Space Gray with lighter edges for contrast
    'dark:bg-[linear-gradient(180deg,#5A5A5A_0%,#4A4A4A_20%,#3A3A3A_50%,#2A2A2A_80%,#1A1A1A_100%)]',
    'dark:border-[#646464]/50'
  )}
  style={{
    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1), 0 1px 3px rgba(0,0,0,0.1)',
  }}
>
```

---

## Fase 2: Admin Panel Infrastructure

### Archivos a Crear

#### 2.1 Middleware de Clerk

**Archivo:** `frontend/src/middleware.ts`

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isAdminRoute = createRouteMatcher(['/admin(.*)']);
const isPublicRoute = createRouteMatcher([
  '/',
  '/services(.*)',
  '/blog(.*)',
  '/contact',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/graphql',
]);

export default clerkMiddleware(async (auth, req) => {
  // Allow public routes
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Protect admin routes
  if (isAdminRoute(req)) {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }

    const role = (sessionClaims?.publicMetadata as { role?: string })?.role;
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
```

#### 2.2 Admin Layout

**Archivo:** `frontend/src/app/admin/layout.tsx`

```tsx
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/admin-sidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const role = (sessionClaims?.publicMetadata as { role?: string })?.role;
  if (role !== 'admin') {
    redirect('/unauthorized');
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8 bg-gray-50 dark:bg-gray-900">
        {children}
      </main>
    </div>
  );
}
```

#### 2.3 Admin Sidebar

**Archivo:** `frontend/src/components/admin/admin-sidebar.tsx`

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Users,
  Settings,
} from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/services', label: 'Services', icon: Briefcase },
  { href: '/admin/blog', label: 'Blog Posts', icon: FileText },
  { href: '/admin/leads', label: 'Leads', icon: Users },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div className="p-6">
        <Link href="/admin" className="text-xl font-bold">
          Admin Panel
        </Link>
      </div>
      <nav className="px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/admin' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg mb-1',
                'transition-colors duration-200',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
```

#### 2.4 Admin Dashboard Page

**Archivo:** `frontend/src/app/admin/page.tsx`

```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, FileText, Users } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Services</CardTitle>
            <Briefcase className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">Active services</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Blog Posts</CardTitle>
            <FileText className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Published posts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Leads</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">New leads</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

#### 2.5 Unauthorized Page

**Archivo:** `frontend/src/app/unauthorized/page.tsx`

```tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-8">
          You don't have permission to access this page.
        </p>
        <Button asChild>
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    </div>
  );
}
```

### Test Cases Fase 2

```typescript
// frontend/src/__tests__/components/admin/admin-sidebar.test.tsx

describe('AdminSidebar', () => {
  it('renders navigation items', () => {
    render(<AdminSidebar />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getByText('Blog Posts')).toBeInTheDocument();
    expect(screen.getByText('Leads')).toBeInTheDocument();
  });

  it('highlights active route', () => {
    // Mock usePathname to return '/admin/services'
    jest.mock('next/navigation', () => ({
      usePathname: () => '/admin/services',
    }));

    render(<AdminSidebar />);
    const servicesLink = screen.getByText('Services').closest('a');
    expect(servicesLink).toHaveClass('bg-primary');
  });
});
```

---

## Fase 3: Admin CRUD Pages

### 3.1 Services Management

**Archivo:** `frontend/src/app/admin/services/page.tsx`

```tsx
'use client';

import { useQuery, useMutation } from '@apollo/client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { GET_ADMIN_SERVICES, DELETE_SERVICE } from '@/lib/graphql/admin';
import { toast } from 'sonner';

export default function AdminServicesPage() {
  const { data, loading, refetch } = useQuery(GET_ADMIN_SERVICES);
  const [deleteService] = useMutation(DELETE_SERVICE);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await deleteService({ variables: { id } });
      toast.success('Service deleted');
      refetch();
    } catch (error) {
      toast.error('Failed to delete service');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Services</h1>
        <Button asChild>
          <Link href="/admin/services/new">
            <Plus className="w-4 h-4 mr-2" />
            New Service
          </Link>
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Order</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.services.map((service: any) => (
            <TableRow key={service.id}>
              <TableCell className="font-medium">{service.name}</TableCell>
              <TableCell>{service.slug}</TableCell>
              <TableCell>
                <Badge variant={service.isActive ? 'default' : 'secondary'}>
                  {service.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell>{service.order}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/admin/services/${service.id}/edit`}>
                    <Pencil className="w-4 h-4" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(service.id, service.name)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

### 3.2 GraphQL Queries/Mutations para Admin

**Archivo:** `frontend/src/lib/graphql/admin.ts`

```typescript
import { gql } from '@apollo/client';

// Services
export const GET_ADMIN_SERVICES = gql`
  query GetAdminServices {
    services {
      id
      name
      slug
      description
      icon
      order
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const GET_SERVICE = gql`
  query GetService($id: ID!) {
    service(id: $id) {
      id
      name
      slug
      description
      icon
      order
      isActive
    }
  }
`;

export const CREATE_SERVICE = gql`
  mutation CreateService($input: CreateServiceInput!) {
    createService(input: $input) {
      id
      name
      slug
    }
  }
`;

export const UPDATE_SERVICE = gql`
  mutation UpdateService($id: ID!, $input: UpdateServiceInput!) {
    updateService(id: $id, input: $input) {
      id
      name
      slug
    }
  }
`;

export const DELETE_SERVICE = gql`
  mutation DeleteService($id: ID!) {
    deleteService(id: $id) {
      id
    }
  }
`;

// Blog Posts
export const GET_ADMIN_BLOG_POSTS = gql`
  query GetAdminBlogPosts($pagination: BlogPaginationInput) {
    adminBlogPosts(pagination: $pagination) {
      id
      slug
      title
      excerpt
      isPublished
      publishedAt
      createdAt
    }
  }
`;

export const GET_BLOG_POST = gql`
  query GetBlogPost($id: ID!) {
    adminBlogPost(id: $id) {
      id
      slug
      title
      excerpt
      content
      coverImage
      seoMetadata
      isPublished
      publishedAt
    }
  }
`;

export const CREATE_BLOG_POST = gql`
  mutation CreateBlogPost($input: CreateBlogPostInput!) {
    createBlogPost(input: $input) {
      id
      slug
      title
    }
  }
`;

export const UPDATE_BLOG_POST = gql`
  mutation UpdateBlogPost($id: ID!, $input: UpdateBlogPostInput!) {
    updateBlogPost(id: $id, input: $input) {
      id
      slug
      title
    }
  }
`;

export const DELETE_BLOG_POST = gql`
  mutation DeleteBlogPost($id: ID!) {
    deleteBlogPost(id: $id) {
      id
    }
  }
`;

// Leads
export const GET_ADMIN_LEADS = gql`
  query GetAdminLeads($where: LeadWhereInput, $pagination: LeadPaginationInput) {
    leads(where: $where, pagination: $pagination) {
      id
      name
      email
      company
      message
      status
      notes
      createdAt
    }
    leadsCount
  }
`;

export const GET_LEAD = gql`
  query GetLead($id: ID!) {
    lead(id: $id) {
      id
      name
      email
      company
      message
      status
      notes
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_LEAD = gql`
  mutation UpdateLead($id: ID!, $input: UpdateLeadInput!) {
    updateLead(id: $id, input: $input) {
      id
      status
      notes
    }
  }
`;

export const DELETE_LEAD = gql`
  mutation DeleteLead($id: ID!) {
    deleteLead(id: $id) {
      id
    }
  }
`;

// Auth
export const GET_ME = gql`
  query GetMe {
    me {
      id
      email
      firstName
      lastName
      imageUrl
      role
    }
  }
`;
```

### 3.3 Service Form Component

**Archivo:** `frontend/src/components/admin/forms/service-form.tsx`

```tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const serviceSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  icon: z.string().optional(),
  order: z.number().int().min(0),
  isActive: z.boolean(),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

interface ServiceFormProps {
  defaultValues?: Partial<ServiceFormData>;
  onSubmit: (data: ServiceFormData) => Promise<void>;
  isLoading?: boolean;
}

export function ServiceForm({
  defaultValues,
  onSubmit,
  isLoading,
}: ServiceFormProps) {
  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      icon: '',
      order: 0,
      isActive: true,
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Web Development" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input placeholder="web-development" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the service..."
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icon (optional)</FormLabel>
              <FormControl>
                <Input placeholder="code" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="order"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Order</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <FormLabel>Active</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Show this service on the website
                </p>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Service'}
        </Button>
      </form>
    </Form>
  );
}
```

---

## Script para Setear Admin Role

**Archivo:** `frontend/scripts/set-admin-role.ts`

```typescript
import { clerkClient } from '@clerk/nextjs/server';

async function setAdminRole(userId: string) {
  if (!userId) {
    console.error('Usage: npx ts-node scripts/set-admin-role.ts <USER_ID>');
    process.exit(1);
  }

  try {
    const client = await clerkClient();
    await client.users.updateUser(userId, {
      publicMetadata: { role: 'admin' }
    });
    console.log(`✅ Admin role set for user ${userId}`);
  } catch (error) {
    console.error('❌ Failed to set admin role:', error);
    process.exit(1);
  }
}

const userId = process.argv[2];
setAdminRole(userId);
```

---

## Test Cases Fase 3

```typescript
// frontend/src/__tests__/app/admin/services/page.test.tsx

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockedProvider } from '@apollo/client/testing';
import AdminServicesPage from '@/app/admin/services/page';
import { GET_ADMIN_SERVICES, DELETE_SERVICE } from '@/lib/graphql/admin';

const mockServices = [
  {
    id: '1',
    name: 'Web Development',
    slug: 'web-development',
    description: 'Build web apps',
    icon: 'code',
    order: 0,
    isActive: true,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
];

const mocks = [
  {
    request: { query: GET_ADMIN_SERVICES },
    result: { data: { services: mockServices } },
  },
];

describe('AdminServicesPage', () => {
  it('renders services table', async () => {
    render(
      <MockedProvider mocks={mocks}>
        <AdminServicesPage />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Web Development')).toBeInTheDocument();
    });
  });

  it('shows New Service button', async () => {
    render(
      <MockedProvider mocks={mocks}>
        <AdminServicesPage />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('New Service')).toBeInTheDocument();
    });
  });

  it('deletes service on confirm', async () => {
    const deleteMock = {
      request: {
        query: DELETE_SERVICE,
        variables: { id: '1' },
      },
      result: { data: { deleteService: { id: '1' } } },
    };

    window.confirm = jest.fn(() => true);

    render(
      <MockedProvider mocks={[...mocks, deleteMock]}>
        <AdminServicesPage />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Web Development')).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', { name: /trash/i });
    await userEvent.click(deleteButton);

    expect(window.confirm).toHaveBeenCalled();
  });
});
```

---

## Orden de Ejecución (TDD)

### Fase 1 (MacBook - puede ser paralelo)
1. **RED:** Escribir test para MacBookScrollBackground
2. **GREEN:** Modificar colores en el componente
3. **VERIFY:** Screenshot con Playwright en ambos modos

### Fase 2 (Admin Infra)
1. **RED:** Escribir tests para AdminSidebar
2. **GREEN:** Crear middleware, layout, sidebar
3. **GREEN:** Crear página unauthorized
4. **VERIFY:** Navegación a /admin sin auth redirige

### Fase 3 (Admin CRUD)
1. **RED:** Escribir tests para AdminServicesPage
2. **GREEN:** Crear página services con tabla
3. **GREEN:** Crear ServiceForm
4. **GREEN:** Crear páginas new/edit
5. **REPEAT:** Para blog y leads
6. **VERIFY:** CRUD completo funciona

---

## Verificación Final

```bash
cd frontend

# 1. TypeScript check
npm run typecheck

# 2. Run tests
npm run test

# 3. Check dev server errors
# Usar Next.js MCP: get_errors

# 4. Visual verification with Playwright MCP
# - Navigate to http://localhost:3000 (MacBook in both modes)
# - Navigate to http://localhost:3000/admin (should redirect if not admin)
# - Set admin role, then verify admin access
```

---

## Criterios de Aceptación

### Fase 1 (MacBook)
- [ ] Light mode: laptop tiene aspecto metálico plateado
- [ ] Dark mode: laptop visible con bordes más claros
- [ ] Tests pasan
- [ ] Screenshots verificados con Playwright

### Fase 2 (Admin Infra)
- [ ] /admin redirige a sign-in si no autenticado
- [ ] /admin muestra "Access Denied" si no es admin
- [ ] /admin muestra dashboard si es admin
- [ ] Sidebar funciona correctamente

### Fase 3 (Admin CRUD)
- [ ] Services: listar, crear, editar, eliminar
- [ ] Blog: listar, crear, editar, eliminar
- [ ] Leads: listar, ver detalle, cambiar status
- [ ] Notificaciones toast funcionan
- [ ] Forms tienen validación
