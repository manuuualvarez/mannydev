# Spec 02: Complete Site Features - Plan Completo

**Estado:** PENDIENTE
**Fecha:** 2026-01-30
**Agente:** architect
**Prioridad:** ALTA

---

## Resumen Ejecutivo

Este spec define la implementacion de las funcionalidades faltantes para completar el sitio manuelalvarez.cloud:

1. **Paginas faltantes** - Services, Blog, Contact (actualmente retornan 404)
2. **Entidades faltantes** - Company, Certification (definidas en SRS pero no implementadas)
3. **Seccion de experiencia profesional** - CV data, dual positioning
4. **Dark mode** - Theme toggle con persistencia
5. **Animaciones premium restantes** - Parallax, 3D effects, micro-interactions

### Contexto del Owner

Manuel Ignacio Alvarez es un Senior iOS Developer con 6+ anos de experiencia en:
- **Empresas**: PayPal (Venmo), SmartJob, Kubikware, PedidosYa, Lipo (Warao Technologies)
- **Skills**: Swift, SwiftUI, UIKit, MVVM, VIPER, MVP, CocoaPods, SPM, Git
- **Certificaciones**: Full-Stack E-Commerce (SwiftUI, Node.js, Postgres), NestJS, Next.js, iOS & Swift Testing
- **Idiomas**: English B2+, Spanish native
- **Actualmente estudiando**: Python Programming, LLMs

El sitio debe posicionarlo tanto como empleado potencial ("Hire me") como proveedor de servicios ("Buy my services").

---

## Diagnostico del Estado Actual

### Backend - Modulos Implementados

| Modulo | Estado | Notas |
|--------|--------|-------|
| Services | COMPLETO | CRUD funcional |
| BlogPosts | COMPLETO | CRUD funcional |
| Leads | COMPLETO | CRUD funcional |
| Auth (Clerk) | COMPLETO | Guards configurados |
| **Companies** | NO EXISTE | Definido en SRS, no implementado |
| **Certifications** | NO EXISTE | Definido en SRS, no implementado |
| **Pages** | NO EXISTE | Definido en SRS, no implementado |
| **FAQs** | NO EXISTE | Definido en SRS, no implementado |
| **SiteSettings** | NO EXISTE | Definido en SRS, no implementado |

### Frontend - Paginas Implementadas

| Ruta | Estado | Notas |
|------|--------|-------|
| `/` | COMPLETO | Landing con Hero, Services, Contact |
| `/services` | NO EXISTE | 404 |
| `/services/[slug]` | NO EXISTE | 404 |
| `/blog` | NO EXISTE | 404 |
| `/blog/[slug]` | NO EXISTE | 404 |
| `/contact` | NO EXISTE | 404 (solo seccion en landing) |
| `/admin/*` | PARCIAL | Estructura basica |

### Schema Prisma Actual

```prisma
// IMPLEMENTADOS
model AdminUser { ... }
model Service { ... }
model BlogPost { ... }
model Lead { ... }

// FALTANTES (definidos en SRS)
model Company { ... }      // Para logos de empresas
model Certification { ... } // Para cursos/certificaciones
model Page { ... }          // Para contenido de paginas
model FAQ { ... }           // Para preguntas frecuentes
model SiteSettings { ... }  // Para configuracion
```

---

## Plan de Implementacion

### Fase 1: Backend - Entidades Faltantes

**Archivo de tareas:** `spec/02a__complete-site-features_backend.md`

**Orden de implementacion:**

1. **Actualizar Schema Prisma** (15 min)
   - Agregar models: Company, Certification, Page, FAQ, SiteSettings
   - Ejecutar migraciones

2. **Modulo Companies** (2 hrs)
   - Entity, DTOs, Service, Resolver
   - Queries publicas: companies (con filtro isVisible)
   - Mutations protegidas: CRUD

3. **Modulo Certifications** (2 hrs)
   - Entity, DTOs, Service, Resolver
   - Queries publicas: certifications (con filtro isVisible)
   - Mutations protegidas: CRUD

4. **Modulo Pages** (1.5 hrs)
   - Entity, DTOs, Service, Resolver
   - Queries publicas: pageBySlug (solo published)
   - Mutations protegidas: CRUD

5. **Modulo FAQs** (1.5 hrs)
   - Entity, DTOs, Service, Resolver
   - Queries publicas: faqs (con filtro isVisible)
   - Mutations protegidas: CRUD

6. **Modulo SiteSettings** (1 hr)
   - Entity, DTOs, Service, Resolver
   - Query publica: getSetting(key)
   - Mutations protegidas: setSetting

7. **Extender Service Entity** (30 min)
   - Agregar campos: features (JSON), longDescription, benefits
   - Para paginas individuales de servicio

8. **Seed Data** (1 hr)
   - Companies del CV: PayPal, SmartJob, Kubikware, PedidosYa, Lipo
   - Certifications del CV
   - Services iniciales con contenido completo

9. **Tests** (2 hrs)
   - Unit tests para cada service
   - E2E tests para queries publicas

---

### Fase 2: Frontend - Paginas y Dark Mode

**Archivo de tareas:** `spec/02b__complete-site-features_frontend.md`

**Orden de implementacion:**

1. **Dark Mode System** (2 hrs)
   - ThemeProvider con next-themes
   - CSS variables para dark mode
   - Toggle en header
   - Persistencia en localStorage

2. **Pagina /services** (3 hrs)
   - Grid de servicios con animaciones
   - Filtros por categoria (futuro)
   - Cards con hover effects

3. **Pagina /services/[slug]** (4 hrs)
   - Layout de pagina de servicio individual
   - Hero con animacion
   - Features list
   - CTA section
   - Related services

4. **Pagina /blog** (3 hrs)
   - Grid de posts con paginacion
   - Cards con image parallax
   - Filtros por fecha

5. **Pagina /blog/[slug]** (4 hrs)
   - Layout de blog post
   - MDX rendering con syntax highlighting
   - Table of contents
   - Share buttons
   - Related posts

6. **Pagina /contact** (2 hrs)
   - Reutilizar ContactSection
   - Agregar mapa o info adicional
   - FAQ section

7. **Seccion Experience/Companies** (3 hrs)
   - Logo carousel infinito
   - Grayscale -> color on hover
   - Modal con detalles de rol

8. **Seccion Certifications** (2 hrs)
   - Cards con flip animation
   - Badge-style presentation
   - Link a credenciales

9. **Dual Positioning Section** (2 hrs)
   - "Hire as Employee" vs "Buy Services"
   - Tab o toggle view
   - Different CTAs

10. **Landing Page Enhancements** (3 hrs)
    - Agregar secciones: Companies, Certifications, Process
    - Mejorar animaciones existentes
    - Counter animations

11. **Admin Pages** (4 hrs)
    - Companies CRUD
    - Certifications CRUD
    - Pages CRUD
    - FAQs CRUD
    - Settings

12. **Tests** (3 hrs)
    - Component tests
    - Integration tests con MSW

---

## Arquitectura de Dark Mode

```
Frontend Theme System
=====================

ThemeProvider (next-themes)
    |
    +-- useTheme() hook
    |       |
    |       +-- theme: 'light' | 'dark' | 'system'
    |       +-- setTheme(theme)
    |
    +-- CSS Variables
            |
            +-- :root (light mode defaults)
            +-- .dark (dark mode overrides)
            +-- prefers-color-scheme media query

CSS Variable Structure:
-----------------------
:root {
  --background: 0 0% 100%;           // #ffffff
  --foreground: 0 0% 3.9%;           // #0a0a0a
  --primary: 221.2 83.2% 53.3%;      // #0066cc
  --secondary: 240 4.8% 95.9%;       // #f4f4f5
  --muted: 240 4.8% 95.9%;           // #f4f4f5
  --muted-foreground: 240 3.8% 46.1%; // #71717a
  --accent: 221.2 83.2% 53.3%;       // #0066cc
  --border: 240 5.9% 90%;            // #e4e4e7
  --card: 0 0% 100%;                 // #ffffff
}

.dark {
  --background: 0 0% 3.9%;           // #0a0a0a
  --foreground: 0 0% 98%;            // #fafafa
  --primary: 217.2 91.2% 59.8%;      // #3b82f6
  --secondary: 240 3.7% 15.9%;       // #27272a
  --muted: 240 3.7% 15.9%;           // #27272a
  --muted-foreground: 240 5% 64.9%;  // #a1a1aa
  --accent: 217.2 91.2% 59.8%;       // #3b82f6
  --border: 240 3.7% 15.9%;          // #27272a
  --card: 0 0% 3.9%;                 // #0a0a0a
}
```

---

## Arquitectura de Paginas

### /services

```
+------------------------------------------+
|              [Header]                     |
+------------------------------------------+
|                                          |
|    Services                              |
|    =========                             |
|    Subheadline explicativo               |
|                                          |
|    +--------+  +--------+  +--------+    |
|    |Service |  |Service |  |Service |    |
|    |  Card  |  |  Card  |  |  Card  |    |
|    |   1    |  |   2    |  |   3    |    |
|    +--------+  +--------+  +--------+    |
|                                          |
|    +--------+  +--------+                |
|    |Service |  |Service |                |
|    |  Card  |  |  Card  |                |
|    |   4    |  |   5    |                |
|    +--------+  +--------+                |
|                                          |
|    [CTA: Start a Project]                |
|                                          |
+------------------------------------------+
|              [Footer]                     |
+------------------------------------------+
```

### /services/[slug]

```
+------------------------------------------+
|              [Header]                     |
+------------------------------------------+
|                                          |
|    [Icon Animation]                      |
|                                          |
|    Service Name                          |
|    ============                          |
|    Long description paragraph...         |
|                                          |
+------------------------------------------+
|                                          |
|    What you get                          |
|    -------------                         |
|    * Feature 1                           |
|    * Feature 2                           |
|    * Feature 3                           |
|    * Feature 4                           |
|                                          |
+------------------------------------------+
|                                          |
|    Benefits                              |
|    --------                              |
|    [Grid of benefit cards]               |
|                                          |
+------------------------------------------+
|                                          |
|    [CTA Section]                         |
|    Ready to start?                       |
|    [Contact Button]                      |
|                                          |
+------------------------------------------+
|                                          |
|    Other Services                        |
|    ---------------                       |
|    [Related services cards]              |
|                                          |
+------------------------------------------+
|              [Footer]                     |
+------------------------------------------+
```

### /blog

```
+------------------------------------------+
|              [Header]                     |
+------------------------------------------+
|                                          |
|    Blog                                  |
|    ====                                  |
|    Insights and tutorials                |
|                                          |
|    +----------------------------------+  |
|    |     Featured Post (Large)        |  |
|    |     [Image with parallax]        |  |
|    |     Title                        |  |
|    |     Excerpt...                   |  |
|    +----------------------------------+  |
|                                          |
|    +----------+  +----------+            |
|    | Post 2   |  | Post 3   |            |
|    | [Image]  |  | [Image]  |            |
|    | Title    |  | Title    |            |
|    +----------+  +----------+            |
|                                          |
|    [Load More / Pagination]              |
|                                          |
+------------------------------------------+
|              [Footer]                     |
+------------------------------------------+
```

### /blog/[slug]

```
+------------------------------------------+
|              [Header]                     |
+------------------------------------------+
|                                          |
|    [Cover Image - Full Width]            |
|                                          |
+------------------------------------------+
|                                          |
|    Title                                 |
|    =====                                 |
|    Published: Date | Reading time        |
|                                          |
|    [Table of Contents]                   |
|                                          |
|    Content...                            |
|    - Markdown rendering                  |
|    - Code blocks with syntax             |
|    - Images                              |
|                                          |
|    [Share Buttons]                       |
|                                          |
+------------------------------------------+
|                                          |
|    Related Posts                         |
|    -------------                         |
|    [Grid of related posts]               |
|                                          |
+------------------------------------------+
|              [Footer]                     |
+------------------------------------------+
```

---

## GraphQL Schema Additions

### Types Nuevos

```graphql
type Company {
  id: ID!
  name: String!
  logoUrl: String
  description: String
  website: String
  role: String              # "Senior iOS Developer"
  period: String            # "2022 - Present"
  highlights: [String!]     # Bullet points de logros
  order: Int!
  isVisible: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Certification {
  id: ID!
  title: String!
  provider: String!
  credentialUrl: String
  issueDate: DateTime
  badgeUrl: String          # URL del badge/imagen
  skills: [String!]         # Skills relacionados
  order: Int!
  isVisible: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Page {
  id: ID!
  slug: String!
  title: String!
  content: String!
  seoMetadata: JSON
  isPublished: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type FAQ {
  id: ID!
  question: String!
  answer: String!
  category: String          # Para agrupar
  order: Int!
  isVisible: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type SiteSetting {
  id: ID!
  key: String!
  value: JSON!
  createdAt: DateTime!
  updatedAt: DateTime!
}

# Extender Service existente
extend type Service {
  features: [String!]       # Lista de features
  longDescription: String   # Descripcion larga para pagina individual
  benefits: JSON            # { title, description, icon }[]
  priceRange: String        # "$5k - $15k"
  timeline: String          # "4-8 weeks"
}
```

### Queries Nuevas

```graphql
extend type Query {
  # Companies
  companies(where: CompanyWhereInput): [Company!]!
  company(id: ID!): Company

  # Certifications
  certifications(where: CertificationWhereInput): [Certification!]!
  certification(id: ID!): Certification

  # Pages
  pageBySlug(slug: String!): Page

  # FAQs
  faqs(where: FAQWhereInput): [FAQ!]!

  # Settings
  getSetting(key: String!): SiteSetting
}
```

### Mutations Nuevas

```graphql
extend type Mutation {
  # Companies (Admin)
  createCompany(input: CreateCompanyInput!): Company!
  updateCompany(id: ID!, input: UpdateCompanyInput!): Company!
  deleteCompany(id: ID!): Company!

  # Certifications (Admin)
  createCertification(input: CreateCertificationInput!): Certification!
  updateCertification(id: ID!, input: UpdateCertificationInput!): Certification!
  deleteCertification(id: ID!): Certification!

  # Pages (Admin)
  createPage(input: CreatePageInput!): Page!
  updatePage(id: ID!, input: UpdatePageInput!): Page!
  deletePage(id: ID!): Page!

  # FAQs (Admin)
  createFAQ(input: CreateFAQInput!): FAQ!
  updateFAQ(id: ID!, input: UpdateFAQInput!): FAQ!
  deleteFAQ(id: ID!): FAQ!

  # Settings (Admin)
  setSetting(key: String!, value: JSON!): SiteSetting!
}
```

---

## Seed Data

### Companies (del CV)

```typescript
const companies = [
  {
    name: 'PayPal (Venmo)',
    logoUrl: '/logos/paypal.svg',
    role: 'Senior iOS Developer',
    period: '2023 - Present',
    highlights: [
      'Led feature development for Venmo mobile app',
      'Implemented SwiftUI components',
      'Improved app performance by 30%',
    ],
    order: 1,
  },
  {
    name: 'SmartJob',
    logoUrl: '/logos/smartjob.svg',
    role: 'iOS Developer',
    period: '2022 - 2023',
    highlights: [
      'Built job matching algorithm integration',
      'Developed push notification system',
    ],
    order: 2,
  },
  {
    name: 'Kubikware',
    logoUrl: '/logos/kubikware.svg',
    role: 'iOS Developer',
    period: '2021 - 2022',
    highlights: [
      'Created IoT control interfaces',
      'Implemented Bluetooth connectivity',
    ],
    order: 3,
  },
  {
    name: 'PedidosYa',
    logoUrl: '/logos/pedidosya.svg',
    role: 'iOS Developer',
    period: '2019 - 2021',
    highlights: [
      'Contributed to core delivery app',
      'Implemented real-time tracking',
    ],
    order: 4,
  },
  {
    name: 'Lipo (Warao Technologies)',
    logoUrl: '/logos/lipo.svg',
    role: 'Junior iOS Developer',
    period: '2017 - 2019',
    highlights: [
      'First iOS development role',
      'Built fintech features',
    ],
    order: 5,
  },
];
```

### Certifications (del CV)

```typescript
const certifications = [
  {
    title: 'Full-Stack E-Commerce',
    provider: 'Udemy',
    skills: ['SwiftUI', 'Node.js', 'PostgreSQL'],
    issueDate: new Date('2024-06-01'),
    order: 1,
  },
  {
    title: 'NestJS Masterclass',
    provider: 'Udemy',
    skills: ['NestJS', 'TypeScript', 'GraphQL'],
    issueDate: new Date('2024-03-01'),
    order: 2,
  },
  {
    title: 'Next.js Complete Guide',
    provider: 'Udemy',
    skills: ['Next.js', 'React', 'TypeScript'],
    issueDate: new Date('2024-01-01'),
    order: 3,
  },
  {
    title: 'iOS & Swift Testing',
    provider: 'Essential Developer',
    skills: ['XCTest', 'TDD', 'Swift'],
    issueDate: new Date('2023-09-01'),
    order: 4,
  },
];
```

### Services (expandidos)

```typescript
const services = [
  {
    name: 'MVP Development',
    slug: 'mvp-development',
    description: 'Launch your product idea fast with a production-ready MVP.',
    longDescription: `
      We help startups and entrepreneurs transform their ideas into working products.
      Our MVP development process focuses on core features that validate your business
      hypothesis while laying a foundation for future growth.
    `,
    features: [
      'User authentication & onboarding',
      'Core business logic implementation',
      'Payment integration',
      'Admin dashboard',
      'Analytics setup',
    ],
    benefits: [
      { title: 'Fast to Market', description: '4-8 weeks delivery' },
      { title: 'Scalable Foundation', description: 'Built to grow' },
      { title: 'Full Ownership', description: 'Complete source code' },
    ],
    priceRange: '$8k - $25k',
    timeline: '4-8 weeks',
    icon: 'rocket',
    order: 1,
  },
  {
    name: 'Web Applications',
    slug: 'web-applications',
    description: 'Custom web applications built with modern technologies.',
    longDescription: `
      From complex dashboards to customer-facing platforms, we build web applications
      that are fast, secure, and maintainable. Using Next.js, React, and TypeScript
      for the best developer and user experience.
    `,
    features: [
      'Server-side rendering for SEO',
      'Real-time features',
      'API integrations',
      'Role-based access control',
      'Mobile-responsive design',
    ],
    icon: 'globe',
    order: 2,
  },
  {
    name: 'Mobile Apps',
    slug: 'mobile-apps',
    description: 'Native iOS apps with exceptional user experience.',
    longDescription: `
      Leverage our 6+ years of iOS development experience. We build native Swift
      applications that follow Apple's Human Interface Guidelines and deliver
      delightful user experiences.
    `,
    features: [
      'Native Swift/SwiftUI',
      'App Store optimization',
      'Push notifications',
      'In-app purchases',
      'Analytics integration',
    ],
    icon: 'smartphone',
    order: 3,
  },
  {
    name: 'Business Automation',
    slug: 'business-automation',
    description: 'Automate workflows and save hours every week.',
    longDescription: `
      We identify repetitive processes in your business and automate them using
      n8n, custom scripts, and API integrations. Free your team to focus on
      high-value work.
    `,
    features: [
      'Workflow analysis',
      'n8n automation setup',
      'API integrations',
      'Slack/Email notifications',
      'Data synchronization',
    ],
    icon: 'zap',
    order: 4,
  },
];
```

---

## Dependencias entre Fases

```
┌─────────────────────────────────────────────────────────────────┐
│                    FASE 1: BACKEND                               │
│  Archivo: spec/02a__complete-site-features_backend.md           │
│                                                                  │
│  1.1 Actualizar Schema Prisma                                   │
│  1.2 Implementar Companies Module                               │
│  1.3 Implementar Certifications Module                          │
│  1.4 Implementar Pages Module                                   │
│  1.5 Implementar FAQs Module                                    │
│  1.6 Implementar SiteSettings Module                            │
│  1.7 Extender Service Entity                                    │
│  1.8 Seed Data completo                                         │
│  1.9 Tests                                                      │
│                                                                  │
│  BLOQUEANTE para:                                               │
│  - Frontend queries de companies/certifications                 │
│  - Frontend service pages individuales                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FASE 2: FRONTEND                              │
│  Archivo: spec/02b__complete-site-features_frontend.md          │
│                                                                  │
│  2.1 Dark Mode System (puede comenzar en paralelo)              │
│  2.2 /services page                                             │
│  2.3 /services/[slug] page (requiere backend 1.7)               │
│  2.4 /blog page                                                 │
│  2.5 /blog/[slug] page                                          │
│  2.6 /contact page                                              │
│  2.7 Companies section (requiere backend 1.2)                   │
│  2.8 Certifications section (requiere backend 1.3)              │
│  2.9 Dual positioning section                                   │
│  2.10 Landing page enhancements                                 │
│  2.11 Admin pages                                               │
│  2.12 Tests                                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Criterios de Aceptacion

### Backend

- [ ] Schema Prisma actualizado con todas las entidades
- [ ] Modulo Companies: CRUD funcional, queries publicas
- [ ] Modulo Certifications: CRUD funcional, queries publicas
- [ ] Modulo Pages: CRUD funcional, query por slug
- [ ] Modulo FAQs: CRUD funcional, queries publicas
- [ ] Modulo SiteSettings: get/set funcional
- [ ] Service extendido con campos adicionales
- [ ] Seed data con datos reales del CV
- [ ] Tests unitarios pasan (>80% coverage)
- [ ] Tests E2E pasan
- [ ] GraphQL Playground muestra nuevos types

### Frontend

- [ ] Dark mode funciona con toggle en header
- [ ] Dark mode persiste en localStorage
- [ ] /services muestra grid de servicios con animaciones
- [ ] /services/[slug] muestra pagina de servicio individual
- [ ] /blog muestra grid de posts con paginacion
- [ ] /blog/[slug] muestra post completo con MDX
- [ ] /contact muestra formulario expandido
- [ ] Companies section con logo carousel
- [ ] Certifications section con card flip
- [ ] Dual positioning visible en hero/about
- [ ] Landing page completa con todas las secciones
- [ ] Admin CRUD para nuevas entidades
- [ ] Tests de componentes pasan (>70% coverage)
- [ ] Responsive en mobile/tablet/desktop
- [ ] Animaciones respetan prefers-reduced-motion

---

## Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|--------------|---------|------------|
| Schema migration issues | Media | Alto | Hacer backup antes de migrar, usar db push en dev |
| Dark mode flicker on load | Alta | Bajo | Usar script blocking en head para detectar theme |
| Logo assets no disponibles | Media | Bajo | Usar placeholders SVG, agregar logos incrementalmente |
| MDX rendering complexity | Media | Medio | Usar biblioteca probada como next-mdx-remote |
| Animation performance | Media | Medio | Profile en dispositivos reales, disable en low-end |
| Seed data maintenance | Baja | Bajo | Documentar proceso de actualizacion |

---

## Estimacion de Tiempo

| Fase | Tarea | Horas |
|------|-------|-------|
| Backend | Schema + Migrations | 1 |
| Backend | Companies Module | 2 |
| Backend | Certifications Module | 2 |
| Backend | Pages Module | 1.5 |
| Backend | FAQs Module | 1.5 |
| Backend | SiteSettings Module | 1 |
| Backend | Extend Service | 0.5 |
| Backend | Seed Data | 1 |
| Backend | Tests | 2 |
| **Backend Total** | | **12.5 hrs** |
| Frontend | Dark Mode | 2 |
| Frontend | /services | 3 |
| Frontend | /services/[slug] | 4 |
| Frontend | /blog | 3 |
| Frontend | /blog/[slug] | 4 |
| Frontend | /contact | 2 |
| Frontend | Companies Section | 3 |
| Frontend | Certifications Section | 2 |
| Frontend | Dual Positioning | 2 |
| Frontend | Landing Enhancements | 3 |
| Frontend | Admin Pages | 4 |
| Frontend | Tests | 3 |
| **Frontend Total** | | **35 hrs** |
| **TOTAL** | | **47.5 hrs** |

---

## Referencias

- PRD: `/instructions/PRD.md`
- SRS: `/instructions/SRS.md` (schema Prisma original)
- UID: `/instructions/UID.md` (animaciones)
- CV Owner: Manuel Ignacio Alvarez
- Spec 01: `/spec/01__initial-project-setup.md`
