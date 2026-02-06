# Spec: UI Premium / i18n / Admin Overhaul - Plan Completo

**Estado:** PENDIENTE
**Fecha:** 2026-02-05
**Agente:** architect
**Prioridad:** ALTA

---

## Resumen Ejecutivo

El proyecto manuelalvarez.cloud tiene una base funcional solida (backend NestJS con GraphQL, frontend Next.js 16 con landing page y admin panel basico), pero presenta tres deficiencias criticas que impiden su lanzamiento profesional:

1. **Todo el contenido esta en ingles**, pero el publico objetivo es argentino. No existe sistema de internacionalizacion.
2. **Las animaciones son basicas** (Framer Motion simple con useInView). No hay GSAP ScrollTrigger real (pin + reveal), no hay parallax genuino, y los efectos 3D son superficiales (rotateX/Y en hover solamente). La landing no compite visualmente con sitios como Apple, Linear o Stripe.
3. **El admin panel es funcional pero visualmente pobre**: dashboard con 3 cards hardcoded, sidebar basico con colores gray-*, tablas sin sorting/filtering, sin estadisticas reales.

Este spec orquesta una refactorizacion completa en 4 fases secuenciales, priorizando no romper lo existente mientras se transforma la experiencia.

---

## Diagnostico del Estado Actual

### Arquitectura Actual

```
Frontend (Next.js 16)
├── app/
│   ├── page.tsx                    # Landing (Server Component, importa sections)
│   ├── layout.tsx                  # RootLayout: ClerkProvider > ThemeProvider > ApolloWrapper
│   ├── globals.css                 # Variables CSS + utilidades premium
│   ├── blog/page.tsx               # Lista blog
│   ├── services/page.tsx           # Lista servicios
│   ├── contact/page.tsx            # Formulario contacto
│   ├── (auth)/sign-in/             # Clerk sign-in
│   ├── (auth)/sign-up/             # Clerk sign-up
│   ├── unauthorized/page.tsx       # 403 page
│   └── admin/
│       ├── layout.tsx              # Auth check server-side (Clerk)
│       ├── page.tsx                # Dashboard (3 cards HARDCODED)
│       ├── services/               # CRUD servicios
│       ├── blog/                   # CRUD blog posts
│       └── leads/                  # Lista + detalle leads
├── components/
│   ├── sections/
│   │   ├── hero-section.tsx        # GSAP timeline basico + Framer Motion badge
│   │   ├── services-section.tsx    # Framer Motion useInView (NO ScrollTrigger)
│   │   ├── service-card.tsx        # 3D hover con rotateX/Y (NO scroll-based)
│   │   ├── experience-section.tsx  # Framer Motion useInView, datos HARDCODED
│   │   ├── dual-positioning-section.tsx  # Tabs con AnimatePresence
│   │   └── contact-section.tsx     # Form con useMutation
│   ├── layout/
│   │   ├── header.tsx              # Glassmorphism header, nav links EN INGLES
│   │   └── footer.tsx              # Footer EN INGLES, links hardcoded
│   ├── admin/
│   │   ├── admin-sidebar.tsx       # Sidebar basico (bg-white/gray-800)
│   │   └── forms/
│   │       ├── service-form.tsx    # Form crear/editar servicio
│   │       └── blog-post-form.tsx  # Form crear/editar blog post
│   └── ui/                         # shadcn/ui (14 componentes)
├── hooks/
│   ├── use-reduced-motion.ts       # Accessibility hook
│   └── use-services.ts             # Apollo hook para servicios
├── lib/
│   └── graphql/
│       ├── queries/services.ts     # GET_SERVICES, GET_SERVICE_BY_SLUG
│       ├── mutations/leads.ts      # CREATE_LEAD
│       └── admin.ts                # Todas las queries/mutations admin
└── __tests__/                      # 75 tests (12 archivos)

Backend (NestJS)
├── modules/
│   ├── auth/                       # Clerk JWT validation, me query
│   ├── services/                   # CRUD completo, @Public() queries
│   ├── blog/                       # CRUD completo, published/draft separation
│   └── leads/                      # CRUD completo, count query
├── common/
│   ├── decorators/                 # @Public(), @Roles(), @CurrentUser()
│   └── guards/                     # ClerkAuthGuard
└── prisma/
    └── schema.prisma               # 4 modelos: AdminUser, Service, BlogPost, Lead
```

### Problemas Identificados

| Area | Problema | Severidad |
|------|----------|-----------|
| i18n | Todo el texto UI esta hardcoded en ingles | CRITICA |
| i18n | No hay campo de traducciones en Prisma schema | CRITICA |
| i18n | No hay mecanismo para contenido dinamico bilingue | CRITICA |
| Animaciones | ServicesSection usa Framer Motion useInView, no GSAP ScrollTrigger | ALTA |
| Animaciones | No hay scroll pinning en ninguna seccion | ALTA |
| Animaciones | ExperienceSection tiene datos hardcoded, sin counter animation | ALTA |
| Animaciones | No hay parallax real (solo orbs con CSS animation) | ALTA |
| Animaciones | HeroSection tiene GSAP basico (timeline lineal, sin scroll-based) | MEDIA |
| Admin | Dashboard con 3 cards con numeros hardcoded (4, 0, 0) | ALTA |
| Admin | Sidebar usa bg-white/gray-800 en vez del theme system | MEDIA |
| Admin | Tablas sin sorting ni filtering (excepto leads con status filter) | MEDIA |
| Admin | No hay query dedicada para dashboard stats en backend | ALTA |
| Admin | Layout usa bg-gray-50/gray-900 hardcoded | BAJA |

### Inventario de Archivos Afectados

| Archivo | Problema | Accion Requerida |
|---------|----------|-----------------|
| `backend/prisma/schema.prisma` | Sin campos i18n | Agregar campo `translations` JSON a Service y BlogPost |
| `backend/src/modules/services/entities/service.entity.ts` | Sin campos i18n | Agregar campo translations al GraphQL type |
| `backend/src/modules/services/dto/create-service.input.ts` | Sin inputs i18n | Agregar input para translations |
| `backend/src/modules/services/services.resolver.ts` | Sin arg `locale` | Agregar arg opcional locale a queries publicas |
| `backend/src/modules/blog/` | Mismo patron que services | Mismos cambios i18n |
| `frontend/src/app/layout.tsx` | `lang="es"` hardcoded, sin i18n provider | Integrar next-intl |
| `frontend/src/app/page.tsx` | Sin middleware de locale | Mover a `[locale]/page.tsx` |
| `frontend/src/components/sections/hero-section.tsx` | Textos en ingles, animacion basica | Traducir + GSAP ScrollTrigger parallax |
| `frontend/src/components/sections/services-section.tsx` | Framer Motion simple | Reescribir con GSAP ScrollTrigger pin + stagger |
| `frontend/src/components/sections/experience-section.tsx` | Datos hardcoded, sin counter | Counter animation + datos desde backend o config |
| `frontend/src/components/sections/contact-section.tsx` | Textos en ingles | Traducir |
| `frontend/src/components/layout/header.tsx` | Nav labels en ingles | Traducir + agregar language switcher |
| `frontend/src/components/layout/footer.tsx` | Todo en ingles | Traducir |
| `frontend/src/components/sections/dual-positioning-section.tsx` | Textos en ingles, animacion basica | Traducir + mejorar animaciones |
| `frontend/src/app/admin/page.tsx` | Stats hardcoded | Dashboard real con GraphQL stats |
| `frontend/src/app/admin/layout.tsx` | bg-gray-50/gray-900 | Usar theme system |
| `frontend/src/components/admin/admin-sidebar.tsx` | Estilo basico | Redisenar estilo SaaS |
| `frontend/src/app/admin/services/page.tsx` | Sin sorting/search | Agregar DataTable con features |
| `frontend/src/app/admin/leads/page.tsx` | Solo filter por status | Agregar search, sorting, paginacion |

---

## Decisiones Arquitectonicas

### 1. i18n: next-intl con App Router

**Decision:** Usar `next-intl` (v4.x) con App Router y pathname-based routing.

**Razon:**
- next-intl es la libreria mas madura para Next.js App Router
- Soporta Server Components nativamente
- NO duplica componentes: usa archivos de mensajes JSON + hook `useTranslations()`
- Patron: `[locale]/page.tsx` con middleware que detecta locale

**Estructura de archivos i18n:**
```
frontend/
├── messages/
│   ├── es.json          # Español (default)
│   └── en.json          # English
├── i18n/
│   ├── request.ts       # getRequestConfig para Server Components
│   └── routing.ts       # Definicion de locales y default
├── src/
│   ├── middleware.ts     # next-intl middleware (locale detection)
│   └── app/
│       └── [locale]/     # TODAS las paginas bajo [locale]
│           ├── page.tsx
│           ├── layout.tsx
│           └── admin/
```

**Locale default:** `es` (espanol argentino)
**Locale alternativo:** `en` (ingles)
**URL pattern:** `manuelalvarez.cloud/` (es, default, sin prefijo) y `manuelalvarez.cloud/en/` (ingles)

### 2. i18n Contenido Dinamico: Campo JSON `translations`

**Decision:** Opcion A - Campo JSON `translations` en cada modelo.

**Razon:**
- Mas simple que tablas separadas de traducciones
- Prisma 7 soporta JSON nativamente con tipado
- Solo hay 2 idiomas (es/en), no se necesita flexibilidad de N idiomas
- El admin puede editar traducciones inline en el mismo formulario

**Estructura del campo:**
```json
{
  "es": {
    "name": "Desarrollo Web",
    "description": "Creamos aplicaciones web modernas..."
  },
  "en": {
    "name": "Web Development",
    "description": "We build modern web applications..."
  }
}
```

**Idioma principal en campos base:** Los campos `name`, `description`, `title`, `content`, `excerpt` mantienen el valor del idioma DEFAULT (espanol). El campo `translations` contiene TODOS los idiomas (incluyendo es como source of truth duplicado para consistencia en la API). Esto permite backward compatibility: si no hay `translations`, se usa el campo base.

### 3. Estrategia de Animaciones Premium

**Decision:** GSAP ScrollTrigger como motor principal, Framer Motion solo para micro-interacciones.

| Seccion | Animacion | Tecnologia |
|---------|-----------|------------|
| **Hero** | Text reveal staggered + floating 3D elements con parallax de profundidad + background gradient shift on scroll | GSAP ScrollTrigger |
| **Services** | Scroll pin: seccion se fija, cards se revelan una por una con stagger 3D (translateZ + rotateY) mientras el usuario scrollea. Al completar, se despin. | GSAP ScrollTrigger pin |
| **Experience** | Counter animation (0 -> N) con easeOut + logo carousel con infinite scroll CSS + parallax en stats | GSAP ScrollTrigger + CSS |
| **Dual Positioning** | Cards con perspective 3D que rotan al entrar en viewport, tab switch con spring animation | GSAP + Framer Motion |
| **Contact** | Form fields revelan secuencialmente (stagger), input focus glow, submit con ripple effect | GSAP + Framer Motion |
| **Header** | Glassmorphism transition on scroll (ya existe), mejorar con blur transition + logo scale | CSS Transitions (ya funciona bien) |
| **Footer** | Fade-in stagger de columnas al entrar en viewport | GSAP ScrollTrigger |

**Principios:**
- SOLO animar `transform` y `opacity` (GPU-accelerated)
- SIEMPRE respetar `prefers-reduced-motion` (ya existe hook)
- Limpiar ScrollTrigger instances en cleanup de useEffect
- `will-change: transform` solo durante animacion activa

### 4. Admin Design Pattern

**Decision:** Layout estilo SaaS moderno (Vercel/Linear inspired).

**Componentes base:**
- Sidebar colapsable con tooltips
- Header con breadcrumbs + user info
- Dashboard con cards de stats reales + graficos simples (Recharts o solo CSS)
- DataTable reutilizable con sorting, filtering, search, paginacion
- Formularios con layout de 2 columnas en desktop

**Colores:** Usar el sistema de colores existente (CSS variables) en vez de gray-* hardcoded.

---

## Plan de Implementacion

### Fase 1: Backend - i18n Schema + Dashboard Stats (backend-dev)

**Archivo de tareas:** `spec/04a__complete-ui-i18n-admin-overhaul_backend.md`

**Objetivo:** Preparar el backend para soportar contenido bilingue y proveer estadisticas reales para el dashboard.

1. Modificar Prisma schema: agregar campo `translations Json?` a Service y BlogPost
2. Crear migracion de base de datos
3. Actualizar GraphQL types (entities) con campo translations
4. Actualizar DTOs (inputs) para aceptar translations
5. Actualizar servicios para manejar locale filtering
6. Agregar query `dashboardStats` con datos reales
7. Agregar query `servicesCount` para conteo
8. Tests unitarios para toda la nueva logica

**Estimacion:** 1-2 dias

### Fase 2: Frontend - Sistema i18n (frontend-dev)

**Archivo de tareas:** `spec/04b__complete-ui-i18n-admin-overhaul_frontend.md` (Seccion 1)

**Objetivo:** Implementar next-intl, traducir toda la UI, restructurar rutas bajo `[locale]`.

1. Instalar y configurar next-intl
2. Crear archivos de mensajes (es.json, en.json)
3. Restructurar rutas bajo `[locale]/`
4. Traducir TODOS los componentes de la landing page
5. Agregar language switcher al header
6. Traducir paginas de blog, services, contact
7. Configurar metadata dinamica por locale
8. Tests unitarios para i18n

**Estimacion:** 2-3 dias
**Dependencia:** Fase 1 completada (backend soporta locale)

### Fase 3: Frontend - Premium Animations Overhaul (frontend-dev)

**Archivo de tareas:** `spec/04b__complete-ui-i18n-admin-overhaul_frontend.md` (Seccion 2)

**Objetivo:** Transformar las animaciones de basicas a nivel Apple/Linear/Stripe.

1. HeroSection: parallax 3D con GSAP ScrollTrigger
2. ServicesSection: scroll pin + staggered 3D card reveal
3. ExperienceSection: counter animation + logo carousel
4. DualPositioningSection: perspective 3D transitions mejoradas
5. ContactSection: staggered field reveal + micro-interacciones
6. Footer: fade-in stagger
7. Animaciones globales: smooth scroll improvements, page transitions

**Estimacion:** 3-4 dias
**Dependencia:** Fase 2 completada (textos ya en espanol, no quiero animar textos hardcoded en ingles)

### Fase 4: Frontend - Admin Dashboard Redesign (frontend-dev)

**Archivo de tareas:** `spec/04b__complete-ui-i18n-admin-overhaul_frontend.md` (Seccion 3)

**Objetivo:** Transformar el admin de "basico" a "profesional SaaS-quality".

1. Sidebar redisenar: colapsable, iconos con tooltips, seccion usuario, theme-aware
2. Dashboard: stats reales desde GraphQL, mini-charts, actividad reciente, quick actions
3. DataTable component reutilizable: sorting, search, paginacion, bulk actions
4. Tablas de services, blog, leads usando DataTable
5. Formularios mejorados: layout 2 columnas, preview, validacion mejorada
6. Admin layout: breadcrumbs, responsive

**Estimacion:** 3-4 dias
**Dependencia:** Fase 1 completada (backend provee dashboardStats)

---

## Dependencias entre Fases

```
Fase 1 (Backend i18n + Stats)
   │
   ├──> Fase 2 (Frontend i18n)
   │       │
   │       └──> Fase 3 (Animations Premium)
   │
   └──> Fase 4 (Admin Redesign)
```

- Fase 2 NECESITA Fase 1: las queries de servicios/blog deben soportar locale antes de que el frontend pueda pedir contenido traducido.
- Fase 3 NECESITA Fase 2: no tiene sentido crear animaciones premium sobre textos en ingles que van a cambiar.
- Fase 4 puede ejecutarse en PARALELO con Fases 2-3 ya que el admin no necesita i18n (es solo para el owner, en espanol o ingles interno). Solo necesita la query `dashboardStats` de Fase 1.

---

## GraphQL Schema Propuesto

### Tipos Nuevos

```graphql
# Tipo para traducciones de contenido
scalar JSON

# Service (actualizado)
type Service {
  id: ID!
  name: String!          # Valor default (espanol)
  slug: String!
  description: String!   # Valor default (espanol)
  icon: String
  order: Int!
  isActive: Boolean!
  translations: JSON     # { es: { name, description }, en: { name, description } }
  createdAt: DateTime!
  updatedAt: DateTime!
}

# BlogPost (actualizado)
type BlogPost {
  id: ID!
  slug: String!
  title: String!         # Valor default (espanol)
  excerpt: String
  content: String!       # Valor default (espanol)
  coverImage: String
  seoMetadata: JSON
  publishedAt: DateTime
  isPublished: Boolean!
  translations: JSON     # { es: { title, excerpt, content }, en: { title, excerpt, content } }
  createdAt: DateTime!
  updatedAt: DateTime!
}

# Dashboard Stats (nuevo)
type DashboardStats {
  totalServices: Int!
  activeServices: Int!
  totalBlogPosts: Int!
  publishedBlogPosts: Int!
  draftBlogPosts: Int!
  totalLeads: Int!
  newLeads: Int!
  contactedLeads: Int!
  qualifiedLeads: Int!
  leadsThisMonth: Int!
  leadsLastMonth: Int!
}
```

### Queries Nuevas

```graphql
type Query {
  # Dashboard stats (admin only)
  dashboardStats: DashboardStats!

  # Service count (admin utility)
  servicesCount(isActive: Boolean): Int!
}
```

### Inputs Actualizados

```graphql
input CreateServiceInput {
  name: String!
  slug: String!
  description: String!
  icon: String
  order: Int = 0
  isActive: Boolean = true
  translations: JSON       # Opcional: { es: {...}, en: {...} }
}

input UpdateServiceInput {
  name: String
  slug: String
  description: String
  icon: String
  order: Int
  isActive: Boolean
  translations: JSON       # Opcional
}

input CreateBlogPostInput {
  title: String!
  slug: String!
  content: String!
  excerpt: String
  coverImage: String
  seoMetadata: JSON
  isPublished: Boolean = false
  translations: JSON       # Opcional: { es: {...}, en: {...} }
}

input UpdateBlogPostInput {
  title: String
  slug: String
  content: String
  excerpt: String
  coverImage: String
  seoMetadata: JSON
  isPublished: Boolean
  translations: JSON       # Opcional
}
```

---

## Criterios de Aceptacion (expresados como tests)

### Test: i18n-default-locale-es
**Given** un usuario visita `manuelalvarez.cloud/` sin prefijo de locale
**When** la pagina carga completamente
**Then** todo el contenido de la UI esta en espanol argentino, el `<html lang="es">`, y los servicios muestran su traduccion en espanol
**Type:** e2e
**Layer:** frontend

### Test: i18n-switch-to-english
**Given** un usuario esta en la version espanol de la pagina
**When** hace click en el language switcher y selecciona "English"
**Then** la URL cambia a `/en/`, todos los textos estaticos cambian a ingles, y los servicios muestran su traduccion en ingles (si existe, sino el fallback en espanol)
**Type:** e2e
**Layer:** frontend

### Test: i18n-backend-translations-field
**Given** un servicio tiene `translations: { es: { name: "Desarrollo Web" }, en: { name: "Web Development" } }`
**When** el frontend consulta `services` query
**Then** el campo `translations` esta disponible y contiene ambos idiomas
**Type:** integration
**Layer:** backend

### Test: i18n-admin-translations-form
**Given** un admin esta editando un servicio
**When** ve el formulario de edicion
**Then** hay campos separados para espanol e ingles (tabs o sections), y al guardar se persiste el campo `translations` en la DB
**Type:** e2e
**Layer:** frontend

### Test: animation-services-scroll-pin
**Given** un usuario esta en la landing page con un viewport de 1440x900
**When** scrollea hacia la seccion de servicios
**Then** la seccion se "pinea" al viewport y las cards de servicios se revelan una por una con efecto 3D mientras continua scrolleando
**Type:** e2e (visual)
**Layer:** frontend

### Test: animation-hero-parallax
**Given** un usuario esta en la landing page
**When** scrollea desde el hero section hacia abajo
**Then** los elementos del hero (orbs, texto, CTAs) se mueven a diferentes velocidades creando efecto parallax de profundidad, y el hero desaparece progresivamente
**Type:** e2e (visual)
**Layer:** frontend

### Test: animation-experience-counters
**Given** la seccion de experiencia es visible en el viewport
**When** entra en el viewport del usuario
**Then** los numeros (9+, 5, 20+, 4) cuentan desde 0 hasta su valor final con easeOut animation durante ~1.5 segundos
**Type:** e2e (visual)
**Layer:** frontend

### Test: animation-reduced-motion
**Given** un usuario tiene `prefers-reduced-motion: reduce` activado
**When** navega por toda la landing page
**Then** NO hay animaciones de scroll, NO hay parallax, NO hay pinning; todo el contenido es visible estiatcamente
**Type:** unit
**Layer:** frontend

### Test: admin-dashboard-real-stats
**Given** existen 4 servicios activos, 2 blog posts publicados, 1 draft, y 15 leads (8 nuevos)
**When** el admin accede al dashboard
**Then** las cards muestran: "4 Active Services", "2 Published Posts", "15 Total Leads" con los numeros reales consultados via GraphQL query `dashboardStats`
**Type:** integration
**Layer:** frontend + backend

### Test: admin-datatable-sorting
**Given** el admin esta en la pagina de servicios con 5+ servicios cargados
**When** hace click en el header "Name" de la tabla
**Then** la tabla se reordena alfabeticamente por nombre, y un segundo click invierte el orden
**Type:** unit
**Layer:** frontend

### Test: admin-datatable-search
**Given** el admin esta en la pagina de leads con multiples leads
**When** escribe "PayPal" en el campo de busqueda
**Then** la tabla filtra y muestra solo leads cuyo nombre, email o empresa contiene "PayPal"
**Type:** unit
**Layer:** frontend

### Test: admin-sidebar-collapsible
**Given** el admin esta en el panel de administracion en desktop
**When** hace click en el boton de colapsar sidebar
**Then** el sidebar se colapsa mostrando solo iconos con tooltips, y el contenido principal ocupa el espacio liberado
**Type:** unit
**Layer:** frontend

### Test: backend-dashboard-stats-query
**Given** la base de datos tiene servicios, blog posts y leads
**When** se ejecuta la query `dashboardStats` con autenticacion de admin
**Then** retorna un objeto con todos los conteos correctos (totalServices, activeServices, totalBlogPosts, publishedBlogPosts, draftBlogPosts, totalLeads, newLeads, contactedLeads, qualifiedLeads, leadsThisMonth, leadsLastMonth)
**Type:** unit
**Layer:** backend

### Test: backend-services-count-query
**Given** existen 6 servicios, 4 activos y 2 inactivos
**When** se ejecuta `servicesCount(isActive: true)`
**Then** retorna 4
**Type:** unit
**Layer:** backend

---

## Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|-------------|---------|------------|
| Restructurar rutas bajo `[locale]/` rompe TODAS las rutas existentes | ALTA | CRITICO | Hacer la migracion de rutas en un solo commit atomico. Verificar con `npm run build` inmediatamente. Middleware de next-intl maneja redirect automatico. |
| GSAP ScrollTrigger con pin causa layout shifts o bugs en mobile | MEDIA | ALTO | Implementar ScrollTrigger solo en `lg:` breakpoints. En mobile, usar reveal simple. Testear en Safari iOS (el mas problematico). |
| Campo JSON `translations` sin tipado fuerte en TypeScript | MEDIA | MEDIO | Crear interfaces TypeScript para el shape de translations. Validar en backend con class-validator custom decorator. |
| 148 tests existentes se rompen con la restructuracion i18n | ALTA | ALTO | Actualizar mocks de next-intl en los tests. Crear helper `renderWithIntl()` para tests de componentes. Ejecutar tests antes y despues de cada fase. |
| Performance degradation con muchos ScrollTrigger instances | BAJA | MEDIO | Limitar a maximo 6-8 ScrollTrigger instances en la landing. Lazy-register ScrollTriggers para secciones below-the-fold. Kill instances on unmount. |
| Admin pages no necesitan i18n pero estan bajo `[locale]/` | MEDIA | BAJO | El admin puede funcionar sin traducciones ya que es solo para el owner. Textos del admin pueden quedar en ingles (convencional para dashboards tech). Las rutas seran `/admin/` sin `[locale]` prefix usando route groups o excepciones en middleware. |
| next-intl v4 API changes vs documentacion disponible | BAJA | MEDIO | Verificar version exacta soportada por Next.js 16. Usar documentacion oficial + probar con sandbox minimo antes de integrar. |

---

## Consideraciones Futuras (NO implementar ahora)

### Integracion con n8n
- Los leads creados via `createLead` mutation podrian disparar un webhook a n8n
- El campo `translations` del schema permite que n8n pre-traduzca contenido via AI
- El `dashboardStats` query puede alimentar un dashboard de n8n para monitoreo

### SEO Multiidioma
- next-intl genera automaticamente `hreflang` alternates
- Sitemap.xml debe listar URLs en ambos idiomas
- Structured data (JSON-LD) debe estar en el idioma correcto

---

## Archivos de Spec por Agente

| Archivo | Agente | Contenido |
|---------|--------|-----------|
| `spec/04a__complete-ui-i18n-admin-overhaul_backend.md` | backend-dev | Tareas de Fase 1: Prisma schema, GraphQL types, resolvers, services, tests |
| `spec/04b__complete-ui-i18n-admin-overhaul_frontend.md` | frontend-dev | Tareas de Fases 2, 3, 4: i18n, animaciones premium, admin redesign |
