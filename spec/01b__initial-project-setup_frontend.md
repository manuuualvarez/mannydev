# Spec 01b: Initial Project Setup - Frontend Tasks

**Estado:** COMPLETADO
**Fecha:** 2026-01-29
**Agente:** frontend-dev
**Dependencias:** Backend funcional (spec/01a debe estar completo)
**Plan Principal:** `spec/01__initial-project-setup.md`

---

## Resumen

Implementar el frontend completo de manuelalvarez.cloud usando Next.js 16 con App Router, Apollo Client para GraphQL, Clerk para autenticacion, y animaciones premium estilo Apple con GSAP y Framer Motion.

---

## Orden de Implementacion

### Fase 3.1: Setup Inicial Next.js

**Objetivo:** Crear proyecto Next.js con configuracion base.

**Tareas:**

1. Crear directorio `frontend/` en el root del proyecto
2. Inicializar proyecto Next.js:
   ```bash
   cd frontend
   npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"
   ```
3. Instalar dependencias core:
   ```bash
   # GraphQL
   npm install @apollo/client graphql

   # Animations
   npm install gsap
   npm install framer-motion

   # UI Components
   npx shadcn@latest init

   # Forms
   npm install react-hook-form @hookform/resolvers zod

   # Auth
   npm install @clerk/nextjs

   # Utils
   npm install clsx tailwind-merge
   ```

4. Configurar `tailwind.config.ts` con colores del UID:
   ```typescript
   import type { Config } from 'tailwindcss';

   const config: Config = {
     darkMode: ['class'],
     content: [
       './pages/**/*.{js,ts,jsx,tsx,mdx}',
       './components/**/*.{js,ts,jsx,tsx,mdx}',
       './app/**/*.{js,ts,jsx,tsx,mdx}',
     ],
     theme: {
       extend: {
         colors: {
           background: 'hsl(var(--background))',
           foreground: 'hsl(var(--foreground))',
           primary: {
             DEFAULT: 'hsl(var(--primary))',
             foreground: 'hsl(var(--primary-foreground))',
           },
           secondary: {
             DEFAULT: 'hsl(var(--secondary))',
             foreground: 'hsl(var(--secondary-foreground))',
           },
           accent: {
             DEFAULT: '#0066cc',
             light: '#e6f0ff',
             dark: '#004d99',
           },
         },
         fontFamily: {
           sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
           mono: ['var(--font-jetbrains)', 'monospace'],
         },
       },
     },
     plugins: [require('tailwindcss-animate')],
   };
   export default config;
   ```

5. Configurar `globals.css` con CSS variables del UID

6. Crear `.env.example` y `.env.local`

7. Crear `lib/utils/cn.ts`:
   ```typescript
   import { clsx, type ClassValue } from 'clsx';
   import { twMerge } from 'tailwind-merge';

   export function cn(...inputs: ClassValue[]) {
     return twMerge(clsx(inputs));
   }
   ```

**Tests a implementar:**

```typescript
// __tests__/app/page.test.tsx
describe('Home Page', () => {
  it('renders without crashing', () => {
    render(<Home />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});
```

**Criterios de aceptacion:**
- [ ] `npm run dev` arranca sin errores en puerto 3000
- [ ] Tailwind CSS funciona
- [ ] TypeScript sin errores

---

### Fase 3.2: Configurar Apollo Client

**Objetivo:** Setup de Apollo Client para consumir GraphQL.

**Tareas:**

1. Crear `lib/apollo-client.ts`:
   ```typescript
   import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client';
   import { onError } from '@apollo/client/link/error';

   const httpLink = new HttpLink({
     uri: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/graphql',
   });

   const errorLink = onError(({ graphQLErrors, networkError }) => {
     if (graphQLErrors) {
       graphQLErrors.forEach(({ message, locations, path }) => {
         console.error(
           `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
         );
       });
     }
     if (networkError) {
       console.error(`[Network error]: ${networkError}`);
     }
   });

   export const apolloClient = new ApolloClient({
     link: from([errorLink, httpLink]),
     cache: new InMemoryCache(),
   });
   ```

2. Crear `lib/apollo-provider.tsx`:
   ```typescript
   'use client';

   import { ApolloProvider } from '@apollo/client';
   import { apolloClient } from './apollo-client';

   export function ApolloWrapper({ children }: { children: React.ReactNode }) {
     return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>;
   }
   ```

3. Crear queries en `lib/graphql/queries/`:
   ```typescript
   // lib/graphql/queries/services.ts
   import { gql } from '@apollo/client';

   export const GET_SERVICES = gql`
     query GetServices($where: ServiceWhereInput) {
       services(where: $where) {
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

   export const GET_SERVICE_BY_SLUG = gql`
     query GetServiceBySlug($slug: String!) {
       serviceBySlug(slug: $slug) {
         id
         name
         slug
         description
         icon
       }
     }
   `;
   ```

4. Crear mutations en `lib/graphql/mutations/`:
   ```typescript
   // lib/graphql/mutations/leads.ts
   import { gql } from '@apollo/client';

   export const CREATE_LEAD = gql`
     mutation CreateLead($input: CreateLeadInput!) {
       createLead(input: $input) {
         id
         name
         email
         status
       }
     }
   `;
   ```

5. Crear hooks personalizados:
   ```typescript
   // hooks/use-services.ts
   import { useQuery } from '@apollo/client';
   import { GET_SERVICES } from '@/lib/graphql/queries/services';

   export function useServices(onlyActive = true) {
     return useQuery(GET_SERVICES, {
       variables: {
         where: onlyActive ? { isActive: true } : undefined,
       },
     });
   }
   ```

6. Integrar en `app/layout.tsx`

**Tests a implementar:**

```typescript
// __tests__/lib/apollo-client.test.ts
describe('Apollo Client', () => {
  it('should be configured with correct URI', () => {});
  it('should handle network errors gracefully', () => {});
});

// __tests__/hooks/use-services.test.tsx
describe('useServices', () => {
  it('should fetch active services by default', async () => {});
  it('should handle loading state', () => {});
  it('should handle error state', () => {});
});
```

**Criterios de aceptacion:**
- [ ] Apollo Client conecta al backend
- [ ] Queries retornan datos correctamente
- [ ] Errores se manejan gracefully

---

### Fase 3.3: Configurar Clerk

**Objetivo:** Setup de autenticacion con Clerk.

**Tareas:**

1. Configurar middleware en `middleware.ts`:
   ```typescript
   import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

   const isPublicRoute = createRouteMatcher([
     '/',
     '/services(.*)',
     '/blog(.*)',
     '/contact',
     '/sign-in(.*)',
     '/sign-up(.*)',
   ]);

   export default clerkMiddleware(async (auth, request) => {
     if (!isPublicRoute(request)) {
       await auth.protect();
     }
   });

   export const config = {
     matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
   };
   ```

2. Envolver app con ClerkProvider en `app/layout.tsx`:
   ```typescript
   import { ClerkProvider } from '@clerk/nextjs';

   export default function RootLayout({ children }: { children: React.ReactNode }) {
     return (
       <ClerkProvider>
         <html lang="es">
           <body>{children}</body>
         </html>
       </ClerkProvider>
     );
   }
   ```

3. Crear paginas de auth:
   ```
   app/(auth)/sign-in/[[...sign-in]]/page.tsx
   app/(auth)/sign-up/[[...sign-up]]/page.tsx
   ```

4. Configurar Apollo Client con auth token:
   ```typescript
   // lib/apollo-client.ts (actualizado)
   import { setContext } from '@apollo/client/link/context';

   const authLink = setContext(async (_, { headers }) => {
     // Get token from Clerk
     const token = await window.Clerk?.session?.getToken();
     return {
       headers: {
         ...headers,
         authorization: token ? `Bearer ${token}` : '',
       },
     };
   });
   ```

**Tests a implementar:**

```typescript
// __tests__/middleware.test.ts
describe('Clerk Middleware', () => {
  it('should allow access to public routes', () => {});
  it('should redirect to sign-in for protected routes', () => {});
});
```

**Criterios de aceptacion:**
- [ ] Sign-in/Sign-up funcionan con Clerk
- [ ] Rutas admin redirigen a sign-in si no autenticado
- [ ] Token se envia en requests GraphQL

---

### Fase 3.4: Implementar Layout (Header, Footer)

**Objetivo:** Componentes de layout reutilizables.

**Tareas:**

1. Instalar componentes shadcn necesarios:
   ```bash
   npx shadcn@latest add button
   npx shadcn@latest add navigation-menu
   npx shadcn@latest add sheet
   ```

2. Crear `components/layout/header.tsx`:
   ```typescript
   'use client';

   import { useState, useEffect } from 'react';
   import Link from 'next/link';
   import { motion, useScroll, useTransform } from 'framer-motion';
   import { Button } from '@/components/ui/button';
   import { cn } from '@/lib/utils/cn';

   export function Header() {
     const [isScrolled, setIsScrolled] = useState(false);
     const { scrollY } = useScroll();

     useEffect(() => {
       return scrollY.onChange((y) => setIsScrolled(y > 50));
     }, [scrollY]);

     return (
       <motion.header
         className={cn(
           'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
           isScrolled
             ? 'bg-white/80 backdrop-blur-md shadow-sm'
             : 'bg-transparent'
         )}
       >
         <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
           <Link href="/" className="font-bold text-xl">
             Manuel Alvarez
           </Link>

           <div className="hidden md:flex items-center gap-8">
             <Link href="/services" className="hover:text-accent transition-colors">
               Services
             </Link>
             <Link href="/blog" className="hover:text-accent transition-colors">
               Blog
             </Link>
             <Link href="/contact" className="hover:text-accent transition-colors">
               Contact
             </Link>
           </div>

           <Button asChild>
             <Link href="/contact">Start a project</Link>
           </Button>
         </nav>
       </motion.header>
     );
   }
   ```

3. Crear `components/layout/footer.tsx`

4. Crear `components/layout/mobile-nav.tsx` con Sheet de shadcn

5. Crear `components/layout/admin-sidebar.tsx` para admin panel

**Animaciones requeridas:**
- Header: Blur backdrop on scroll (transicion suave)
- Mobile nav: Slide-in animation
- Links: Underline animation on hover

**Tests a implementar:**

```typescript
// __tests__/components/layout/header.test.tsx
describe('Header', () => {
  it('renders navigation links', () => {});
  it('applies blur effect on scroll', () => {});
  it('shows mobile menu on small screens', () => {});
});
```

**Criterios de aceptacion:**
- [ ] Header sticky con blur on scroll
- [ ] Navegacion responsive (mobile menu)
- [ ] Footer con links secundarios

---

### Fase 3.5: Implementar Landing Page

**Objetivo:** Landing page completa con animaciones premium.

#### 3.5.1: Hero Section

**Archivo:** `components/sections/hero-section.tsx`

**Animaciones:**
1. Text reveal (palabra por palabra o caracter por caracter)
2. Subheadline fade in con delay
3. CTA button scale in
4. 3D floating elements (gradient orbs con movimiento sutil)

**Implementacion:**

```typescript
'use client';

import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function HeroSection() {
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subheadlineRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) {
      // Show everything immediately without animation
      return;
    }

    const ctx = gsap.context(() => {
      // Split headline into words for animation
      const words = headlineRef.current?.querySelectorAll('.word');

      gsap.fromTo(
        words,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power2.out',
        }
      );

      gsap.fromTo(
        subheadlineRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: 0.5,
          ease: 'power2.out',
        }
      );

      gsap.fromTo(
        ctaRef.current,
        { opacity: 0, scale: 0.9 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          delay: 0.8,
          ease: 'back.out(1.7)',
        }
      );
    });

    return () => ctx.revert();
  }, []);

  const headline = 'Build digital products that drive business growth';

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-light/30 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <h1
          ref={headlineRef}
          className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6"
        >
          {headline.split(' ').map((word, i) => (
            <span key={i} className="word inline-block mr-4">
              {word}
            </span>
          ))}
        </h1>

        <p
          ref={subheadlineRef}
          className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto mb-8"
        >
          Expert development studio specializing in MVPs, web applications,
          and business automation.
        </p>

        <div ref={ctaRef}>
          <Button size="lg" asChild>
            <Link href="/contact">Start your project</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
```

#### 3.5.2: Services Section

**Archivo:** `components/sections/services-section.tsx`

**Animaciones (Apple-style):**
1. Cards fade + scale from 0.8 to 1.0 on scroll
2. Stagger entre cards (0.1s delay)
3. Icon animation on enter
4. Features list reveal line by line

**Implementacion con GSAP ScrollTrigger:**

```typescript
'use client';

import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useServices } from '@/hooks/use-services';
import { ServiceCard } from './service-card';

gsap.registerPlugin(ScrollTrigger);

export function ServicesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const { data, loading, error } = useServices();

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion || !cardsRef.current) return;

    const cards = cardsRef.current.querySelectorAll('.service-card');

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cards,
        {
          opacity: 0,
          y: 100,
          scale: 0.8,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [data]);

  if (loading) return <ServicesSkeleton />;
  if (error) return null;

  return (
    <section ref={sectionRef} className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-16">Our Services</h2>

        <div ref={cardsRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data?.services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              className="service-card"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
```

#### 3.5.3: Contact Section

**Archivo:** `components/sections/contact-section.tsx`

**Funcionalidades:**
1. Formulario con react-hook-form + zod validation
2. Mutation createLead via Apollo
3. Estados: idle, loading, success, error
4. Micro-interactions en inputs (focus animation)

**Implementacion:**

```typescript
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@apollo/client';
import { motion, AnimatePresence } from 'framer-motion';
import { CREATE_LEAD } from '@/lib/graphql/mutations/leads';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  company: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type FormData = z.infer<typeof schema>;

export function ContactSection() {
  const [submitted, setSubmitted] = useState(false);
  const [createLead, { loading }] = useMutation(CREATE_LEAD);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await createLead({ variables: { input: data } });
      setSubmitted(true);
      reset();
      // Reset success message after 5 seconds
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      console.error('Error creating lead:', error);
    }
  };

  return (
    <section className="py-24">
      <div className="container mx-auto px-4 max-w-2xl">
        <h2 className="text-4xl font-bold text-center mb-4">Let's work together</h2>
        <p className="text-gray-600 text-center mb-12">
          Tell us about your project and we'll get back to you within 24 hours.
        </p>

        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <div className="text-6xl mb-4">✓</div>
              <h3 className="text-2xl font-bold mb-2">Message sent!</h3>
              <p className="text-gray-600">We'll be in touch soon.</p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div>
                <Input
                  {...register('name')}
                  placeholder="Your name"
                  className="h-12"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <Input
                  {...register('email')}
                  type="email"
                  placeholder="Email address"
                  className="h-12"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Input
                  {...register('company')}
                  placeholder="Company (optional)"
                  className="h-12"
                />
              </div>

              <div>
                <Textarea
                  {...register('message')}
                  placeholder="Tell us about your project..."
                  className="min-h-32"
                />
                {errors.message && (
                  <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
                )}
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? 'Sending...' : 'Send message'}
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
```

#### 3.5.4: Landing Page Assembly

**Archivo:** `app/page.tsx`

```typescript
import { HeroSection } from '@/components/sections/hero-section';
import { ServicesSection } from '@/components/sections/services-section';
import { ContactSection } from '@/components/sections/contact-section';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <ServicesSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
```

**Tests a implementar:**

```typescript
// __tests__/components/sections/hero-section.test.tsx
describe('HeroSection', () => {
  it('renders headline', () => {});
  it('renders CTA button', () => {});
  it('skips animations when prefers-reduced-motion', () => {});
});

// __tests__/components/sections/services-section.test.tsx
describe('ServicesSection', () => {
  it('renders loading skeleton initially', () => {});
  it('renders service cards when data loads', () => {});
  it('handles error state gracefully', () => {});
});

// __tests__/components/sections/contact-section.test.tsx
describe('ContactSection', () => {
  it('validates required fields', async () => {});
  it('submits form successfully', async () => {});
  it('shows success message after submission', async () => {});
  it('handles API errors gracefully', async () => {});
});
```

**Criterios de aceptacion:**
- [ ] Hero section con text reveal animation
- [ ] Services section carga datos de GraphQL
- [ ] Services cards animadas con scroll trigger
- [ ] Contact form funcional (envia lead)
- [ ] Animaciones respetan prefers-reduced-motion
- [ ] Responsive en mobile/tablet/desktop

---

### Fase 3.6: Implementar Admin Panel Basico

**Objetivo:** Panel de administracion para gestionar contenido.

**Tareas:**

1. Crear layout de admin:
   ```
   app/admin/
   ├── layout.tsx         # Sidebar + main content
   ├── page.tsx           # Dashboard
   ├── services/
   │   └── page.tsx       # CRUD Services
   ├── blog/
   │   └── page.tsx       # CRUD BlogPosts
   └── leads/
       └── page.tsx       # View/manage leads
   ```

2. Instalar componentes shadcn para admin:
   ```bash
   npx shadcn@latest add table
   npx shadcn@latest add dialog
   npx shadcn@latest add dropdown-menu
   npx shadcn@latest add badge
   npx shadcn@latest add toast
   npx shadcn@latest add select
   ```

3. Crear `app/admin/layout.tsx`:
   ```typescript
   import { AdminSidebar } from '@/components/layout/admin-sidebar';
   import { SignedIn, UserButton } from '@clerk/nextjs';

   export default function AdminLayout({ children }: { children: React.ReactNode }) {
     return (
       <SignedIn>
         <div className="flex min-h-screen">
           <AdminSidebar />
           <main className="flex-1 p-8">
             <div className="flex justify-end mb-8">
               <UserButton />
             </div>
             {children}
           </main>
         </div>
       </SignedIn>
     );
   }
   ```

4. Crear `app/admin/services/page.tsx` con tabla CRUD

5. Crear `app/admin/leads/page.tsx` con filtros por status

**Tests a implementar:**

```typescript
// __tests__/app/admin/services.test.tsx
describe('Admin Services Page', () => {
  it('displays services in table', async () => {});
  it('opens create dialog on button click', () => {});
  it('creates new service', async () => {});
  it('edits existing service', async () => {});
  it('deletes service with confirmation', async () => {});
});

// __tests__/app/admin/leads.test.tsx
describe('Admin Leads Page', () => {
  it('displays leads in table', async () => {});
  it('filters leads by status', async () => {});
  it('updates lead status', async () => {});
});
```

**Criterios de aceptacion:**
- [ ] Dashboard muestra resumen
- [ ] Services CRUD funcional
- [ ] Leads view con filtros
- [ ] Toast notifications para acciones
- [ ] Responsive (tablet+)

---

### Fase 3.7: Tests de Componentes

**Objetivo:** Suite de tests con Vitest y React Testing Library.

**Tareas:**

1. Configurar Vitest:
   ```bash
   npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
   ```

2. Crear `vitest.config.ts`:
   ```typescript
   import { defineConfig } from 'vitest/config';
   import react from '@vitejs/plugin-react';

   export default defineConfig({
     plugins: [react()],
     test: {
       environment: 'jsdom',
       setupFiles: ['./vitest.setup.ts'],
       globals: true,
     },
     resolve: {
       alias: {
         '@': '/Users/manuelalvarez/Developer/My Brand/MannyDevClaud/frontend',
       },
     },
   });
   ```

3. Crear `vitest.setup.ts`:
   ```typescript
   import '@testing-library/jest-dom';
   import { vi } from 'vitest';

   // Mock GSAP
   vi.mock('gsap', () => ({
     gsap: {
       to: vi.fn(),
       fromTo: vi.fn(),
       context: vi.fn(() => ({ revert: vi.fn() })),
       registerPlugin: vi.fn(),
     },
     ScrollTrigger: {},
   }));

   // Mock matchMedia for reduced motion tests
   Object.defineProperty(window, 'matchMedia', {
     writable: true,
     value: vi.fn().mockImplementation((query) => ({
       matches: false,
       media: query,
       onchange: null,
       addEventListener: vi.fn(),
       removeEventListener: vi.fn(),
       dispatchEvent: vi.fn(),
     })),
   });
   ```

4. Implementar tests para todos los componentes principales

**Coverage objetivo:** > 70% en componentes

**Criterios de aceptacion:**
- [ ] `npm run test` pasa sin errores
- [ ] Coverage > 70%
- [ ] Todos los componentes principales testeados

---

### Fase 3.8: Dockerizacion

**Objetivo:** Containerizar el frontend.

**Tareas:**

1. Crear `Dockerfile` (produccion):
   ```dockerfile
   # Build stage
   FROM node:20-alpine AS builder

   WORKDIR /app

   COPY package*.json ./
   RUN npm ci

   COPY . .

   ARG NEXT_PUBLIC_API_URL
   ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

   ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
   ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

   RUN npm run build

   # Production stage
   FROM node:20-alpine

   WORKDIR /app

   COPY --from=builder /app/public ./public
   COPY --from=builder /app/.next/standalone ./
   COPY --from=builder /app/.next/static ./.next/static

   ENV NODE_ENV=production
   ENV PORT=3000

   EXPOSE 3000

   CMD ["node", "server.js"]
   ```

2. Crear `Dockerfile.dev` (desarrollo):
   ```dockerfile
   FROM node:20-alpine

   WORKDIR /app

   COPY package*.json ./
   RUN npm install

   COPY . .

   EXPOSE 3000

   CMD ["npm", "run", "dev"]
   ```

3. Actualizar `next.config.ts` para standalone output:
   ```typescript
   const nextConfig = {
     output: 'standalone',
     // ... other config
   };
   ```

4. Crear `.dockerignore`:
   ```
   node_modules
   .next
   .git
   *.log
   ```

**Criterios de aceptacion:**
- [ ] `docker build` exitoso
- [ ] Container arranca en puerto 3000
- [ ] Puede conectar al backend containerizado

---

## Especificaciones de Animaciones

### Timing y Easing

| Animacion | Duracion | Easing | Delay |
|-----------|----------|--------|-------|
| Text reveal | 0.8s | power2.out | 0.1s stagger |
| Card fade in | 0.8s | power2.out | 0.15s stagger |
| Button scale | 0.6s | back.out(1.7) | - |
| Header blur | 0.3s | ease | - |
| Form success | 0.5s | ease | - |

### Performance Rules

1. Solo animar `transform` y `opacity`
2. Usar `will-change` sparingly
3. Cleanup ScrollTrigger en useEffect return
4. Lazy load GSAP plugins
5. Disable animations en mobile low-end

### Accessibility

```typescript
// Hook para detectar reduced motion
function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const listener = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  return prefersReducedMotion;
}
```

---

## Checklist Final Frontend

- [ ] Next.js proyecto creado y configurado
- [ ] Apollo Client conectando al backend
- [ ] Clerk autenticacion funcionando
- [ ] Header con blur on scroll
- [ ] Hero section con animaciones
- [ ] Services section con scroll-triggered reveal
- [ ] Contact form enviando leads
- [ ] Admin panel basico funcional
- [ ] Animaciones respetan reduced motion
- [ ] Tests de componentes pasan
- [ ] Docker build exitoso
- [ ] Mobile responsive

---

## Comandos Utiles

```bash
# Desarrollo
npm run dev              # Start dev server (:3000)
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # ESLint
npm run typecheck        # TypeScript check

# Tests
npm run test             # Run Vitest
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report

# shadcn/ui
npx shadcn@latest add [component]

# Docker
docker build -t frontend .
docker run -p 3000:3000 frontend
```

---

## Notas Importantes

1. **GSAP**: Usar solo features del core gratuito (no SplitText premium)
2. **Apollo Client**: Cache configurado con InMemoryCache por defecto
3. **Clerk**: Middleware protege todas las rutas /admin/*
4. **shadcn/ui**: Componentes copiados localmente, customizables
5. **Next.js**: App Router con Server Components donde sea posible
6. **Images**: Usar next/image para optimizacion automatica
