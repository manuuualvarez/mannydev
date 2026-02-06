# Spec 04b: Frontend - i18n + Premium Animations + Admin Redesign

**Estado:** PENDIENTE
**Fecha:** 2026-02-05
**Agente:** frontend-dev
**Depende de:** Spec 04a (Backend i18n + Dashboard Stats)
**Secciones:** 3 fases secuenciales

---

# SECCION 1: Sistema de Internacionalizacion (i18n)

## Objetivo

Implementar `next-intl` para internacionalizacion con espanol como idioma default y soporte para ingles. Traducir toda la UI estatica y conectar contenido dinamico bilingue desde el backend.

---

## Tarea 1.1: Instalar next-intl

```bash
cd frontend
npm install next-intl
```

---

## Tarea 1.2: Crear Archivos de Configuracion i18n

### Archivo nuevo: `frontend/i18n/routing.ts`

```typescript
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['es', 'en'],
  defaultLocale: 'es',
  localePrefix: 'as-needed', // No prefix for default locale (es)
});
```

### Archivo nuevo: `frontend/i18n/request.ts`

```typescript
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // Validate locale
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
```

### Archivo nuevo: `frontend/i18n/navigation.ts`

```typescript
import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
```

---

## Tarea 1.3: Crear Archivos de Mensajes

### Archivo nuevo: `frontend/messages/es.json`

```json
{
  "metadata": {
    "title": "Manuel Alvarez | Estudio de Desarrollo",
    "description": "Estudio de desarrollo especializado en MVPs, aplicaciones web y automatizacion de negocios."
  },
  "header": {
    "services": "Servicios",
    "blog": "Blog",
    "contact": "Contacto",
    "signIn": "Iniciar sesion",
    "startProject": "Iniciar proyecto"
  },
  "hero": {
    "badge": "Disponible para nuevos proyectos",
    "headline": "Creamos productos digitales que impulsan el crecimiento de tu negocio",
    "highlightWords": ["digitales", "crecimiento"],
    "subheadline": "Estudio de desarrollo especializado en {mvps}, {webApps} y {automation}.",
    "mvps": "MVPs",
    "webApps": "aplicaciones web",
    "automation": "automatizacion de negocios",
    "ctaPrimary": "Iniciar tu proyecto",
    "ctaSecondary": "Ver servicios"
  },
  "services": {
    "label": "Lo que hacemos",
    "title": "Servicios disenados para el {highlight}",
    "titleHighlight": "crecimiento",
    "description": "Desde el concepto hasta el lanzamiento, construimos productos digitales que resuelven problemas reales y entregan resultados medibles para tu negocio.",
    "notSure": "No sabes que servicio necesitas?",
    "discuss": "Hablemos de tu proyecto",
    "learnMore": "Mas informacion"
  },
  "experience": {
    "label": "Experiencia",
    "title": "{years}+ anos construyendo {highlight}",
    "titleHighlight": "productos excepcionales",
    "description": "Confiado por empresas lideres de la industria. Trabaje con startups y empresas para entregar aplicaciones moviles y web de alta calidad.",
    "stats": {
      "years": "Anos de experiencia",
      "companies": "Empresas",
      "projects": "Proyectos entregados",
      "certifications": "Certificaciones"
    }
  },
  "dualPositioning": {
    "label": "Como puedo ayudarte?",
    "title": "Dos formas de {highlight}",
    "titleHighlight": "trabajar juntos",
    "employee": {
      "title": "Contratame como empleado",
      "subtitle": "Full-time o Contrato",
      "description": "Buscas un Senior iOS Developer con 6+ anos de experiencia? Traigo expertise en Swift, SwiftUI y arquitecturas iOS modernas para ayudar a tu equipo a construir experiencias moviles excepcionales.",
      "highlights": [
        "Expertise senior en iOS",
        "Experiencia en PayPal, PedidosYa y mas",
        "Fuerte en SwiftUI, UIKit, MVVM, VIPER",
        "Remote-first, flexibilidad de timezone global"
      ],
      "ctaPrimary": "Ver CV",
      "ctaSecondary": "LinkedIn"
    },
    "services": {
      "title": "Contrata mis servicios",
      "subtitle": "Trabajo por proyecto",
      "description": "Necesitas un producto digital completo? Desde MVPs hasta aplicaciones a escala completa, entrego soluciones end-to-end usando tecnologias modernas. Web, mobile y automatizacion - todo bajo un mismo techo.",
      "highlights": [
        "Desarrollo full-stack web & mobile",
        "MVP en 4-8 semanas",
        "Automatizacion de procesos de negocio",
        "Soporte y mantenimiento continuo"
      ],
      "ctaPrimary": "Iniciar un proyecto",
      "ctaSecondary": "Ver servicios"
    },
    "whatYouGet": "Lo que obtienes"
  },
  "contact": {
    "label": "Contacto",
    "title": "Construyamos algo {highlight}",
    "titleHighlight": "increible",
    "description": "Contanos sobre tu proyecto y te responderemos en 24 horas con una respuesta personalizada.",
    "email": "Email",
    "responseTime": "Tiempo de respuesta",
    "within24": "Dentro de 24 horas",
    "form": {
      "name": "Tu nombre",
      "email": "Direccion de email",
      "company": "Empresa (opcional)",
      "message": "Contanos sobre tu proyecto...",
      "submit": "Enviar mensaje",
      "sending": "Enviando...",
      "success": "Mensaje enviado!",
      "successSub": "Te contactaremos pronto."
    },
    "validation": {
      "nameMin": "El nombre debe tener al menos 2 caracteres",
      "emailInvalid": "Direccion de email invalida",
      "messageMin": "El mensaje debe tener al menos 10 caracteres"
    }
  },
  "footer": {
    "tagline": "Estudio de desarrollo especializado en MVPs, aplicaciones web y automatizacion de negocios. Convirtiendo ideas en productos digitales.",
    "servicesTitle": "Servicios",
    "companyTitle": "Empresa",
    "legalTitle": "Legal",
    "about": "Acerca de",
    "blog": "Blog",
    "contact": "Contacto",
    "privacy": "Politica de Privacidad",
    "terms": "Terminos de Servicio",
    "webDev": "Desarrollo Web",
    "mobileApps": "Apps Moviles",
    "automation": "Automatizacion",
    "mvpDev": "Desarrollo MVP",
    "allRights": "Todos los derechos reservados.",
    "builtWith": "Construido con",
    "using": "usando Next.js & NestJS"
  },
  "common": {
    "loading": "Cargando...",
    "error": "Ocurrio un error",
    "retry": "Reintentar"
  }
}
```

### Archivo nuevo: `frontend/messages/en.json`

```json
{
  "metadata": {
    "title": "Manuel Alvarez | Development Studio",
    "description": "Expert development studio specializing in MVPs, web applications, and business automation."
  },
  "header": {
    "services": "Services",
    "blog": "Blog",
    "contact": "Contact",
    "signIn": "Sign In",
    "startProject": "Start a project"
  },
  "hero": {
    "badge": "Available for new projects",
    "headline": "Build digital products that drive business growth",
    "highlightWords": ["digital", "growth"],
    "subheadline": "Expert development studio specializing in {mvps}, {webApps} and {automation}.",
    "mvps": "MVPs",
    "webApps": "web applications",
    "automation": "business automation",
    "ctaPrimary": "Start your project",
    "ctaSecondary": "View services"
  },
  "services": {
    "label": "What We Do",
    "title": "Services designed for {highlight}",
    "titleHighlight": "growth",
    "description": "From concept to launch, we build digital products that solve real problems and deliver measurable results for your business.",
    "notSure": "Not sure which service you need?",
    "discuss": "Let's discuss your project",
    "learnMore": "Learn more"
  },
  "experience": {
    "label": "Experience",
    "title": "{years}+ years of building {highlight}",
    "titleHighlight": "exceptional products",
    "description": "Trusted by industry-leading companies. I've worked with startups and enterprises to deliver high-quality mobile and web applications.",
    "stats": {
      "years": "Years Experience",
      "companies": "Companies",
      "projects": "Projects Delivered",
      "certifications": "Certifications"
    }
  },
  "dualPositioning": {
    "label": "How Can I Help?",
    "title": "Two ways to {highlight}",
    "titleHighlight": "work together",
    "employee": {
      "title": "Hire as Employee",
      "subtitle": "Full-time or Contract",
      "description": "Looking for a Senior iOS Developer with 6+ years of experience? I bring expertise in Swift, SwiftUI, and modern iOS architectures to help your team build exceptional mobile experiences.",
      "highlights": [
        "Senior-level iOS expertise",
        "Experience with PayPal, PedidosYa, and more",
        "Strong in SwiftUI, UIKit, MVVM, VIPER",
        "Remote-first, global timezone flexibility"
      ],
      "ctaPrimary": "View Resume",
      "ctaSecondary": "LinkedIn"
    },
    "services": {
      "title": "Buy My Services",
      "subtitle": "Project-based Work",
      "description": "Need a complete digital product? From MVPs to full-scale applications, I deliver end-to-end solutions using modern technologies. Web, mobile, and automation - all under one roof.",
      "highlights": [
        "Full-stack web & mobile development",
        "MVP in 4-8 weeks",
        "Business process automation",
        "Ongoing support & maintenance"
      ],
      "ctaPrimary": "Start a Project",
      "ctaSecondary": "View Services"
    },
    "whatYouGet": "What you get"
  },
  "contact": {
    "label": "Get in Touch",
    "title": "Let's build something {highlight}",
    "titleHighlight": "amazing",
    "description": "Tell us about your project and we'll get back to you within 24 hours with a personalized response.",
    "email": "Email",
    "responseTime": "Response time",
    "within24": "Within 24 hours",
    "form": {
      "name": "Your name",
      "email": "Email address",
      "company": "Company (optional)",
      "message": "Tell us about your project...",
      "submit": "Send message",
      "sending": "Sending...",
      "success": "Message sent!",
      "successSub": "We'll be in touch soon."
    },
    "validation": {
      "nameMin": "Name must be at least 2 characters",
      "emailInvalid": "Invalid email address",
      "messageMin": "Message must be at least 10 characters"
    }
  },
  "footer": {
    "tagline": "Expert development studio specializing in MVPs, web applications, and business automation. Turning ideas into digital products.",
    "servicesTitle": "Services",
    "companyTitle": "Company",
    "legalTitle": "Legal",
    "about": "About",
    "blog": "Blog",
    "contact": "Contact",
    "privacy": "Privacy Policy",
    "terms": "Terms of Service",
    "webDev": "Web Development",
    "mobileApps": "Mobile Apps",
    "automation": "Business Automation",
    "mvpDev": "MVP Development",
    "allRights": "All rights reserved.",
    "builtWith": "Built with",
    "using": "using Next.js & NestJS"
  },
  "common": {
    "loading": "Loading...",
    "error": "An error occurred",
    "retry": "Retry"
  }
}
```

---

## Tarea 1.4: Crear Middleware de next-intl

### Archivo nuevo: `frontend/src/middleware.ts`

```typescript
import createMiddleware from 'next-intl/middleware';
import { routing } from '../i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match all pathnames except:
  // - API routes
  // - Next.js internals (_next)
  // - Static files (images, fonts, etc.)
  // - Admin routes (no i18n for admin)
  matcher: [
    '/((?!api|_next|admin|.*\\..*).*)',
    '/(es|en)/:path*',
  ],
};
```

**NOTA CRITICA:** Las rutas `/admin/*` NO pasan por el middleware de i18n. El admin se mantiene sin prefijo de locale. Esto se logra excluyendo `admin` del matcher.

---

## Tarea 1.5: Restructurar Rutas bajo `[locale]`

### Cambios de estructura:

```
frontend/src/app/
├── [locale]/                          # NUEVO: wrapper de locale
│   ├── layout.tsx                     # Layout con NextIntlClientProvider
│   ├── page.tsx                       # Landing page (movida desde app/page.tsx)
│   ├── blog/page.tsx                  # Blog (movida)
│   ├── services/page.tsx              # Services (movida)
│   ├── contact/page.tsx               # Contact (movida)
│   ├── unauthorized/page.tsx          # 403 (movida)
│   └── (auth)/
│       ├── sign-in/[[...sign-in]]/page.tsx
│       └── sign-up/[[...sign-up]]/page.tsx
├── admin/                             # SIN cambios de ruta (no i18n)
│   ├── layout.tsx
│   ├── page.tsx
│   ├── services/
│   ├── blog/
│   └── leads/
├── layout.tsx                         # Root layout (simplificado)
└── globals.css
```

### Archivo modificado: `frontend/src/app/layout.tsx` (Root)

```typescript
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { ApolloWrapper } from '@/lib/apollo-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Manuel Alvarez | Development Studio',
  description: 'Expert development studio specializing in MVPs, web applications, and business automation.',
};

const isClerkConfigured =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== 'pk_test_placeholder';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const content = (
    <html suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <ThemeProvider>
          <ApolloWrapper>{children}</ApolloWrapper>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );

  if (isClerkConfigured) {
    return <ClerkProvider>{content}</ClerkProvider>;
  }
  return content;
}
```

**Nota:** Se quita `lang="es"` del html tag del root layout. Esto se mueve al `[locale]/layout.tsx`.

### Archivo nuevo: `frontend/src/app/[locale]/layout.tsx`

```typescript
import { NextIntlClientProvider, useMessages } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '../../../i18n/routing';
import { MacBookScrollBackground } from '@/components/backgrounds/macbook-scroll-background';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  // Validate locale
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <div lang={locale}>
      <NextIntlClientProvider messages={messages}>
        <MacBookScrollBackground />
        {children}
      </NextIntlClientProvider>
    </div>
  );
}
```

### Archivo movido: `frontend/src/app/[locale]/page.tsx`

Identico al actual `app/page.tsx` -- no cambia el contenido, solo la ubicacion.

---

## Tarea 1.6: Traducir Componentes de la Landing

### Patron de traduccion para cada componente:

Cada componente `'use client'` debe:
1. Importar `useTranslations` de `next-intl`
2. Usar `const t = useTranslations('seccionKey')`
3. Reemplazar strings hardcoded con `t('key')`

**Ejemplo para HeroSection:**

```typescript
// frontend/src/components/sections/hero-section.tsx
'use client';

import { useTranslations } from 'next-intl';
// ... otros imports ...

export function HeroSection() {
  const t = useTranslations('hero');
  // ...

  const headline = t('headline');
  const highlightWords = t.raw('highlightWords') as string[];

  return (
    <section ...>
      {/* Badge */}
      <span ...>{t('badge')}</span>

      {/* Headline */}
      <h1 ...>
        {headline.split(' ').map((word, i) => (
          <span
            key={i}
            className={cn(
              'word inline-block mr-3 md:mr-4 lg:mr-5',
              highlightWords.includes(word.toLowerCase()) && 'gradient-text'
            )}
          >
            {word}
          </span>
        ))}
      </h1>

      {/* Subheadline */}
      <p ...>
        {t.rich('subheadline', {
          mvps: (chunks) => <span className="text-foreground font-medium">{chunks}</span>,
          webApps: (chunks) => <span className="text-foreground font-medium">{chunks}</span>,
          automation: (chunks) => <span className="text-foreground font-medium">{chunks}</span>,
        })}
      </p>

      {/* CTAs */}
      <Link href="/contact">{t('ctaPrimary')}</Link>
      <Link href="/services">{t('ctaSecondary')}</Link>
    </section>
  );
}
```

**Componentes a traducir (todos en `frontend/src/components/`):**

| Componente | Key de traduccion | Campos |
|-----------|-------------------|--------|
| `sections/hero-section.tsx` | `hero` | badge, headline, subheadline, ctaPrimary, ctaSecondary |
| `sections/services-section.tsx` | `services` | label, title, description, notSure, discuss, learnMore |
| `sections/service-card.tsx` | `services` | learnMore |
| `sections/experience-section.tsx` | `experience` | label, title, description, stats.* |
| `sections/dual-positioning-section.tsx` | `dualPositioning` | label, title, employee.*, services.*, whatYouGet |
| `sections/contact-section.tsx` | `contact` | label, title, description, form.*, validation.* |
| `layout/header.tsx` | `header` | services, blog, contact, signIn, startProject |
| `layout/footer.tsx` | `footer` | tagline, servicesTitle, companyTitle, legalTitle, links |

---

## Tarea 1.7: Agregar Language Switcher al Header

### Agregar componente en `frontend/src/components/ui/language-switcher.tsx`

```typescript
'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '../../../i18n/navigation';
import { cn } from '@/lib/utils';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggleLocale = () => {
    const nextLocale = locale === 'es' ? 'en' : 'es';
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <button
      onClick={toggleLocale}
      className={cn(
        'inline-flex items-center justify-center',
        'w-9 h-9 rounded-full',
        'text-sm font-medium',
        'border border-border/50',
        'hover:bg-muted',
        'transition-colors duration-200'
      )}
      aria-label={locale === 'es' ? 'Switch to English' : 'Cambiar a Espanol'}
    >
      {locale === 'es' ? 'EN' : 'ES'}
    </button>
  );
}
```

**Integrar en Header** entre el ThemeToggle y los botones de auth.

---

## Tarea 1.8: Contenido Dinamico con Traducciones

### Hook para extraer traduccion de contenido dinamico

### Archivo nuevo: `frontend/src/hooks/use-translated-content.ts`

```typescript
import { useLocale } from 'next-intl';

type Locale = 'es' | 'en';

interface TranslatedFields {
  [key: string]: string | undefined;
}

interface TranslationsMap {
  [locale: string]: TranslatedFields | undefined;
}

/**
 * Extrae el campo traducido de un objeto con `translations`.
 * Si no hay traduccion para el locale actual, usa el campo base (fallback).
 */
export function useTranslatedField<T extends Record<string, any>>(
  item: T,
  field: keyof T & string,
  translations?: TranslationsMap | null,
): string {
  const locale = useLocale() as Locale;

  // Si hay translations y el locale actual tiene el campo, usarlo
  if (translations && translations[locale] && translations[locale]![field]) {
    return translations[locale]![field] as string;
  }

  // Fallback al campo base del item
  return item[field] as string;
}

/**
 * Retorna un objeto con todos los campos traducidos de un item.
 */
export function useTranslatedItem<T extends Record<string, any>>(
  item: T,
  translatableFields: (keyof T & string)[],
): T {
  const locale = useLocale() as Locale;
  const translations = (item as any).translations as TranslationsMap | null | undefined;

  if (!translations || !translations[locale]) {
    return item;
  }

  const translated = { ...item };
  for (const field of translatableFields) {
    if (translations[locale]![field as string]) {
      (translated as any)[field] = translations[locale]![field as string];
    }
  }

  return translated;
}
```

### Uso en ServicesSection:

```typescript
// En services-section.tsx o service-card.tsx
function TranslatedServiceCard({ service, index }: { service: Service; index: number }) {
  const translatedService = useTranslatedItem(service, ['name', 'description']);
  return <ServiceCard service={translatedService} index={index} />;
}
```

---

## Tarea 1.9: Actualizar GraphQL Queries para incluir `translations`

### Archivo: `frontend/src/lib/graphql/queries/services.ts`

```typescript
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
      translations     # NUEVO
    }
  }
`;
```

Mismo cambio para todas las queries que retornan Service o BlogPost -- agregar `translations` al selection set.

---

## Tarea 1.10: Configurar next.config para next-intl

### Archivo: `frontend/next.config.ts` (modificar)

```typescript
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig = {
  // ... configuracion existente ...
};

export default withNextIntl(nextConfig);
```

---

## Tests de Seccion 1: i18n

### Test: i18n-renders-spanish-by-default
**Given** un usuario visita la URL raiz sin prefijo de locale
**When** el componente HeroSection se renderiza
**Then** muestra el headline en espanol: "Creamos productos digitales que impulsan el crecimiento de tu negocio"
**Type:** unit
**Layer:** frontend

```typescript
// frontend/src/__tests__/i18n/hero-section-i18n.test.tsx
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import messages from '../../../messages/es.json';
import { HeroSection } from '@/components/sections/hero-section';

// Mock GSAP
jest.mock('gsap', () => ({ /* ... */ }));

describe('HeroSection i18n', () => {
  it('renders Spanish content by default', () => {
    render(
      <NextIntlClientProvider locale="es" messages={messages}>
        <HeroSection />
      </NextIntlClientProvider>
    );

    expect(screen.getByText(/Creamos productos digitales/)).toBeInTheDocument();
    expect(screen.getByText(/Disponible para nuevos proyectos/)).toBeInTheDocument();
  });
});
```

### Test: i18n-renders-english-when-locale-en
**Given** el locale esta configurado como "en"
**When** el componente HeroSection se renderiza
**Then** muestra el headline en ingles: "Build digital products that drive business growth"
**Type:** unit
**Layer:** frontend

```typescript
import enMessages from '../../../messages/en.json';

it('renders English content when locale is en', () => {
  render(
    <NextIntlClientProvider locale="en" messages={enMessages}>
      <HeroSection />
    </NextIntlClientProvider>
  );

  expect(screen.getByText(/Build digital products/)).toBeInTheDocument();
  expect(screen.getByText(/Available for new projects/)).toBeInTheDocument();
});
```

### Test: i18n-language-switcher-toggles
**Given** el usuario esta en la pagina en espanol
**When** hace click en el language switcher (boton "EN")
**Then** el router navega a la version en ingles
**Type:** unit
**Layer:** frontend

### Test: i18n-translated-service-content
**Given** un servicio tiene `translations: { es: { name: "Desarrollo Web" }, en: { name: "Web Development" } }`
**When** el hook `useTranslatedItem` se usa con locale "es"
**Then** retorna el nombre "Desarrollo Web"
**Type:** unit
**Layer:** frontend

### Test: i18n-fallback-to-base-field
**Given** un servicio tiene `translations: null` (sin traducciones)
**When** el hook `useTranslatedItem` se usa con locale "en"
**Then** retorna el campo base `name` del servicio (fallback)
**Type:** unit
**Layer:** frontend

### Test: i18n-all-messages-keys-match
**Given** los archivos es.json y en.json
**When** se comparan sus keys recursivamente
**Then** ambos archivos tienen exactamente las mismas keys (nada falta en ninguno)
**Type:** unit
**Layer:** frontend

```typescript
// frontend/src/__tests__/i18n/messages-consistency.test.ts
import esMessages from '../../../messages/es.json';
import enMessages from '../../../messages/en.json';

function getKeys(obj: Record<string, any>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && !Array.isArray(value)) {
      return getKeys(value, fullKey);
    }
    return [fullKey];
  });
}

describe('i18n messages consistency', () => {
  it('es.json and en.json have the same keys', () => {
    const esKeys = getKeys(esMessages).sort();
    const enKeys = getKeys(enMessages).sort();
    expect(esKeys).toEqual(enKeys);
  });
});
```

---

# SECCION 2: Premium Animations Overhaul

## Objetivo

Transformar las animaciones de basicas (Framer Motion useInView) a premium Apple-style (GSAP ScrollTrigger con pin, parallax, 3D transforms, counter animations).

**IMPORTANTE:** Esta seccion asume que la Seccion 1 (i18n) ya esta completada y todos los textos estan en espanol.

---

## Tarea 2.1: HeroSection - Parallax 3D con ScrollTrigger

### Archivo: `frontend/src/components/sections/hero-section.tsx`

**Reescribir** la seccion del useEffect que usa GSAP para agregar parallax on scroll.

**Animacion actual:** Timeline de entrada (onLoad) con stagger de palabras. No hay animacion on-scroll.

**Animacion nueva:**
1. **Entrada (onLoad):** Mantener la timeline actual de reveal de palabras (ya esta bien).
2. **Scroll parallax (NUEVO):** Al scrollear, los elementos se mueven a diferentes velocidades:
   - Orbs: se mueven RAPIDO hacia arriba (parallax factor 1.5x)
   - Headline: se mueve lento hacia arriba (parallax factor 0.5x) + fade out
   - Subheadline: parallax factor 0.8x + fade out
   - CTAs: parallax factor 0.3x + scale down
   - Background gradient: shift de color suave

**Implementacion GSAP ScrollTrigger:**

```typescript
useEffect(() => {
  if (prefersReducedMotion || !isLoaded) return;

  const ctx = gsap.context(() => {
    // ... timeline de entrada existente ...

    // NUEVO: Parallax on scroll
    gsap.registerPlugin(ScrollTrigger);

    // Orbs parallax (mueven rapido)
    if (orbsRef.current) {
      gsap.to(orbsRef.current.children, {
        y: -200,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      });
    }

    // Headline parallax + fade
    gsap.to(headlineRef.current, {
      y: -80,
      opacity: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: '10% top',
        end: '60% top',
        scrub: 1,
      },
    });

    // Subheadline parallax
    gsap.to(subheadlineRef.current, {
      y: -120,
      opacity: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: '5% top',
        end: '50% top',
        scrub: 1,
      },
    });

    // CTA parallax + scale
    gsap.to(ctaRef.current, {
      y: -40,
      opacity: 0,
      scale: 0.9,
      ease: 'none',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: '15% top',
        end: '55% top',
        scrub: 1,
      },
    });
  }, sectionRef);

  return () => ctx.revert(); // Cleanup ScrollTrigger instances
}, [prefersReducedMotion, isLoaded]);
```

---

## Tarea 2.2: ServicesSection - Scroll Pin + Staggered 3D Reveal

### Archivo: `frontend/src/components/sections/services-section.tsx`

**Animacion actual:** Framer Motion `useInView` con simple fade-in.

**Animacion nueva:** La seccion se "pinea" al viewport. Mientras el usuario scrollea, las cards de servicios aparecen una por una desde abajo con rotacion 3D sutil.

**Concepto:**
1. La seccion ocupa 300vh (para dar espacio de scroll durante el pin)
2. Al entrar al viewport, la seccion se pinea
3. El heading hace fade-in
4. Cada service card aparece con stagger: translateY(100) + rotateX(-15deg) -> translateY(0) + rotateX(0)
5. Al completar todas las cards, la seccion se despinea

**Implementacion:**

```typescript
useEffect(() => {
  if (prefersReducedMotion) return;

  gsap.registerPlugin(ScrollTrigger);

  const ctx = gsap.context(() => {
    const cards = cardsContainerRef.current?.querySelectorAll('.service-card');
    if (!cards || cards.length === 0) return;

    // Set initial state
    gsap.set(cards, {
      opacity: 0,
      y: 100,
      rotateX: -15,
      transformPerspective: 1000,
    });

    // Pin timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top',
        end: `+=${cards.length * 300}`, // 300px per card
        pin: true,
        scrub: 1,
        anticipatePin: 1,
      },
    });

    // Heading reveal
    tl.fromTo(
      headingRef.current,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.3 }
    );

    // Stagger cards
    tl.to(cards, {
      opacity: 1,
      y: 0,
      rotateX: 0,
      stagger: 0.15,
      duration: 0.5,
      ease: 'power3.out',
    });
  }, sectionRef);

  return () => ctx.revert();
}, [prefersReducedMotion]);
```

**Notas:**
- Agregar clase `service-card` a cada ServiceCard wrapper
- En mobile (< lg breakpoint): NO hacer pin, usar reveal simple
- Agregar ref `cardsContainerRef` al div que contiene las cards

---

## Tarea 2.3: ExperienceSection - Counter Animation + Logo Carousel

### Archivo: `frontend/src/components/sections/experience-section.tsx`

**Animacion actual:** Framer Motion useInView fade-in simple. Stats son valores estaticos.

**Animacion nueva:**
1. **Counter animation:** Los numeros (9+, 5, 20+, 4) cuentan desde 0 hasta su valor cuando entran en viewport. Duracion: 1.5s con ease out.
2. **Logo carousel:** Los logos de empresas se desplazan en un loop infinito horizontal (CSS animation, no JS).

**Counter con GSAP:**

```typescript
// Custom hook o inline en el componente
function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const counterRef = useRef<HTMLSpanElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion || !counterRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const counter = { value: 0 };

    gsap.to(counter, {
      value: value,
      duration: 1.5,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: counterRef.current,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
      onUpdate: () => {
        if (counterRef.current) {
          counterRef.current.textContent = Math.round(counter.value) + suffix;
        }
      },
    });
  }, [value, suffix, prefersReducedMotion]);

  return (
    <span ref={counterRef}>
      {prefersReducedMotion ? `${value}${suffix}` : `0${suffix}`}
    </span>
  );
}
```

**Logo Carousel CSS Infinito:**

```css
/* En globals.css */
@keyframes scroll-logos {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.logo-carousel {
  display: flex;
  animation: scroll-logos 30s linear infinite;
}

.logo-carousel:hover {
  animation-play-state: paused;
}
```

Estructura HTML: duplicar la lista de logos para crear loop seamless.

---

## Tarea 2.4: DualPositioningSection - Perspective 3D Mejorada

### Archivo: `frontend/src/components/sections/dual-positioning-section.tsx`

**Animacion actual:** AnimatePresence con fade + slide simple en tab switch.

**Animacion nueva:**
1. Al entrar en viewport: la card principal aparece con perspective 3D (translateZ + rotateY sutil)
2. Tab switch: la card actual sale con rotateY(-10deg) + fade, la nueva entra con rotateY(10deg) + fade
3. Highlights list: stagger reveal con slide-in desde la derecha

**Implementacion:** Mantener Framer Motion para el tab switch (AnimatePresence es perfecto para esto), pero mejorar los valores de animacion.

```typescript
<motion.div
  key={activePosition}
  initial={{ opacity: 0, rotateY: 10, transformPerspective: 1200, z: -50 }}
  animate={{ opacity: 1, rotateY: 0, z: 0 }}
  exit={{ opacity: 0, rotateY: -10, z: -50 }}
  transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
  style={{ transformStyle: 'preserve-3d' }}
>
```

---

## Tarea 2.5: ContactSection - Staggered Field Reveal + Micro-interacciones

### Archivo: `frontend/src/components/sections/contact-section.tsx`

**Animacion nueva:**
1. Al entrar en viewport: los campos del form aparecen con stagger (cada campo 0.1s despues del anterior) desde abajo
2. Focus glow: al focusear un campo, glow azul suave alrededor
3. Submit button: ripple effect al click + scale bounce al completar

**Implementacion con GSAP ScrollTrigger para el reveal:**

```typescript
useEffect(() => {
  if (prefersReducedMotion) return;

  gsap.registerPlugin(ScrollTrigger);

  const ctx = gsap.context(() => {
    const formFields = formRef.current?.querySelectorAll('.form-field');
    if (!formFields) return;

    gsap.set(formFields, { opacity: 0, y: 30 });

    gsap.to(formFields, {
      opacity: 1,
      y: 0,
      stagger: 0.1,
      duration: 0.6,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: formRef.current,
        start: 'top 75%',
        toggleActions: 'play none none none',
      },
    });
  }, sectionRef);

  return () => ctx.revert();
}, [prefersReducedMotion]);
```

---

## Tarea 2.6: Footer - Fade-in Stagger

### Archivo: `frontend/src/components/layout/footer.tsx`

**Animacion nueva:** Las 4 columnas del footer aparecen con stagger al entrar en viewport.

Marcar `'use client'` si aun no lo es. Usar GSAP ScrollTrigger con toggleActions play-once.

---

## Tarea 2.7: Registrar ScrollTrigger Plugin globalmente

### Archivo nuevo: `frontend/src/lib/gsap-config.ts`

```typescript
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register plugins once
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };
```

Todos los componentes deben importar desde `@/lib/gsap-config` en vez de importar gsap directamente. Esto evita registrar el plugin multiples veces.

---

## Tests de Seccion 2: Animaciones

### Test: animation-gsap-cleanup
**Given** un componente con ScrollTrigger esta montado
**When** el componente se desmonta
**Then** todas las instancias de ScrollTrigger se limpian (ctx.revert() se llama)
**Type:** unit
**Layer:** frontend

### Test: animation-reduced-motion-no-gsap
**Given** `prefers-reduced-motion: reduce` esta activo
**When** la HeroSection se renderiza
**Then** NO se crean instancias de GSAP ScrollTrigger y todo el contenido es visible con opacity 1
**Type:** unit
**Layer:** frontend

### Test: animation-counter-final-value
**Given** un AnimatedCounter con value=20 y suffix="+"
**When** la animacion se completa (simulada)
**Then** el texto muestra "20+"
**Type:** unit
**Layer:** frontend

### Test: animation-services-pin-desktop-only
**Given** el viewport es < 1024px (mobile/tablet)
**When** la ServicesSection se renderiza
**Then** NO se crea ScrollTrigger con pin (las cards usan reveal simple)
**Type:** unit
**Layer:** frontend

---

# SECCION 3: Admin Dashboard Redesign

## Objetivo

Transformar el admin panel de basico a profesional SaaS-quality (estilo Vercel/Linear), con stats reales, DataTable reutilizable, y sidebar profesional.

**IMPORTANTE:** El admin NO necesita i18n. Los textos pueden estar en ingles (convencional para dashboards tech) o en espanol segun preferencia. Las rutas admin NO tienen prefijo de locale.

---

## Tarea 3.1: Instalar Dependencias Adicionales

```bash
cd frontend
# Para DataTable con sorting/filtering
npx shadcn@latest add data-table  # Si existe, sino manual
npm install @tanstack/react-table

# Para charts basicos en dashboard
npm install recharts

# Para iconos adicionales si es necesario
# lucide-react ya esta instalado
```

---

## Tarea 3.2: Admin Layout Redesign

### Archivo: `frontend/src/app/admin/layout.tsx`

**Actual:** `bg-gray-50 dark:bg-gray-900` hardcoded, sidebar fijo.

**Nuevo:**
- Background usa el theme system (`bg-background`)
- Header con breadcrumbs + user info
- Sidebar colapsable
- Container con max-width y spacing profesional

```typescript
import { auth, clerkClient } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminHeader } from '@/components/admin/admin-header';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const role = (user.publicMetadata as { role?: string })?.role;

  if (role !== 'admin') {
    redirect('/unauthorized');
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader user={{ firstName: user.firstName, imageUrl: user.imageUrl }} />
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
```

---

## Tarea 3.3: Admin Sidebar Redesign

### Archivo: `frontend/src/components/admin/admin-sidebar.tsx`

**Actual:** Sidebar basico con bg-white/gray-800, sin colapso, sin seccion de usuario.

**Nuevo:** Sidebar profesional con:
- Logo/brand en la parte superior
- Navegacion con iconos + labels
- Boton de colapso (toggle entre full y icon-only)
- Seccion inferior con: link a homepage, theme toggle
- Active state con indicador vertical (barra azul a la izquierda)
- Tooltips cuando esta colapsado

**Patron de componente:**

```typescript
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Briefcase, FileText, Users,
  Settings, ChevronLeft, ChevronRight, ExternalLink,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/services', label: 'Services', icon: Briefcase },
  { href: '/admin/blog', label: 'Blog Posts', icon: FileText },
  { href: '/admin/leads', label: 'Leads', icon: Users },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'sticky top-0 h-screen border-r border-border bg-card',
        'flex flex-col transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Brand */}
      <div className="h-16 flex items-center px-4 border-b border-border">
        <Link href="/admin" className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-primary-foreground font-bold text-sm">MA</span>
          </div>
          {!collapsed && (
            <span className="font-semibold text-foreground whitespace-nowrap">
              Admin Panel
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1" role="navigation">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg',
                'text-sm font-medium transition-colors duration-200',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
              {isActive && (
                <div className="absolute left-0 w-0.5 h-6 bg-primary rounded-r" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-border space-y-1">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          <ExternalLink className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>View Site</span>}
        </Link>

        <div className={cn('flex items-center', collapsed ? 'justify-center' : 'px-3')}>
          <ThemeToggle />
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm w-full text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
```

---

## Tarea 3.4: Admin Header

### Archivo nuevo: `frontend/src/components/admin/admin-header.tsx`

```typescript
'use client';

import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';

// Breadcrumb generation from pathname
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
            <span className={crumb.isLast ? 'font-medium text-foreground' : 'text-muted-foreground'}>
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
```

---

## Tarea 3.5: Dashboard con Stats Reales

### Archivo: `frontend/src/app/admin/page.tsx`

**Actual:** 3 cards con numeros hardcoded (4, 0, 0).

**Nuevo:**
- 4 stat cards con datos reales desde `dashboardStats` query
- Indicadores de tendencia (leads este mes vs mes pasado)
- Mini-chart de leads por mes (opcional, con Recharts)
- Quick actions: "New Service", "New Post", "View Leads"
- Actividad reciente: ultimos 5 leads

**GraphQL Query nueva:**

```typescript
// Agregar a frontend/src/lib/graphql/admin.ts
export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    dashboardStats {
      totalServices
      activeServices
      totalBlogPosts
      publishedBlogPosts
      draftBlogPosts
      totalLeads
      newLeads
      contactedLeads
      qualifiedLeads
      leadsThisMonth
      leadsLastMonth
    }
  }
`;
```

**Componente del Dashboard:**

```typescript
'use client';

import { useQuery } from '@apollo/client/react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Briefcase, FileText, Users, TrendingUp,
  TrendingDown, Plus, ArrowRight, Loader2,
} from 'lucide-react';
import { GET_DASHBOARD_STATS, GET_ADMIN_LEADS } from '@/lib/graphql/admin';
import { cn } from '@/lib/utils';

export default function AdminDashboard() {
  const { data, loading } = useQuery(GET_DASHBOARD_STATS);
  const { data: leadsData } = useQuery(GET_ADMIN_LEADS, {
    variables: { pagination: { take: 5 } },
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const stats = data?.dashboardStats;
  const recentLeads = leadsData?.leads || [];

  // Calculate lead trend
  const leadTrend = stats
    ? ((stats.leadsThisMonth - stats.leadsLastMonth) / Math.max(stats.leadsLastMonth, 1)) * 100
    : 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex gap-3">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/services/new">
              <Plus className="w-4 h-4 mr-2" />
              New Service
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/admin/blog/new">
              <Plus className="w-4 h-4 mr-2" />
              New Post
            </Link>
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Services"
          value={stats?.activeServices ?? 0}
          subtitle={`${stats?.totalServices ?? 0} total`}
          icon={Briefcase}
        />
        <StatCard
          title="Published Posts"
          value={stats?.publishedBlogPosts ?? 0}
          subtitle={`${stats?.draftBlogPosts ?? 0} drafts`}
          icon={FileText}
        />
        <StatCard
          title="Total Leads"
          value={stats?.totalLeads ?? 0}
          subtitle={`${stats?.newLeads ?? 0} new`}
          icon={Users}
        />
        <StatCard
          title="Leads This Month"
          value={stats?.leadsThisMonth ?? 0}
          trend={leadTrend}
          icon={TrendingUp}
        />
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Leads */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Leads</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/leads">
                View all <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentLeads.map((lead: any) => (
                <div key={lead.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{lead.name}</p>
                    <p className="text-xs text-muted-foreground">{lead.email}</p>
                  </div>
                  <Badge variant={lead.status === 'NEW' ? 'default' : 'secondary'}>
                    {lead.status}
                  </Badge>
                </div>
              ))}
              {recentLeads.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No leads yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Lead Funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Lead Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <FunnelBar label="New" value={stats?.newLeads ?? 0} total={stats?.totalLeads ?? 1} color="bg-blue-500" />
              <FunnelBar label="Contacted" value={stats?.contactedLeads ?? 0} total={stats?.totalLeads ?? 1} color="bg-amber-500" />
              <FunnelBar label="Qualified" value={stats?.qualifiedLeads ?? 0} total={stats?.totalLeads ?? 1} color="bg-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

**Componentes auxiliares (StatCard, FunnelBar)** se crean en el mismo archivo o en `components/admin/stat-card.tsx`.

---

## Tarea 3.6: DataTable Reutilizable

### Archivo nuevo: `frontend/src/components/admin/data-table.tsx`

Crear un componente DataTable generico usando `@tanstack/react-table` con:
- Sorting por columna (click en header)
- Busqueda global (search input)
- Paginacion (previous/next + page numbers)
- Column visibility toggle (opcional)
- Bulk select con checkboxes (opcional, para futuro)

**Props del componente:**

```typescript
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchPlaceholder?: string;
  searchColumn?: string; // Column key for search
}
```

**Implementacion:** Seguir el patron de shadcn/ui DataTable:
- Usar los componentes Table existentes de shadcn
- Agregar Input para search
- Agregar botones de paginacion

---

## Tarea 3.7: Actualizar Paginas de Admin con DataTable

### Archivos a modificar:
- `frontend/src/app/admin/services/page.tsx` -- Reemplazar Table manual con DataTable
- `frontend/src/app/admin/blog/page.tsx` -- Reemplazar Table manual con DataTable
- `frontend/src/app/admin/leads/page.tsx` -- Reemplazar Table manual con DataTable

**Para cada pagina:**
1. Definir `columns` usando `ColumnDef` de TanStack Table
2. Pasar data + columns al DataTable
3. Agregar sorting en columnas relevantes
4. Mantener funcionalidad existente (delete, edit, view)

---

## Tarea 3.8: Formularios Mejorados (Services y Blog)

### Archivos:
- `frontend/src/components/admin/forms/service-form.tsx`
- `frontend/src/components/admin/forms/blog-post-form.tsx`

**Mejoras:**
1. Layout de 2 columnas en desktop (campos principales a la izquierda, metadata/settings a la derecha)
2. Tabs o secciones para traducciones (Espanol / Ingles)
3. Preview en vivo del contenido (para blog)
4. Mejor feedback de validacion

**Ejemplo de layout para ServiceForm:**

```
+----------------------------------+------------------+
| Nombre (ES)                      | Slug             |
| Descripcion (ES)                 | Icono            |
|                                  | Orden            |
| --- Tab: English ---             | Estado: Activo   |
| Name (EN)                        |                  |
| Description (EN)                 | [Guardar]        |
+----------------------------------+------------------+
```

---

## Tests de Seccion 3: Admin

### Test: admin-dashboard-renders-stats
**Given** la query `dashboardStats` retorna stats mockeadas
**When** el dashboard se renderiza
**Then** muestra 4 stat cards con los valores correctos de la query
**Type:** unit
**Layer:** frontend

```typescript
// frontend/src/__tests__/app/admin/dashboard.test.tsx
import { render, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import AdminDashboard from '@/app/admin/page';
import { GET_DASHBOARD_STATS, GET_ADMIN_LEADS } from '@/lib/graphql/admin';

const mocks = [
  {
    request: { query: GET_DASHBOARD_STATS },
    result: {
      data: {
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
        },
      },
    },
  },
  {
    request: { query: GET_ADMIN_LEADS, variables: { pagination: { take: 5 } } },
    result: { data: { leads: [], leadsCount: 0 } },
  },
];

describe('AdminDashboard', () => {
  it('renders real stats from GraphQL', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <AdminDashboard />
      </MockedProvider>
    );

    // Wait for loading to complete
    expect(await screen.findByText('4')).toBeInTheDocument(); // activeServices
    expect(screen.getByText('3')).toBeInTheDocument(); // publishedBlogPosts
    expect(screen.getByText('20')).toBeInTheDocument(); // totalLeads
    expect(screen.getByText('12')).toBeInTheDocument(); // leadsThisMonth
  });
});
```

### Test: admin-sidebar-collapse
**Given** el sidebar esta expandido
**When** el usuario hace click en "Collapse"
**Then** el sidebar cambia su ancho de w-64 a w-16 y oculta los labels de texto
**Type:** unit
**Layer:** frontend

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { AdminSidebar } from '@/components/admin/admin-sidebar';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/admin',
}));

describe('AdminSidebar', () => {
  it('collapses when toggle is clicked', () => {
    render(<AdminSidebar />);

    // Sidebar starts expanded - labels visible
    expect(screen.getByText('Dashboard')).toBeInTheDocument();

    // Click collapse
    fireEvent.click(screen.getByText('Collapse'));

    // Labels should be hidden
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
  });
});
```

### Test: admin-datatable-sort
**Given** una DataTable con datos de servicios
**When** se hace click en el header "Name"
**Then** las filas se reordenan alfabeticamente por nombre
**Type:** unit
**Layer:** frontend

### Test: admin-datatable-search
**Given** una DataTable con 10 servicios
**When** se escribe "Web" en el campo de busqueda
**Then** solo se muestran los servicios cuyo nombre contiene "Web"
**Type:** unit
**Layer:** frontend

### Test: admin-datatable-pagination
**Given** una DataTable con 25 leads y page size de 10
**When** se hace click en "Next"
**Then** se muestran los leads 11-20
**Type:** unit
**Layer:** frontend

### Test: admin-service-form-translations-tabs
**Given** el formulario de servicio esta renderizado
**When** el usuario hace click en la tab "English"
**Then** se muestran campos "Name (EN)" y "Description (EN)"
**Type:** unit
**Layer:** frontend

### Test: admin-header-breadcrumbs
**Given** el usuario esta en `/admin/services/new`
**When** el AdminHeader se renderiza
**Then** muestra breadcrumbs: "Admin / Services / New"
**Type:** unit
**Layer:** frontend

---

## Resumen de Archivos por Seccion

### Seccion 1 (i18n) - Archivos a CREAR:

| Archivo | Contenido |
|---------|-----------|
| `frontend/i18n/routing.ts` | Definicion de locales |
| `frontend/i18n/request.ts` | getRequestConfig para Server Components |
| `frontend/i18n/navigation.ts` | Helpers de navegacion tipados |
| `frontend/messages/es.json` | Mensajes en espanol |
| `frontend/messages/en.json` | Mensajes en ingles |
| `frontend/src/middleware.ts` | Middleware de next-intl |
| `frontend/src/app/[locale]/layout.tsx` | Layout con NextIntlClientProvider |
| `frontend/src/app/[locale]/page.tsx` | Landing page (movida) |
| `frontend/src/components/ui/language-switcher.tsx` | Componente switcher |
| `frontend/src/hooks/use-translated-content.ts` | Hook para contenido dinamico |

### Seccion 1 (i18n) - Archivos a MODIFICAR:

| Archivo | Cambio |
|---------|--------|
| `frontend/src/app/layout.tsx` | Quitar lang="es", simplificar |
| `frontend/next.config.ts` | Integrar next-intl plugin |
| `frontend/src/components/sections/hero-section.tsx` | Usar `useTranslations('hero')` |
| `frontend/src/components/sections/services-section.tsx` | Usar `useTranslations('services')` |
| `frontend/src/components/sections/service-card.tsx` | Usar `useTranslations('services')` |
| `frontend/src/components/sections/experience-section.tsx` | Usar `useTranslations('experience')` |
| `frontend/src/components/sections/dual-positioning-section.tsx` | Usar `useTranslations('dualPositioning')` |
| `frontend/src/components/sections/contact-section.tsx` | Usar `useTranslations('contact')` |
| `frontend/src/components/layout/header.tsx` | Usar `useTranslations('header')` + LanguageSwitcher |
| `frontend/src/components/layout/footer.tsx` | Usar `useTranslations('footer')` |
| `frontend/src/lib/graphql/queries/services.ts` | Agregar `translations` al selection set |
| `frontend/src/lib/graphql/admin.ts` | Agregar `translations` a queries de admin |

### Seccion 2 (Animaciones) - Archivos a CREAR:

| Archivo | Contenido |
|---------|-----------|
| `frontend/src/lib/gsap-config.ts` | Registro global de ScrollTrigger |

### Seccion 2 (Animaciones) - Archivos a MODIFICAR:

| Archivo | Cambio |
|---------|--------|
| `frontend/src/components/sections/hero-section.tsx` | Agregar parallax ScrollTrigger |
| `frontend/src/components/sections/services-section.tsx` | Reescribir con scroll pin + stagger 3D |
| `frontend/src/components/sections/experience-section.tsx` | Counter animation + logo carousel |
| `frontend/src/components/sections/dual-positioning-section.tsx` | Perspective 3D mejorada |
| `frontend/src/components/sections/contact-section.tsx` | Staggered field reveal |
| `frontend/src/components/layout/footer.tsx` | Fade-in stagger |
| `frontend/src/app/globals.css` | Agregar keyframes logo-carousel |

### Seccion 3 (Admin) - Archivos a CREAR:

| Archivo | Contenido |
|---------|-----------|
| `frontend/src/components/admin/admin-header.tsx` | Header con breadcrumbs |
| `frontend/src/components/admin/data-table.tsx` | DataTable generico con TanStack |
| `frontend/src/components/admin/stat-card.tsx` | Card de estadistica reutilizable |
| `frontend/src/components/admin/funnel-bar.tsx` | Barra de funnel |

### Seccion 3 (Admin) - Archivos a MODIFICAR:

| Archivo | Cambio |
|---------|--------|
| `frontend/src/app/admin/layout.tsx` | Redesign con theme system + header |
| `frontend/src/app/admin/page.tsx` | Dashboard con stats reales |
| `frontend/src/components/admin/admin-sidebar.tsx` | Sidebar colapsable profesional |
| `frontend/src/app/admin/services/page.tsx` | Usar DataTable |
| `frontend/src/app/admin/blog/page.tsx` | Usar DataTable |
| `frontend/src/app/admin/leads/page.tsx` | Usar DataTable |
| `frontend/src/components/admin/forms/service-form.tsx` | Layout 2 columnas + tabs traducciones |
| `frontend/src/components/admin/forms/blog-post-form.tsx` | Layout 2 columnas + tabs traducciones |
| `frontend/src/lib/graphql/admin.ts` | Agregar GET_DASHBOARD_STATS actualizado |

---

## Checklist de Verificacion Final

### Seccion 1 (i18n):
- [ ] `npm run build` sin errores
- [ ] `npm run typecheck` sin errores
- [ ] URL `/` muestra contenido en espanol
- [ ] URL `/en/` muestra contenido en ingles
- [ ] Language switcher funciona en ambas direcciones
- [ ] Servicios muestran traducciones del campo `translations`
- [ ] Admin (`/admin/`) funciona sin prefijo de locale
- [ ] Todos los tests existentes pasan (con mocks actualizados)
- [ ] Nuevos tests i18n pasan

### Seccion 2 (Animaciones):
- [ ] HeroSection tiene parallax on scroll
- [ ] ServicesSection pinea y revela cards con stagger
- [ ] ExperienceSection tiene counter animation
- [ ] ExperienceSection tiene logo carousel infinito
- [ ] ContactSection tiene staggered field reveal
- [ ] `prefers-reduced-motion` desactiva todas las animaciones
- [ ] No hay memory leaks de ScrollTrigger (verificar con DevTools)
- [ ] Performance: 60fps en animaciones (verificar con DevTools)

### Seccion 3 (Admin):
- [ ] Dashboard muestra stats reales desde GraphQL
- [ ] Sidebar es colapsable
- [ ] Header tiene breadcrumbs
- [ ] DataTable tiene sorting, search, paginacion
- [ ] Formularios tienen tabs para traducciones
- [ ] Todo usa el theme system (no gray-* hardcoded)
