# Spec 01: Initial Project Setup - Plan Completo

**Estado:** COMPLETADO
**Fecha:** 2026-01-29
**Agente:** architect
**Prioridad:** ALTA

---

## Resumen Ejecutivo

Este spec define la estructura inicial completa del proyecto manuelalvarez.cloud, un sitio web de servicios profesionales con animaciones premium estilo Apple. El proyecto utiliza una arquitectura desacoplada con NestJS (GraphQL) como backend y Next.js como frontend, desplegado en Docker sobre Hostinger VPS.

### Alcance de esta Fase

1. **Backend (NestJS + GraphQL + Prisma)**
   - Setup inicial con configuracion completa
   - Modulos: Services, BlogPosts, Leads
   - Autenticacion con Clerk (JWT)
   - Dockerizacion

2. **Frontend (Next.js + Apollo + Animations)**
   - Setup inicial con App Router
   - Apollo Client configurado
   - Landing Page con Hero, Services, Contact
   - Panel Admin basico
   - Dockerizacion

3. **Infraestructura**
   - docker-compose.yml (desarrollo)
   - docker-compose.prod.yml (produccion)

---

## GraphQL Schema Propuesto

### Types

```graphql
# ============================================
# SCALARS Y ENUMS
# ============================================

scalar DateTime
scalar JSON

enum LeadStatus {
  NEW
  CONTACTED
  QUALIFIED
  PROPOSAL
  WON
  LOST
}

enum Role {
  ADMIN
  SUPER_ADMIN
}

# ============================================
# TYPES PRINCIPALES
# ============================================

type Service {
  id: ID!
  name: String!
  slug: String!
  description: String!
  icon: String
  order: Int!
  isActive: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type BlogPost {
  id: ID!
  slug: String!
  title: String!
  excerpt: String
  content: String!
  coverImage: String
  seoMetadata: JSON
  publishedAt: DateTime
  isPublished: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Lead {
  id: ID!
  name: String!
  email: String!
  company: String
  message: String!
  status: LeadStatus!
  notes: String
  createdAt: DateTime!
  updatedAt: DateTime!
}

type AdminUser {
  id: ID!
  clerkUserId: String!
  role: Role!
  createdAt: DateTime!
  updatedAt: DateTime!
}

# ============================================
# INPUT TYPES
# ============================================

# Services
input CreateServiceInput {
  name: String!
  slug: String!
  description: String!
  icon: String
  order: Int
  isActive: Boolean
}

input UpdateServiceInput {
  name: String
  slug: String
  description: String
  icon: String
  order: Int
  isActive: Boolean
}

input ServiceWhereInput {
  isActive: Boolean
}

input ServiceOrderByInput {
  order: SortOrder
  createdAt: SortOrder
}

enum SortOrder {
  asc
  desc
}

# BlogPosts
input CreateBlogPostInput {
  slug: String!
  title: String!
  excerpt: String
  content: String!
  coverImage: String
  seoMetadata: JSON
  publishedAt: DateTime
  isPublished: Boolean
}

input UpdateBlogPostInput {
  slug: String
  title: String
  excerpt: String
  content: String
  coverImage: String
  seoMetadata: JSON
  publishedAt: DateTime
  isPublished: Boolean
}

input BlogPostWhereInput {
  isPublished: Boolean
}

# Leads
input CreateLeadInput {
  name: String!
  email: String!
  company: String
  message: String!
}

input UpdateLeadInput {
  status: LeadStatus
  notes: String
}

input LeadWhereInput {
  status: LeadStatus
}

# ============================================
# QUERIES
# ============================================

type Query {
  # Services - Publico
  services(where: ServiceWhereInput, orderBy: ServiceOrderByInput): [Service!]!
  service(id: ID!): Service
  serviceBySlug(slug: String!): Service

  # BlogPosts - Publico (solo publicados)
  blogPosts(where: BlogPostWhereInput, take: Int, skip: Int): [BlogPost!]!
  blogPost(id: ID!): BlogPost
  blogPostBySlug(slug: String!): BlogPost

  # Leads - Solo Admin
  leads(where: LeadWhereInput, take: Int, skip: Int): [Lead!]!
  lead(id: ID!): Lead

  # Admin User - Solo Admin
  me: AdminUser
}

# ============================================
# MUTATIONS
# ============================================

type Mutation {
  # Services - Solo Admin
  createService(input: CreateServiceInput!): Service!
  updateService(id: ID!, input: UpdateServiceInput!): Service!
  deleteService(id: ID!): Service!

  # BlogPosts - Solo Admin
  createBlogPost(input: CreateBlogPostInput!): BlogPost!
  updateBlogPost(id: ID!, input: UpdateBlogPostInput!): BlogPost!
  deleteBlogPost(id: ID!): BlogPost!

  # Leads
  createLead(input: CreateLeadInput!): Lead!  # Publico
  updateLead(id: ID!, input: UpdateLeadInput!): Lead!  # Solo Admin
  deleteLead(id: ID!): Lead!  # Solo Admin
}
```

---

## Estructura de Directorios

### Backend (NestJS)

```
backend/
├── src/
│   ├── app.module.ts
│   ├── main.ts
│   ├── common/
│   │   ├── decorators/
│   │   │   ├── public.decorator.ts
│   │   │   └── current-user.decorator.ts
│   │   ├── guards/
│   │   │   └── clerk-auth.guard.ts
│   │   ├── interceptors/
│   │   │   └── logging.interceptor.ts
│   │   └── scalars/
│   │       └── date-time.scalar.ts
│   ├── prisma/
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   └── modules/
│       ├── auth/
│       │   ├── auth.module.ts
│       │   ├── auth.resolver.ts
│       │   └── auth.service.ts
│       ├── services/
│       │   ├── services.module.ts
│       │   ├── services.resolver.ts
│       │   ├── services.service.ts
│       │   ├── entities/
│       │   │   └── service.entity.ts
│       │   └── dto/
│       │       ├── create-service.input.ts
│       │       ├── update-service.input.ts
│       │       └── service-where.input.ts
│       ├── blog/
│       │   ├── blog.module.ts
│       │   ├── blog.resolver.ts
│       │   ├── blog.service.ts
│       │   ├── entities/
│       │   │   └── blog-post.entity.ts
│       │   └── dto/
│       │       ├── create-blog-post.input.ts
│       │       ├── update-blog-post.input.ts
│       │       └── blog-post-where.input.ts
│       └── leads/
│           ├── leads.module.ts
│           ├── leads.resolver.ts
│           ├── leads.service.ts
│           ├── entities/
│           │   └── lead.entity.ts
│           └── dto/
│               ├── create-lead.input.ts
│               ├── update-lead.input.ts
│               └── lead-where.input.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── test/
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
├── Dockerfile
├── Dockerfile.dev
├── .env.example
├── nest-cli.json
├── tsconfig.json
├── tsconfig.build.json
└── package.json
```

### Frontend (Next.js)

```
frontend/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # Landing Page
│   ├── globals.css
│   ├── (public)/
│   │   ├── services/
│   │   │   └── page.tsx
│   │   ├── blog/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/
│   │   │       └── page.tsx
│   │   └── contact/
│   │       └── page.tsx
│   ├── (auth)/
│   │   ├── sign-in/
│   │   │   └── [[...sign-in]]/
│   │   │       └── page.tsx
│   │   └── sign-up/
│   │       └── [[...sign-up]]/
│   │           └── page.tsx
│   └── admin/
│       ├── layout.tsx
│       ├── page.tsx                # Dashboard
│       ├── services/
│       │   └── page.tsx
│       ├── blog/
│       │   └── page.tsx
│       └── leads/
│           └── page.tsx
├── components/
│   ├── ui/                         # shadcn/ui
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── textarea.tsx
│   │   ├── table.tsx
│   │   └── ...
│   ├── layout/
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   └── admin-sidebar.tsx
│   ├── sections/
│   │   ├── hero-section.tsx
│   │   ├── services-section.tsx
│   │   └── contact-section.tsx
│   └── animations/
│       ├── scroll-reveal.tsx
│       ├── text-reveal.tsx
│       └── parallax-container.tsx
├── lib/
│   ├── apollo-client.ts
│   ├── apollo-provider.tsx
│   ├── graphql/
│   │   ├── queries/
│   │   │   ├── services.ts
│   │   │   ├── blog-posts.ts
│   │   │   └── leads.ts
│   │   └── mutations/
│   │       ├── services.ts
│   │       ├── blog-posts.ts
│   │       └── leads.ts
│   └── utils/
│       └── cn.ts
├── types/
│   └── graphql.ts
├── hooks/
│   ├── use-services.ts
│   ├── use-blog-posts.ts
│   └── use-scroll-animation.ts
├── middleware.ts                   # Clerk middleware
├── Dockerfile
├── Dockerfile.dev
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Casos de Test - Backend

### Services Module

#### GET /graphql - Query services

```gherkin
Feature: Services Query

  Scenario: Get all active services (Public)
    Given the database has 3 services (2 active, 1 inactive)
    When I query services with isActive: true
    Then I should receive 2 services
    And each service should have id, name, slug, description

  Scenario: Get all services without filter (Public)
    Given the database has 3 services
    When I query services without filters
    Then I should receive 3 services

  Scenario: Get service by slug (Public)
    Given a service with slug "web-development" exists
    When I query serviceBySlug with "web-development"
    Then I should receive the service details

  Scenario: Get service by non-existent slug (Public)
    When I query serviceBySlug with "non-existent"
    Then I should receive null
```

#### Mutations services (Admin)

```gherkin
Feature: Services Mutations

  Scenario: Create service without auth
    Given I am not authenticated
    When I try to create a service
    Then I should receive an Unauthorized error

  Scenario: Create service as admin
    Given I am authenticated as admin
    When I create a service with valid data
    Then the service should be created
    And I should receive the created service

  Scenario: Create service with duplicate slug
    Given I am authenticated as admin
    And a service with slug "existing" exists
    When I try to create a service with slug "existing"
    Then I should receive a conflict error

  Scenario: Update service as admin
    Given I am authenticated as admin
    And a service with id "123" exists
    When I update the service name to "New Name"
    Then the service should be updated
    And I should receive the updated service

  Scenario: Delete service as admin
    Given I am authenticated as admin
    And a service with id "123" exists
    When I delete the service
    Then the service should be removed from database
```

### BlogPosts Module

```gherkin
Feature: BlogPosts Query

  Scenario: Get published blog posts (Public)
    Given 5 blog posts exist (3 published, 2 drafts)
    When I query blogPosts with isPublished: true
    Then I should receive 3 blog posts

  Scenario: Get blog post by slug (Public)
    Given a published blog post with slug "my-first-post" exists
    When I query blogPostBySlug with "my-first-post"
    Then I should receive the full blog post with content

  Scenario: Get unpublished blog post by slug (Public)
    Given an unpublished blog post with slug "draft-post" exists
    When I query blogPostBySlug with "draft-post"
    Then I should receive null

Feature: BlogPosts Mutations

  Scenario: Create blog post as admin
    Given I am authenticated as admin
    When I create a blog post with valid markdown content
    Then the blog post should be created
    And isPublished should default to false

  Scenario: Publish blog post as admin
    Given I am authenticated as admin
    And a draft blog post exists
    When I update isPublished to true and set publishedAt
    Then the blog post should be visible publicly
```

### Leads Module

```gherkin
Feature: Leads

  Scenario: Create lead (Public - Contact Form)
    Given I am a visitor (not authenticated)
    When I submit a lead with name, email, and message
    Then the lead should be created with status NEW
    And I should receive a success response

  Scenario: Create lead with invalid email
    Given I am a visitor
    When I submit a lead with an invalid email format
    Then I should receive a validation error

  Scenario: View leads as admin
    Given I am authenticated as admin
    And 10 leads exist in the database
    When I query leads
    Then I should receive all 10 leads with full details

  Scenario: View leads without auth
    Given I am not authenticated
    When I query leads
    Then I should receive an Unauthorized error

  Scenario: Update lead status as admin
    Given I am authenticated as admin
    And a lead with status NEW exists
    When I update the lead status to CONTACTED
    Then the lead status should be updated
```

### Authentication

```gherkin
Feature: Authentication

  Scenario: Valid Clerk JWT
    Given I have a valid Clerk JWT token
    When I make a request with Authorization header
    Then the request should be authenticated
    And currentUser should be available in resolver

  Scenario: Invalid JWT
    Given I have an invalid JWT token
    When I make a request to a protected endpoint
    Then I should receive a 401 Unauthorized error

  Scenario: Expired JWT
    Given I have an expired Clerk JWT token
    When I make a request to a protected endpoint
    Then I should receive a 401 Unauthorized error

  Scenario: Public endpoint without auth
    Given I have no authorization header
    When I query services (public endpoint)
    Then I should receive the services data
```

---

## Casos de Test - Frontend

### Landing Page

```gherkin
Feature: Landing Page

  Scenario: Hero section renders
    Given I visit the landing page
    Then I should see the hero section
    And the headline should animate on load
    And the CTA button should be visible

  Scenario: Services section loads data
    Given I visit the landing page
    And the backend has active services
    When the services section enters viewport
    Then I should see the services loaded from GraphQL
    And each service card should animate in

  Scenario: Contact form submission
    Given I am on the landing page
    When I fill in the contact form with valid data
    And I submit the form
    Then I should see a success message
    And the form should reset

  Scenario: Contact form validation
    Given I am on the landing page
    When I try to submit the form with empty fields
    Then I should see validation errors
```

### Animations

```gherkin
Feature: Scroll Animations

  Scenario: Services reveal on scroll
    Given I am on the landing page
    And the services section is below the fold
    When I scroll to the services section
    Then each service card should animate in with stagger

  Scenario: Respects reduced motion preference
    Given I have prefers-reduced-motion enabled
    When I visit the landing page
    Then animations should be disabled or minimal
    And content should still be visible
```

### Admin Panel

```gherkin
Feature: Admin Access

  Scenario: Redirect unauthenticated user
    Given I am not signed in
    When I try to access /admin
    Then I should be redirected to sign-in

  Scenario: Admin dashboard loads
    Given I am signed in as admin
    When I visit /admin
    Then I should see the admin dashboard
    And I should see navigation to Services, Blog, Leads

Feature: Admin Services CRUD

  Scenario: List services
    Given I am on /admin/services
    Then I should see a table with all services
    And I should see Edit and Delete actions

  Scenario: Create service
    Given I am on /admin/services
    When I click "New Service"
    And I fill in the service form
    And I submit
    Then the service should be created
    And I should see it in the table

  Scenario: Edit service
    Given I am on /admin/services
    When I click Edit on a service
    And I modify the name
    And I save
    Then the service should be updated

Feature: Admin Leads Management

  Scenario: View leads with filters
    Given I am on /admin/leads
    When I filter by status "NEW"
    Then I should only see leads with status NEW

  Scenario: Update lead status
    Given I am on /admin/leads
    When I change a lead status to "CONTACTED"
    Then the status should update
    And I should see a success notification
```

---

## Dependencias entre Fases

```
┌─────────────────────────────────────────────────────────────────┐
│                    FASE 1: DATABASE                             │
│  - Crear schema Prisma                                          │
│  - Ejecutar prisma generate                                     │
│  - Ejecutar prisma db push                                      │
│  - Seed inicial (opcional)                                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FASE 2: BACKEND                              │
│  Archivo: spec/01a__initial-project-setup_backend.md            │
│                                                                 │
│  2.1 Setup inicial NestJS                                       │
│  2.2 Configurar Prisma Module                                   │
│  2.3 Configurar GraphQL Module                                  │
│  2.4 Implementar Auth (Clerk guards)                            │
│  2.5 Implementar Services Module                                │
│  2.6 Implementar BlogPosts Module                               │
│  2.7 Implementar Leads Module                                   │
│  2.8 Tests E2E                                                  │
│  2.9 Dockerizar                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FASE 3: FRONTEND                             │
│  Archivo: spec/01b__initial-project-setup_frontend.md           │
│                                                                 │
│  3.1 Setup inicial Next.js                                      │
│  3.2 Configurar Apollo Client                                   │
│  3.3 Configurar Clerk                                           │
│  3.4 Implementar Layout (Header, Footer)                        │
│  3.5 Implementar Landing Page                                   │
│      - Hero Section con animaciones                             │
│      - Services Section con scroll reveal                       │
│      - Contact Section con form                                 │
│  3.6 Implementar Admin Panel basico                             │
│  3.7 Tests de componentes                                       │
│  3.8 Dockerizar                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FASE 4: INFRAESTRUCTURA                      │
│                                                                 │
│  4.1 docker-compose.yml (desarrollo)                            │
│  4.2 docker-compose.prod.yml (produccion)                       │
│  4.3 Configurar .env.example para ambos proyectos               │
│  4.4 Test de integracion full-stack                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Criterios de Aceptacion

### Backend

- [ ] NestJS arranca sin errores en puerto 4000
- [ ] GraphQL Playground accesible en /graphql
- [ ] Query `services` retorna datos de la base de datos
- [ ] Query `blogPosts` filtra por isPublished
- [ ] Mutation `createLead` funciona sin autenticacion
- [ ] Mutations de admin requieren JWT valido de Clerk
- [ ] Prisma client generado correctamente
- [ ] Tests unitarios pasan (>80% coverage en services)
- [ ] Tests E2E pasan para todos los endpoints
- [ ] Docker build exitoso
- [ ] Container arranca y responde en /graphql

### Frontend

- [ ] Next.js arranca sin errores en puerto 3000
- [ ] Landing page carga y muestra contenido
- [ ] Hero section tiene animacion de texto
- [ ] Services section carga datos via GraphQL
- [ ] Services section tiene scroll-triggered animations
- [ ] Contact form envia lead al backend
- [ ] Clerk sign-in/sign-up funcionan
- [ ] Admin routes protegidas por Clerk middleware
- [ ] Admin puede ver lista de services, blogs, leads
- [ ] Admin puede crear/editar/eliminar services
- [ ] Animaciones respetan prefers-reduced-motion
- [ ] Tests de componentes pasan
- [ ] Docker build exitoso

### Integracion

- [ ] docker-compose up levanta todos los servicios
- [ ] Frontend puede comunicarse con backend via GraphQL
- [ ] Base de datos persiste datos entre reinicios
- [ ] Variables de entorno correctamente configuradas

---

## Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|--------------|---------|------------|
| Clerk JWT validation compleja | Media | Alto | Seguir documentacion oficial de Clerk para NestJS, crear wrapper simple |
| GSAP license issues | Baja | Medio | Usar solo features del core gratuito, evitar plugins premium |
| GraphQL N+1 queries | Media | Medio | Implementar DataLoader desde el inicio para relaciones |
| Docker networking issues | Media | Alto | Testear comunicacion entre containers temprano |
| CORS issues entre frontend/backend | Alta | Bajo | Configurar CORS en NestJS desde el inicio |
| Animation performance en mobile | Media | Medio | Testear en dispositivos reales, implementar fallbacks |

---

## Variables de Entorno Requeridas

### Backend (.env)

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/manuelalvarez"

# Clerk
CLERK_SECRET_KEY="sk_test_..."
CLERK_PUBLISHABLE_KEY="pk_test_..."

# Server
PORT=4000
NODE_ENV=development
```

### Frontend (.env.local)

```bash
# API
NEXT_PUBLIC_API_URL="http://localhost:4000/graphql"

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/admin"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/admin"
```

---

## Proximos Pasos

1. **Backend Dev**: Revisar `spec/01a__initial-project-setup_backend.md` e implementar
2. **Frontend Dev**: Revisar `spec/01b__initial-project-setup_frontend.md` e implementar
3. **Integracion**: Una vez ambos esten listos, testear comunicacion completa
4. **VPS**: Preparar deployment en Hostinger (futuro spec)

---

## Referencias

- PRD: `/instructions/PRD.md`
- SRS: `/instructions/SRS.md`
- UID: `/instructions/UID.md`
- Prisma Schema: Definido en SRS.md
