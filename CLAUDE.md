# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**manuelalvarez.cloud** is a professional services website for a development studio. It showcases custom digital product development and business automation solutions. The project features premium Apple-inspired scroll animations, 3D effects, and immersive service presentations.

**Current Status:** Specification phase complete. Implementation not yet started.

## Architecture

Monorepo structure with separated frontend and backend:

```
project-root/
├── frontend/                   # Next.js 16 (App Router) - Port 3000
├── backend/                    # NestJS GraphQL API - Port 4000
├── spec/                       # Feature specifications (numbered: XX__name.md)
├── instructions/               # PRD, SRS, UID documentation
├── docker-compose.yml          # Development
└── docker-compose.prod.yml     # Production
```

### Communication Flow

Frontend ↔ Backend via GraphQL at `http://localhost:4000/graphql` (dev) or `https://api.manuelalvarez.cloud/graphql` (prod).

## Tech Stack

| Layer      | Technology                                    |
|------------|-----------------------------------------------|
| Frontend   | Next.js 16, React, TypeScript, Tailwind CSS   |
| UI         | shadcn/ui                                     |
| Animations | GSAP (ScrollTrigger), Framer Motion           |
| Backend    | NestJS, TypeScript, GraphQL (Apollo Server)   |
| ORM        | Prisma                                        |
| Database   | PostgreSQL 15+                                |
| Auth       | Clerk (shared JWT between frontend/backend)  |
| Hosting    | Hostinger VPS (Docker containers)             |

## Development Commands

### Root (Monorepo)
```bash
npm run dev              # Start backend + frontend in parallel
npm run dev:backend      # Start only backend
npm run dev:frontend     # Start only frontend
npm run build            # Build both projects
npm run lint             # Lint both projects
```

### Frontend (from `frontend/`)
```bash
npm run dev              # Start dev server (:3000)
npm run build            # Production build
npm run lint             # ESLint
npm run typecheck        # TypeScript check
npm run test             # Vitest + React Testing Library
rm -rf .next             # Clear cache
```

### Backend (from `backend/`)
```bash
npm run start:dev        # Start with watch (:4000)
npm run start:debug      # With debugger
npm run build            # Compile
npm run lint             # ESLint
npm run typecheck        # TypeScript check
npm run test             # Unit tests
npm run test:e2e         # E2E tests
```

### Database (from `backend/`)
```bash
npx prisma generate      # Regenerate Prisma Client
npx prisma db push       # Apply schema to database
npx prisma migrate dev   # Create migration
npx prisma studio        # Prisma Studio GUI
npx prisma db seed       # Seed database
```

### Docker
```bash
docker-compose up -d                                    # Development
docker-compose -f docker-compose.prod.yml up -d         # Production
docker-compose logs -f backend                          # Follow logs
```

## MCP Servers

Configured in `.mcp.json`:

| Server | Purpose |
|--------|---------|
| `next-devtools` | Next.js DevTools - errors, logs, page metadata, project structure |
| `shadcn` | shadcn/ui component management |
| `playwright` | Browser automation and visual testing |
| `prisma-local` | Database management (Prisma Studio, migrations) |

### Next.js DevTools MCP Tools

| Tool | Use |
|------|-----|
| `get_errors` | Get build, runtime, and TypeScript errors from dev server |
| `get_logs` | Get path to dev server logs (browser console + server output) |
| `get_page_metadata` | Get metadata about specific pages (routes, components) |
| `get_project_metadata` | Get project structure, config, and dev server URL |
| `get_server_action_by_id` | Look up Server Actions by ID |

## Specialized Agents

This project uses Claude Code agents for development. Invoke using the Task tool with the appropriate `subagent_type`:

| Agent          | Purpose                                                          |
|----------------|------------------------------------------------------------------|
| `architect`    | Feature planning, specs in `/spec/`, orchestration, README updates |
| `backend-dev`  | NestJS/GraphQL implementation                                    |
| `frontend-dev` | Next.js/React with Apple-style animations                        |
| `vps-agent`    | DevOps, Hostinger VPS deployment                                 |

## Key Patterns

### GraphQL (Backend)

- **Resolver pattern:** Use `@Public()` decorator for unauthenticated queries
- **Auth:** `@UseGuards(ClerkAuthGuard)` + `@Roles('admin')` for protected mutations
- **Validation:** class-validator decorators on InputType DTOs
- **Services:** Inject PrismaService, use Logger for important operations

### Animations (Frontend)

- **GSAP + ScrollTrigger** for scroll-based reveals (Apple-style)
- **Framer Motion** for React component animations
- **Performance:** Only animate `transform` and `opacity`
- **Accessibility:** Always respect `prefers-reduced-motion`
- **Cleanup:** Kill ScrollTrigger instances in useEffect cleanup

### Spec Files

Feature specs use incremental numbering in `/spec/`:
```
spec/XX__feature-name.md           # Architect plan
spec/XXa__feature-name_backend.md  # Backend tasks
spec/XXb__feature-name_frontend.md # Frontend tasks
```

## VPS Deployment

### Critical Restrictions

⚠️ **NEVER touch n8n** - It runs in production on the VPS (port 5678)

- Always use `--project-name manuelalvarez-prod` with docker-compose
- Never run `docker stop $(docker ps -aq)` or `docker system prune -a`
- Always list containers first before any destructive command

### Subdomains

| Subdomain                  | Service   | Port |
|----------------------------|-----------|------|
| manuelalvarez.cloud        | Frontend  | 3000 |
| api.manuelalvarez.cloud    | Backend   | 4000 |
| n8n.manuelalvarez.cloud    | n8n       | 5678 |

## Development Workflow (TDD)

This project follows Test-Driven Development via the Ralph Loop:

1. **Phase 1 (Architect):** Design contracts, define test cases, create specs
2. **Phase 2 (Backend):** RED → GREEN → REFACTOR cycle
3. **Phase 3 (Frontend):** RED → GREEN → REFACTOR cycle
4. **Phase 4:** Integration testing, end-to-end validation

### Verification Checklist

**Backend:** Build succeeds, tests pass, GraphQL Playground works, MCP Prisma verification

**Frontend:** TypeScript compiles, tests pass, Playwright MCP verification, responsive testing, animation testing

## Reference Documentation

- `instructions/PRD.md` - Product requirements
- `instructions/SRS.md` - Software requirements + Prisma schema (single source of truth)
- `instructions/UID.md` - UI design + animation specifications

## Language

Agent communications and specs are written in Spanish. Code comments and documentation in English.
