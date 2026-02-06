# manuelalvarez.cloud

Professional services website showcasing custom digital product development and business automation solutions. Built with Next.js 16, NestJS GraphQL, and PostgreSQL.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16 (App Router), React, TypeScript, Tailwind CSS |
| Animations | GSAP (ScrollTrigger), Framer Motion |
| UI Components | shadcn/ui |
| Backend | NestJS, TypeScript, GraphQL (Apollo Server) |
| ORM | Prisma |
| Database | PostgreSQL 16 |
| Auth | Clerk |
| Containerization | Docker, Docker Compose |

## Project Structure

```
manuelalvarez.cloud/
├── frontend/                 # Next.js 16 App (Port 3000)
│   ├── src/
│   │   ├── app/              # App Router pages
│   │   ├── components/       # React components
│   │   ├── hooks/            # Custom hooks
│   │   └── lib/              # Apollo Client, GraphQL queries
│   └── Dockerfile
│
├── backend/                  # NestJS GraphQL API (Port 4000)
│   ├── src/
│   │   ├── modules/          # Feature modules (services, blog, leads)
│   │   ├── common/           # Guards, decorators
│   │   └── prisma/           # Prisma service
│   ├── prisma/
│   │   └── schema.prisma     # Database schema
│   └── Dockerfile
│
├── nginx/                    # Nginx config for production
├── docker-compose.yml        # Development
├── docker-compose.prod.yml   # Production
└── spec/                     # Feature specifications
```

## Prerequisites

- **Node.js** 20.x or later
- **npm** 10.x or later
- **Docker** and **Docker Compose**
- **Clerk account** (for authentication) - https://clerk.com

## Quick Start

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd MannyDevClaud

# Install all dependencies (root + backend + frontend)
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..
```

### 2. Configure Environment Variables

#### Backend (`backend/.env`)

Create the file `backend/.env`:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/manuelalvarez_dev"

# Clerk Authentication (get from https://dashboard.clerk.com)
CLERK_SECRET_KEY="sk_test_your_clerk_secret_key"

# Server
PORT=4000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:3000"
```

#### Frontend (`frontend/.env.local`)

Create the file `frontend/.env.local`:

```env
# GraphQL API
NEXT_PUBLIC_API_URL="http://localhost:4000/graphql"

# Clerk Authentication (get from https://dashboard.clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_your_clerk_publishable_key"
CLERK_SECRET_KEY="sk_test_your_clerk_secret_key"
```

### 3. Start PostgreSQL

```bash
# From the backend directory
cd backend
docker-compose up -d

# Verify PostgreSQL is running
docker-compose ps
```

### 4. Setup Database

```bash
# From the backend directory
cd backend

# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Seed with sample data
npx tsx prisma/seed.ts
```

### 5. Start Development Servers

**Option A - Single command (recommended):**
```bash
# From root - starts both backend and frontend in parallel
npm run dev
```

**Option B - Separate terminals:**

Terminal 1 - Backend:
```bash
cd backend
npm run start:dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

### 6. Access the Application

- **Frontend:** http://localhost:3000
- **GraphQL Playground:** http://localhost:4000/graphql
- **Prisma Studio:** `cd backend && npx prisma studio` (opens on http://localhost:5555)

## Environment Variables Reference

### Backend Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `CLERK_SECRET_KEY` | Yes | Clerk secret key for JWT validation |
| `PORT` | No | Server port (default: 4000) |
| `NODE_ENV` | No | Environment (development/production) |
| `FRONTEND_URL` | No | Frontend URL for CORS (default: http://localhost:3000) |

### Frontend Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | GraphQL API endpoint |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk publishable key |
| `CLERK_SECRET_KEY` | Yes | Clerk secret key for middleware |

## Getting Clerk Keys

1. Go to https://clerk.com and create an account
2. Create a new application
3. Go to **API Keys** in the dashboard
4. Copy:
   - **Publishable key** → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - **Secret key** → `CLERK_SECRET_KEY`

**Note:** The app will work without Clerk keys, but authentication features will be disabled.

## Development Commands

### Root Commands (Monorepo)

```bash
# Start both backend and frontend in parallel (recommended)
npm run dev

# Start only backend
npm run dev:backend

# Start only frontend
npm run dev:frontend

# Build both projects
npm run build

# Lint both projects
npm run lint
```

### Backend Commands

```bash
cd backend

# Start development server (with hot reload)
npm run start:dev

# Start with debugger
npm run start:debug

# Build for production
npm run build

# Start production server
npm run start:prod

# Run tests
npm run test

# Run tests with watch
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run E2E tests
npm run test:e2e

# Lint code
npm run lint

# Type check
npm run typecheck
```

### Frontend Commands

```bash
cd frontend

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run tests
npm run test

# Run tests with watch
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Type check
npx tsc --noEmit
```

### Database Commands

```bash
cd backend

# Generate Prisma Client (after schema changes)
npx prisma generate

# Push schema to database (development)
npx prisma db push

# Create migration (production)
npx prisma migrate dev --name <migration_name>

# Open Prisma Studio (GUI)
npx prisma studio

# Seed database
npx tsx prisma/seed.ts

# Reset database (WARNING: deletes all data)
npx prisma db push --force-reset
```

### Docker Commands

```bash
# Start PostgreSQL (development)
cd backend && docker-compose up -d

# Stop PostgreSQL
cd backend && docker-compose down

# View logs
cd backend && docker-compose logs -f

# Start all services (from root)
docker-compose up -d

# Start production stack (from root)
docker-compose -f docker-compose.prod.yml up -d
```

## Testing

### Run All Tests

```bash
# Backend tests (57 tests)
cd backend && npm run test

# Frontend tests (28 tests)
cd frontend && npm run test
```

### Test Coverage

```bash
# Backend coverage
cd backend && npm run test:cov

# Frontend coverage
cd frontend && npm run test:coverage
```

### E2E Tests

```bash
# Backend E2E
cd backend && npm run test:e2e
```

## GraphQL API

### Public Queries (no auth required)

```graphql
# Get all active services
query {
  services {
    id
    name
    slug
    description
    icon
  }
}

# Get service by slug
query {
  serviceBySlug(slug: "web-development") {
    id
    name
    description
  }
}

# Get published blog posts
query {
  blogPosts {
    id
    title
    slug
    excerpt
    publishedAt
  }
}

# Health check
query {
  health
}
```

### Public Mutations (no auth required)

```graphql
# Create a lead (contact form)
mutation {
  createLead(input: {
    name: "John Doe"
    email: "john@example.com"
    company: "Acme Inc"
    message: "I need a website"
  }) {
    id
    status
  }
}
```

### Protected Queries/Mutations (require Clerk JWT)

```graphql
# List leads (admin only)
query {
  leads {
    id
    name
    email
    status
  }
}

# Create service (admin only)
mutation {
  createService(input: {
    name: "New Service"
    slug: "new-service"
    description: "Service description"
  }) {
    id
  }
}
```

## Troubleshooting

### PostgreSQL won't start

```bash
# Check if port 5432 is in use
lsof -i :5432

# Kill existing PostgreSQL process
sudo pkill -u postgres

# Restart Docker container
cd backend && docker-compose down && docker-compose up -d
```

### Prisma Client not found

```bash
cd backend
npx prisma generate
```

### CORS errors

Make sure `FRONTEND_URL` in backend `.env` matches your frontend URL.

### Clerk authentication not working

1. Verify both keys are set correctly
2. Check that `CLERK_SECRET_KEY` is the same in both frontend and backend
3. Ensure you're using test keys for development (start with `pk_test_` and `sk_test_`)

### Services not loading on frontend

1. Check backend is running: `curl http://localhost:4000/graphql`
2. Check browser console for errors
3. Verify `NEXT_PUBLIC_API_URL` is correct
4. Run seed if database is empty: `cd backend && npx tsx prisma/seed.ts`

## Production Deployment

See `docker-compose.prod.yml` for production configuration. The app is designed to be deployed on a VPS with:

- **Domain:** manuelalvarez.cloud
- **API:** api.manuelalvarez.cloud
- **SSL:** Let's Encrypt via Certbot

For VPS deployment instructions, use the `vps-agent` or see the deployment documentation.

## License

Private - All rights reserved.
