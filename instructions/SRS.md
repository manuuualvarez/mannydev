# Software Requirements Specification (SRS)

---

## System Design

- Production-ready, scalable web platform for a high-ticket product studio
- Public-facing marketing website with premium UX and Apple-inspired animations
- Internal admin panel for full content and business management
- **Decoupled architecture:**
  - Frontend: Next.js (App Router)
  - Backend: NestJS API with GraphQL
  - Database: PostgreSQL with Prisma ORM
- All services deployed as Docker containers on Hostinger VPS (`manuelalvarez.cloud`)
- Clear separation between:
  - Frontend UI (Next.js)
  - Backend API (NestJS)
  - Automation execution layer (n8n)
- Designed to support future expansion (auth-restricted areas, client dashboards, automation monitoring)

---

## Architecture Pattern

### Overall Architecture
- **Microservices-lite / Service-Oriented Architecture**
- Frontend and Backend as separate Docker services
- Communication via GraphQL API (HTTP/HTTPS)
- Shared PostgreSQL database

### Frontend Architecture
- **Next.js App Router**
- React Server Components for initial data fetching
- Client Components for interactive animations and UI
- Apollo Client or urql for GraphQL consumption

### Backend Architecture
- **NestJS Framework**
- Modular architecture with feature-based modules
- **GraphQL API** using `@nestjs/graphql` with Apollo Server
- **Prisma ORM** for type-safe database access
- **DTOs (Data Transfer Objects)** with `class-validator` and `class-transformer`
- Service layer for business logic
- Resolver layer for GraphQL operations

### Why GraphQL over REST?
- Single endpoint simplifies frontend data fetching
- Client requests exactly what it needs (no over-fetching)
- Strong typing with auto-generated types
- Excellent support in NestJS ecosystem
- **VPS Compatibility:** GraphQL works perfectly on VPS - it's just HTTP requests
- Introspection and GraphQL Playground for development

---

## State Management

### Frontend
- **Server Components** for static/cached data
- **Client-side state:**
  - React hooks for local UI state
  - Apollo Client cache for GraphQL data
  - Zustand (optional) for complex client state if needed
- Animation state managed by GSAP/Framer Motion

### Backend
- Stateless API design
- Session/auth state managed by Clerk tokens
- Database as single source of truth

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        VPS (manuelalvarez.cloud)                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Docker Network                         │   │
│  │                                                          │   │
│  │   ┌─────────────┐    GraphQL    ┌─────────────────┐     │   │
│  │   │   Next.js   │◄─────────────►│     NestJS      │     │   │
│  │   │  Frontend   │               │     Backend     │     │   │
│  │   │   :3000     │               │      :4000      │     │   │
│  │   └─────────────┘               └────────┬────────┘     │   │
│  │                                          │              │   │
│  │                                    Prisma│              │   │
│  │                                          ▼              │   │
│  │   ┌─────────────┐               ┌─────────────────┐     │   │
│  │   │     n8n     │◄─────────────►│   PostgreSQL    │     │   │
│  │   │    :5678    │    Direct DB   │     :5432      │     │   │
│  │   └─────────────┘               └─────────────────┘     │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│                    ┌─────────────────┐                          │
│                    │  Nginx/Traefik  │                          │
│                    │  Reverse Proxy  │                          │
│                    │    SSL/TLS      │                          │
│                    └─────────────────┘                          │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
                    ┌─────────────────┐
                    │    Internet     │
                    │                 │
                    │ manuelalvarez.cloud (frontend)
                    │ api.manuelalvarez.cloud (backend)
                    │ n8n.manuelalvarez.cloud (automation)
                    └─────────────────┘
```

### Request Flow
1. User visits `manuelalvarez.cloud`
2. Nginx routes to Next.js container
3. Next.js fetches data from `api.manuelalvarez.cloud` via GraphQL
4. NestJS processes request, queries PostgreSQL via Prisma
5. Response flows back through the stack

### n8n Integration
- n8n workflows read/write directly to PostgreSQL
- Can also call NestJS GraphQL API for complex operations
- Triggers automation based on database events or webhooks

---

## Technical Stack

### Frontend
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:**
  - GSAP (GreenSock) for scroll-based and timeline animations
  - Framer Motion for React component animations
  - Three.js / React Three Fiber for 3D effects (optional)
- **GraphQL Client:** Apollo Client or urql
- **Code Generation:** GraphQL Code Generator for type safety

### Backend
- **Framework:** NestJS
- **Language:** TypeScript
- **API:** GraphQL (Apollo Server via `@nestjs/graphql`)
- **ORM:** Prisma
- **Validation:** class-validator, class-transformer
- **Documentation:** GraphQL Playground / Apollo Studio

### Database
- **Engine:** PostgreSQL 15+
- **ORM:** Prisma
- **Migrations:** Prisma Migrate

### Infrastructure
- **VPS:** Hostinger
- **Domain:** manuelalvarez.cloud
- **Containerization:** Docker + Docker Compose
- **Reverse Proxy:** Nginx or Traefik
- **SSL:** Let's Encrypt (auto-renewal via certbot or Traefik)

### Automation
- **Engine:** n8n (self-hosted)
- **Integration:** Direct PostgreSQL access + GraphQL API

---

## Authentication Process

- Authentication handled by **Clerk**
- Clerk integrated with both Next.js and NestJS:
  - Frontend: `@clerk/nextjs`
  - Backend: JWT verification via `@clerk/clerk-sdk-node`
- Authentication flow:
  1. User authenticates via Clerk on frontend
  2. Clerk provides JWT token
  3. Frontend sends token in Authorization header to backend
  4. NestJS Guard validates JWT with Clerk
  5. User context available in resolvers
- Public routes accessible without auth
- Admin routes protected via Clerk middleware + role checks
- User identity mapped internally to admin role (single admin initially)

---

## Route Design

### Frontend Routes (Next.js)

#### Public Routes
- `/` – Landing page (with scroll animations)
- `/services` – Services overview
- `/services/[slug]` – Individual service page
- `/blog` – Blog listing
- `/blog/[slug]` – Blog post
- `/contact` – Contact form

#### Auth Routes
- `/sign-in` – Clerk sign-in
- `/sign-up` – Clerk sign-up (future)
- `/account` – User account (future)

#### Admin Routes (Protected)
- `/admin` – Dashboard overview
- `/admin/pages` – Page management
- `/admin/services` – Service management
- `/admin/blog` – Blog post management
- `/admin/faqs` – FAQ management
- `/admin/companies` – Company/client management
- `/admin/leads` – Lead management
- `/admin/certifications` – Certification management

### Backend Routes (NestJS GraphQL)

Single GraphQL endpoint: `/graphql`

- Queries and Mutations organized by feature module
- Subscriptions for real-time features (future)

---

## API Design (GraphQL)

### Schema Organization
```
src/
├── modules/
│   ├── auth/
│   │   └── auth.resolver.ts
│   ├── pages/
│   │   ├── pages.resolver.ts
│   │   ├── pages.service.ts
│   │   └── dto/
│   │       ├── create-page.input.ts
│   │       └── update-page.input.ts
│   ├── services/
│   ├── blog/
│   ├── companies/
│   ├── certifications/
│   ├── faqs/
│   └── leads/
```

### DTO Pattern (class-validator)
```typescript
// Example: CreateBlogPostInput
@InputType()
export class CreateBlogPostInput {
  @Field()
  @IsString()
  @MinLength(3)
  title: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  slug: string;

  @Field()
  @IsString()
  content: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  seoMetadata?: Record<string, any>;
}
```

### GraphQL Operations Examples

#### Queries
```graphql
query GetServices {
  services(where: { isActive: true }) {
    id
    name
    description
    slug
  }
}

query GetBlogPost($slug: String!) {
  blogPost(slug: $slug) {
    id
    title
    content
    publishedAt
    seoMetadata
  }
}
```

#### Mutations
```graphql
mutation CreateLead($input: CreateLeadInput!) {
  createLead(input: $input) {
    id
    email
    status
  }
}

mutation UpdateService($id: ID!, $input: UpdateServiceInput!) {
  updateService(id: $id, input: $input) {
    id
    name
    isActive
  }
}
```

---

## Database Design (Prisma Schema)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model AdminUser {
  id          String   @id @default(cuid())
  clerkUserId String   @unique @map("clerk_user_id")
  role        Role     @default(ADMIN)
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@map("admin_users")
}

enum Role {
  ADMIN
  SUPER_ADMIN
}

model Page {
  id          String   @id @default(cuid())
  slug        String   @unique
  title       String
  content     String   @db.Text
  seoMetadata Json?    @map("seo_metadata")
  isPublished Boolean  @default(false) @map("is_published")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@map("pages")
}

model Service {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String   @db.Text
  icon        String?
  order       Int      @default(0)
  isActive    Boolean  @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@map("services")
}

model BlogPost {
  id          String    @id @default(cuid())
  slug        String    @unique
  title       String
  excerpt     String?
  content     String    @db.Text
  coverImage  String?   @map("cover_image")
  seoMetadata Json?     @map("seo_metadata")
  publishedAt DateTime? @map("published_at")
  isPublished Boolean   @default(false) @map("is_published")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  @@map("blog_posts")
}

model Company {
  id          String   @id @default(cuid())
  name        String
  logoUrl     String?  @map("logo_url")
  description String?
  website     String?
  order       Int      @default(0)
  isVisible   Boolean  @default(true) @map("is_visible")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@map("companies")
}

model Certification {
  id            String   @id @default(cuid())
  title         String
  provider      String
  credentialUrl String?  @map("credential_url")
  issueDate     DateTime? @map("issue_date")
  order         Int      @default(0)
  isVisible     Boolean  @default(true) @map("is_visible")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  @@map("certifications")
}

model FAQ {
  id        String   @id @default(cuid())
  question  String
  answer    String   @db.Text
  order     Int      @default(0)
  isVisible Boolean  @default(true) @map("is_visible")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("faqs")
}

model Lead {
  id        String     @id @default(cuid())
  name      String
  email     String
  company   String?
  message   String     @db.Text
  status    LeadStatus @default(NEW)
  notes     String?    @db.Text
  createdAt DateTime   @default(now()) @map("created_at")
  updatedAt DateTime   @updatedAt @map("updated_at")

  @@map("leads")
}

enum LeadStatus {
  NEW
  CONTACTED
  QUALIFIED
  PROPOSAL
  WON
  LOST
}

model SiteSettings {
  id        String   @id @default(cuid())
  key       String   @unique
  value     Json
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("site_settings")
}
```

---

## Docker Setup

### Development (docker-compose.dev.yml)
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    volumes:
      - ./backend:/app
      - /app/node_modules
    ports:
      - "4000:4000"
    environment:
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}
    depends_on:
      - postgres

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    volumes:
      - ./frontend:/app
      - /app/node_modules
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:4000/graphql
    depends_on:
      - backend

volumes:
  postgres_data:
```

### Production (docker-compose.prod.yml)
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    restart: always
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    restart: always
    environment:
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}
      NODE_ENV: production
    depends_on:
      - postgres

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    restart: always
    environment:
      NEXT_PUBLIC_API_URL: https://api.manuelalvarez.cloud/graphql
      NODE_ENV: production
    depends_on:
      - backend

  n8n:
    image: n8nio/n8n
    restart: always
    environment:
      DB_TYPE: postgresdb
      DB_POSTGRESDB_HOST: postgres
      DB_POSTGRESDB_PORT: 5432
      DB_POSTGRESDB_DATABASE: ${DB_NAME}
      DB_POSTGRESDB_USER: ${DB_USER}
      DB_POSTGRESDB_PASSWORD: ${DB_PASSWORD}
    volumes:
      - n8n_data:/home/node/.n8n
    depends_on:
      - postgres

  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    depends_on:
      - frontend
      - backend
      - n8n

volumes:
  postgres_data:
  n8n_data:
```

---

## Notes

- All entities stored in PostgreSQL via Prisma
- Schema designed to be easily consumed by n8n workflows
- Leads and content entities can be used as automation triggers or agent context
- GraphQL Playground available at `/graphql` in development
- Type safety enforced end-to-end: Prisma → NestJS → GraphQL → Frontend

---
