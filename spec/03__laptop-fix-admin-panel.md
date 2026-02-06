# Spec: MacBook Animation Fix + Admin Panel - Plan Completo

**Estado:** COMPLETADO
**Fecha:** 2026-02-04
**Agente:** architect
**Prioridad:** ALTA

---

## Resumen Ejecutivo

Este spec aborda tres problemas críticos identificados:

1. **MacBook Animation** - Los colores actuales (zinc-700/800/900) no parecen una laptop real. Falta brillo metálico y contraste adecuado en ambos modos (light/dark).

2. **Admin Panel** - No existe sección de administración. Se necesita implementar rutas protegidas `/admin/*` con autenticación Clerk y verificación de rol admin via `publicMetadata`.

3. **CRUD Admin** - El panel admin debe permitir gestionar todo el contenido renderizado: Services, BlogPosts, Leads (y en futuro: Companies, Certifications, FAQs, Pages, Settings).

---

## Diagnóstico del Estado Actual

### MacBook Animation - Problemas Visuales

| Modo | Problema | Impacto |
|------|----------|---------|
| Light | Colores zinc-700/800 muy opacos, sin brillo metálico | No parece aluminio Apple |
| Dark | zinc-800/900 se confunde con fondo oscuro | Laptop casi invisible |
| Ambos | Sin gradientes de brillo/reflejo metálico | Aspecto plano, no premium |

**Colores actuales (incorrectos):**
```css
/* Light mode */
bg-gradient-to-b from-zinc-700 to-zinc-800 border-zinc-600/50

/* Dark mode */
dark:bg-gradient-to-b dark:from-zinc-800 dark:to-zinc-900 dark:border-zinc-700/50
```

**Referencia visual real MacBook:**
- Space Gray: #7D7D7D → #4A4A4A (con reflejos más claros)
- Silver: #C0C0C0 → #A0A0A0 (con reflejos brillantes)
- Space Black (M3): #2D2D2D → #1A1A1A (con borde brillante)

### Admin Panel - Estado

| Aspecto | Estado | Ubicación Esperada |
|---------|--------|-------------------|
| Rutas admin | NO EXISTE | `/admin/*` |
| Layout admin | NO EXISTE | `app/admin/layout.tsx` |
| Middleware Clerk | PARCIAL | `middleware.ts` (sin protección admin) |
| Role validation | NO EXISTE | `publicMetadata.role === 'admin'` |

### Backend API - Estado

| Módulo | Queries Públicas | Mutations Admin | Estado |
|--------|-----------------|-----------------|--------|
| Services | ✅ | ✅ | LISTO |
| BlogPosts | ✅ | ✅ | LISTO |
| Leads | N/A | ✅ | LISTO |

**El backend YA soporta todas las operaciones CRUD necesarias.**

---

## Plan de Implementación

### Fase 1: Fix MacBook Animation (Frontend)

**Archivo de tareas:** `spec/03b__laptop-fix-admin-panel_frontend.md`

**Cambios en:** `frontend/src/components/backgrounds/macbook-scroll-background.tsx`

1. Rediseñar paleta de colores para simular aluminio real
2. Agregar gradientes de brillo metálico
3. Mejorar contraste en dark mode (bordes más claros)
4. Agregar efecto de reflejo sutil en la superficie
5. Ajustar opacidad del glow inferior

### Fase 2: Admin Panel - Infraestructura (Frontend)

**Archivo de tareas:** `spec/03b__laptop-fix-admin-panel_frontend.md`

1. Crear middleware de Clerk para proteger `/admin/*`
2. Crear layout admin con sidebar
3. Implementar verificación de rol via `publicMetadata`
4. Crear página dashboard `/admin`
5. Crear script para setear rol admin en Clerk

### Fase 3: Admin CRUD Pages (Frontend)

**Archivo de tareas:** `spec/03b__laptop-fix-admin-panel_frontend.md`

1. `/admin/services` - Lista + Create/Edit/Delete
2. `/admin/blog` - Lista + Create/Edit/Delete
3. `/admin/leads` - Lista + View/Update Status

### Fase 4: Backend Adjustments (Si necesario)

**Archivo de tareas:** `spec/03a__laptop-fix-admin-panel_backend.md`

1. Verificar que guards de autenticación funcionan
2. Agregar query `me` para obtener usuario actual
3. Verificar validación de roles en mutations admin

---

## GraphQL Schema (Ya Existente)

### Queries Admin (Protegidas)
```graphql
# Services
query AdminServices {
  services(where: { isActive: null }) { # null = todos
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

# Blog Posts
query AdminBlogPosts($pagination: BlogPaginationInput) {
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

# Leads
query AdminLeads($where: LeadWhereInput, $pagination: LeadPaginationInput) {
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
}
```

### Mutations Admin (Protegidas)
```graphql
# Services
mutation CreateService($input: CreateServiceInput!) {
  createService(input: $input) { id name slug }
}

mutation UpdateService($id: ID!, $input: UpdateServiceInput!) {
  updateService(id: $id, input: $input) { id name slug }
}

mutation DeleteService($id: ID!) {
  deleteService(id: $id) { id }
}

# Blog Posts
mutation CreateBlogPost($input: CreateBlogPostInput!) {
  createBlogPost(input: $input) { id slug title }
}

mutation UpdateBlogPost($id: ID!, $input: UpdateBlogPostInput!) {
  updateBlogPost(id: $id, input: $input) { id slug title }
}

mutation DeleteBlogPost($id: ID!) {
  deleteBlogPost(id: $id) { id }
}

# Leads
mutation UpdateLead($id: ID!, $input: UpdateLeadInput!) {
  updateLead(id: $id, input: $input) { id status notes }
}

mutation DeleteLead($id: ID!) {
  deleteLead(id: $id) { id }
}
```

---

## Test Cases (TDD)

### Frontend Tests

#### MacBook Animation Tests
```gherkin
Feature: MacBook Scroll Animation Visual Quality

Scenario: MacBook has metallic appearance in light mode
  Given the user is on the landing page in light mode
  When they scroll to reveal the MacBook
  Then the MacBook should have silver/gray metallic gradients
  And there should be visible highlight/reflection effects
  And the laptop should contrast well with the light background

Scenario: MacBook has metallic appearance in dark mode
  Given the user is on the landing page in dark mode
  When they scroll to reveal the MacBook
  Then the MacBook should have darker metallic gradients with lighter edges
  And there should be subtle highlight effects
  And the laptop should be clearly visible against dark background

Scenario: Animation respects reduced motion
  Given the user has prefers-reduced-motion enabled
  When they view the landing page
  Then the MacBook should be displayed in open position
  And no scroll-based animations should occur
```

#### Admin Panel Tests
```gherkin
Feature: Admin Panel Access Control

Scenario: Non-authenticated user cannot access admin
  Given the user is not signed in
  When they navigate to /admin
  Then they should be redirected to /sign-in

Scenario: Authenticated non-admin cannot access admin
  Given the user is signed in without admin role
  When they navigate to /admin
  Then they should see an "Access Denied" message
  Or be redirected to home page

Scenario: Admin user can access admin panel
  Given the user is signed in with admin role in publicMetadata
  When they navigate to /admin
  Then they should see the admin dashboard
  And the sidebar should show navigation options
```

#### Admin CRUD Tests
```gherkin
Feature: Admin Services Management

Scenario: Admin can view all services
  Given the admin is on /admin/services
  Then they should see a table with all services
  And each row should show name, slug, status, actions

Scenario: Admin can create a new service
  Given the admin clicks "New Service"
  When they fill in the form with valid data
  And click "Save"
  Then a new service should be created
  And they should see a success notification
  And the services list should update

Scenario: Admin can edit an existing service
  Given the admin clicks "Edit" on a service
  When they modify the name
  And click "Save"
  Then the service should be updated
  And the list should reflect the changes

Scenario: Admin can delete a service
  Given the admin clicks "Delete" on a service
  When they confirm the deletion
  Then the service should be removed
  And the list should update
```

### Backend Tests

```gherkin
Feature: Admin Authentication Guard

Scenario: Unauthenticated request to admin mutation fails
  Given no Authorization header is present
  When a createService mutation is sent
  Then the response should be 401 Unauthorized

Scenario: Non-admin user cannot execute admin mutations
  Given a valid JWT for a non-admin user
  When a createService mutation is sent
  Then the response should be 403 Forbidden

Scenario: Admin user can execute admin mutations
  Given a valid JWT for an admin user
  When a createService mutation is sent with valid input
  Then the service should be created successfully
```

---

## Dependencias entre Fases

```
Fase 1 (MacBook Fix) ──────────────────────────────> INDEPENDIENTE
                                                      (puede hacerse en paralelo)

Fase 2 (Admin Infra) ─────> Fase 3 (Admin CRUD)
         │
         └── Requiere: Clerk middleware, layout, role check

Fase 4 (Backend) ─────────> Solo si tests fallan
```

**Orden recomendado:**
1. Fase 1 + Fase 4 en paralelo (son independientes)
2. Fase 2 (infraestructura admin)
3. Fase 3 (páginas CRUD)

---

## Criterios de Aceptación

### MacBook Animation
- [ ] En light mode: laptop tiene aspecto metálico plateado con reflejos
- [ ] En dark mode: laptop es claramente visible con bordes más claros
- [ ] Animación scroll funciona suavemente
- [ ] `prefers-reduced-motion` es respetado
- [ ] Tests de componente pasan

### Admin Panel
- [ ] Usuarios no autenticados son redirigidos a sign-in
- [ ] Usuarios sin rol admin ven mensaje de acceso denegado
- [ ] Usuarios admin pueden acceder a todas las páginas admin
- [ ] Sidebar muestra navegación correcta
- [ ] Layout es responsive

### Admin CRUD
- [ ] Services: listar, crear, editar, eliminar funcionan
- [ ] Blog Posts: listar, crear, editar, eliminar funcionan
- [ ] Leads: listar, ver detalle, cambiar status funcionan
- [ ] Notificaciones de éxito/error se muestran
- [ ] Datos se actualizan en tiempo real (refetch)

---

## Riesgos y Mitigaciones

| Riesgo | Probabilidad | Mitigación |
|--------|--------------|------------|
| Clerk publicMetadata no configurado | Alta | Crear script/instrucciones para setear rol |
| Backend guards no validan rol | Media | Verificar y ajustar ClerkAuthGuard |
| Colores MacBook siguen sin verse bien | Baja | Iterar con referencias visuales reales |
| GraphQL mutations fallan silenciosamente | Media | Agregar error handling robusto |

---

## Script para Setear Admin Role

Para setear el rol de admin en Clerk, se puede:

1. **Via Clerk Dashboard:**
   - Ir a Users → Seleccionar usuario
   - Edit → Public Metadata
   - Agregar: `{ "role": "admin" }`

2. **Via API/Script (recomendado):**
```typescript
// scripts/set-admin-role.ts
import { clerkClient } from '@clerk/nextjs/server';

async function setAdminRole(userId: string) {
  const client = await clerkClient();
  await client.users.updateUser(userId, {
    publicMetadata: { role: 'admin' }
  });
  console.log(`Admin role set for user ${userId}`);
}

// Ejecutar con: npx ts-node scripts/set-admin-role.ts USER_ID
const userId = process.argv[2];
if (userId) setAdminRole(userId);
```

---

## Archivos a Crear/Modificar

### Frontend (Fase 1-3)
```
frontend/
├── src/
│   ├── components/
│   │   ├── backgrounds/
│   │   │   └── macbook-scroll-background.tsx  # MODIFICAR
│   │   └── admin/
│   │       ├── admin-sidebar.tsx              # CREAR
│   │       ├── services-table.tsx             # CREAR
│   │       ├── blog-table.tsx                 # CREAR
│   │       ├── leads-table.tsx                # CREAR
│   │       └── forms/
│   │           ├── service-form.tsx           # CREAR
│   │           └── blog-post-form.tsx         # CREAR
│   ├── app/
│   │   └── admin/
│   │       ├── layout.tsx                     # CREAR
│   │       ├── page.tsx                       # CREAR (dashboard)
│   │       ├── services/
│   │       │   ├── page.tsx                   # CREAR
│   │       │   ├── new/page.tsx               # CREAR
│   │       │   └── [id]/edit/page.tsx         # CREAR
│   │       ├── blog/
│   │       │   ├── page.tsx                   # CREAR
│   │       │   ├── new/page.tsx               # CREAR
│   │       │   └── [id]/edit/page.tsx         # CREAR
│   │       └── leads/
│   │           ├── page.tsx                   # CREAR
│   │           └── [id]/page.tsx              # CREAR
│   ├── lib/
│   │   └── graphql/
│   │       ├── queries/
│   │       │   └── admin.ts                   # CREAR
│   │       └── mutations/
│   │           └── admin.ts                   # CREAR
│   └── middleware.ts                          # MODIFICAR
├── scripts/
│   └── set-admin-role.ts                      # CREAR
```

### Backend (Fase 4 - si necesario)
```
backend/
├── src/
│   └── modules/
│       └── auth/
│           └── auth.guard.ts                  # VERIFICAR/MODIFICAR
```

---

## Notas de Implementación

### MacBook Colors (Propuesta)

```css
/* Light Mode - Silver MacBook */
.macbook-body-light {
  background: linear-gradient(
    180deg,
    #E8E8E8 0%,      /* Highlight superior */
    #C4C4C4 20%,     /* Aluminio claro */
    #A8A8A8 50%,     /* Aluminio medio */
    #8C8C8C 80%,     /* Aluminio oscuro */
    #707070 100%     /* Sombra inferior */
  );
  border-color: rgba(180, 180, 180, 0.5);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.1) inset,
    0 1px 2px rgba(0, 0, 0, 0.1);
}

/* Dark Mode - Space Gray MacBook */
.macbook-body-dark {
  background: linear-gradient(
    180deg,
    #5A5A5A 0%,      /* Highlight superior (más brillante) */
    #4A4A4A 20%,     /* Aluminio claro */
    #3A3A3A 50%,     /* Aluminio medio */
    #2A2A2A 80%,     /* Aluminio oscuro */
    #1A1A1A 100%     /* Sombra inferior */
  );
  border-color: rgba(100, 100, 100, 0.5);  /* Borde más claro para contraste */
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.05) inset,
    0 1px 2px rgba(0, 0, 0, 0.3);
}
```

### Admin Role Check Pattern

```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isAdminRoute = createRouteMatcher(['/admin(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (isAdminRoute(req)) {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return auth.redirectToSignIn();
    }

    const role = sessionClaims?.publicMetadata?.role;
    if (role !== 'admin') {
      return Response.redirect(new URL('/unauthorized', req.url));
    }
  }
});
```

---

**Siguiente paso:** Crear archivos de spec para backend y frontend developers.
