You are a senior full-stack engineer and product-focused architect.

Your task is to help build a production-ready web application based on the following Product Requirements Document (PRD). You must strictly follow the product intent, avoid unnecessary complexity, and make reasonable technical decisions when details are not explicitly defined.

Act as if this product will be used in a real business.

========================
PRODUCT REQUIREMENTS DOCUMENT (PRD)
========================

# Product Requirements Document (PRD)

## 1. Elevator Pitch

This product is a professional services website that showcases custom digital product development and business automation solutions. It positions an experienced development studio as a product partner for companies and individuals who want to build MVPs, web applications, mobile apps, and workflow automations using tools like n8n.

The site combines a high-end marketing landing page with authenticated access and a powerful admin panel to manage content and offerings. The platform features premium Apple-inspired scroll animations, 3D effects, and immersive service presentations.

**The entire stack is self-hosted on a Hostinger VPS at `manuelalvarez.cloud`, using Docker for both frontend and backend services.**

---

## 2. Who is this app for

### Primary Users
- Founders, entrepreneurs, and small businesses
- Companies looking to build MVPs or custom digital products
- Clients interested in workflow automation (sales, operations, customer support, internal processes)

### Secondary Users
- The site owner (admin), who manages content, services, leads, and business presence

---

## 3. Functional Requirements

### Public / Client-Facing
- High-quality landing page presenting:
  - Services offered (Web Development, Mobile Apps, MVPs, Automations)
  - Clear value proposition and differentiators
  - Company experience and track record
  - Courses and certifications held by the company or its founder
  - Companies the business has worked with
  - Clear calls-to-action (contact, hire, request automation)
- **Premium Visual Experience:**
  - Apple-inspired scroll-based animations that reveal and animate services
  - Smooth parallax effects and 3D depth transitions
  - Services presented with immersive "product reveal" animations (similar to Apple product pages)
  - Micro-interactions on every interactive element
- Fully responsive design (desktop, tablet, mobile) with optimized animations per device
- SEO-friendly structure and metadata

---

### Authentication (Phase-based)
- Authentication system using Clerk
- Ability to restrict access to certain pages or content to authenticated users only

---

### Admin Section
- Secure admin dashboard
- Manage landing page content (texts, sections, services)
- Manage service offerings (MVPs, automations, consulting, custom development)
- Manage courses and certifications
- Manage companies and clients the business has worked with
- Manage blog posts:
  - Rich text or Markdown
  - Code snippets and images
  - Titles, descriptions, and SEO metadata
- Handle FAQs content
- View and manage inbound leads or contact requests
- Toggle visibility of pages, sections, and features without redeploying

---

### Automation Offering
- Ability to present n8n-based automation services
- Clear separation between:
  - Marketing website (Next.js on VPS)
  - Backend API (NestJS on VPS)
  - Automation execution layer (n8n on same VPS)
- Future capability to trigger, manage, or monitor automations per client

---

### Infrastructure

#### Hosting
- **VPS Provider:** Hostinger
- **Domain:** `manuelalvarez.cloud`
- **Deployment Strategy:** Docker containers with Docker Compose

#### Services Architecture
- **Frontend:** Next.js (App Router) - Dockerized
- **Backend:** NestJS API - Dockerized
- **Database:** PostgreSQL - Dockerized
- **Automation:** n8n self-hosted - Dockerized
- **Reverse Proxy:** Nginx or Traefik for SSL and routing

#### Subdomains (suggested)
- `manuelalvarez.cloud` → Frontend (Next.js)
- `api.manuelalvarez.cloud` → Backend (NestJS)
- `n8n.manuelalvarez.cloud` → Automation (n8n)

---

## 4. User Stories

### Visitor / Potential Client
- As a visitor, I want to quickly understand what services are offered
- As a visitor, I want to experience a premium, Apple-quality visual presentation
- As a potential client, I want to see examples of delivered solutions
- As a visitor, I want an easy way to contact or hire the company
- As a client, I want to feel confident the company delivers complete products
- As a mobile user, I want smooth, performant animations that don't drain my battery

---

### Authenticated User (Future Scope)
- As an authenticated user, I want access to exclusive or private content
- As a client, I may want dashboards or automation status in the future

---

### Admin (Product Owner)
- As an admin, I want to edit landing content without redeploying
- As an admin, I want to manage service offerings
- As an admin, I want to manage blog posts with code snippets
- As an admin, I want to manage SEO metadata
- As an admin, I want to review and respond to inbound leads
- As an admin, I want full control over public visibility

---

## 5. User Interface

### Design Principles
- Clean, modern, premium aesthetic
- Trust-focused design
- Strong typography and spacing
- **Apple-inspired scroll animations** for service reveals
- **3D depth effects** using transforms and perspective
- Subtle animations and micro-interactions throughout

---

### Key Screens
- Landing Page (with immersive animated sections)
- Services Page (each service with its own "reveal" animation)
- Blog
- Authentication screens
- Admin Dashboard

---

### UX Considerations
- Fast load times (optimized Docker images, CDN for assets)
- Mobile-first design with graceful animation degradation
- Clear conversion paths
- Respect `prefers-reduced-motion` for accessibility

========================
INSTRUCTIONS
========================

- Use Next.js (App Router) for frontend with modern best practices
- Use NestJS for backend API with GraphQL (primary) or REST endpoints
- Use Prisma as ORM with PostgreSQL
- Dockerize both applications for VPS deployment
- Prefer simplicity and clarity over abstraction
- Assume this is a real production system
- Clearly explain architectural decisions when relevant
- Do NOT invent features outside the PRD
- If something is undefined, make a reasonable default decision and explain it briefly
- Output clean, readable, maintainable code

Start by proposing:
1. Overall architecture
2. Tech stack choices
3. Initial folder structure (monorepo or separate repos)
4. Data models for the backend (Prisma schema)
5. Docker setup for development and production

Then proceed iteratively.
