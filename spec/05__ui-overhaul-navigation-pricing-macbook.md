# Spec: UI Overhaul - Navigation, Pricing Cards & MacBook Fix

**Estado:** EN_PROGRESO
**Fecha:** 2026-02-06
**Agente:** architect
**Prioridad:** ALTA

---

## Resumen Ejecutivo

La app tiene problemas criticos de UX y conversion:
1. **Links rotos**: Footer y service cards enlazan a rutas que no existen (404)
2. **Sin pricing**: Los service cards no muestran precios, debilitando conversion
3. **MacBook animation oscura**: La animacion del MacBook oscurece contenido y se ve mal
4. **Links de navegacion no usan i18n**: Se pierde locale al navegar
5. **Paginas inexistentes referenciadas**: /about, /privacy, /terms, /services/[slug], /resume

---

## Diagnostico del Estado Actual

### Problemas Encontrados

| Archivo | Problema | Accion Requerida |
|---------|---------|-----------------|
| `footer.tsx:47-50` | Links a `/services/web-development`, etc. => 404 | Cambiar a anchor links `/#services` |
| `footer.tsx:53` | Link a `/about` => 404 | Eliminar (no existe la pagina) |
| `footer.tsx:58-59` | Links a `/privacy`, `/terms` => 404 | Eliminar o crear paginas placeholder |
| `service-card.tsx:104` | Link a `/services/${slug}` => 404 | Cambiar a anchor link o contacto |
| `dual-positioning-section.tsx:147` | Link a `/resume` => 404 | Cambiar a link externo o contacto |
| `macbook-scroll-background.tsx` | Animacion oscurece contenido, se ve oscura | Redisenar con transparencia y brillo |
| `service-card.tsx` | Sin pricing, no genera conversiones | Agregar campo `startingPrice` |
| `header.tsx:26-28` | Links sin locale prefix | Usar `Link` de next-intl |
| Prisma schema | Sin campo de precio en Service | Agregar `startingPrice` |

---

## Plan de Implementacion

### Fase 1: Backend (spec/05a)

1. **Agregar campo `startingPrice` al schema Prisma**
   - `startingPrice Int? @map("starting_price")` en Service model
   - Actualizar entity, DTOs, resolver

2. **Tests TDD:**
   - Test que el campo `startingPrice` existe en el entity GraphQL
   - Test que se puede crear servicio con precio
   - Test que se puede actualizar precio
   - Test que query publica devuelve precio

### Fase 2: Frontend (spec/05b)

1. **Fix navegacion rota:**
   - Header: usar `Link` de `next-intl` para links i18n-aware
   - Footer: eliminar links a paginas inexistentes, usar anchor links para servicios
   - Service cards: reemplazar link a `/services/${slug}` por accion de CTA hacia contacto
   - Dual positioning: cambiar `/resume` a link externo

2. **Redisenar service cards con pricing:**
   - Mostrar "Desde USD $X" en las cards
   - Agregar CTA "Contactar" directo
   - Mejorar layout para conversion

3. **Fix MacBook animation:**
   - Reducir opacidad del MacBook
   - Agregar fondo mas claro al screen
   - Hacer la animacion mas sutil y que no tape el contenido
   - Considerar mover/escalar diferente

4. **Tests TDD:**
   - Test: Header links apuntan a rutas validas
   - Test: Footer no tiene links a /about, /privacy, /terms
   - Test: Service cards muestran pricing
   - Test: MacBook tiene opacity correcta
   - Test: No hay links a rutas inexistentes

---

## Dependencias entre Fases

- Fase 1 (Backend) debe completarse antes de Fase 2 si pricing requiere schema change
- El campo `startingPrice` en backend habilita el display en frontend

---

## Schema GraphQL Propuesto

### Cambios al type Service:
```graphql
type Service {
  id: ID!
  name: String!
  slug: String!
  description: String!
  icon: String
  order: Int!
  isActive: Boolean!
  startingPrice: Int          # NUEVO - precio base en centavos USD
  translations: JSON
  createdAt: DateTime!
  updatedAt: DateTime!
}

input CreateServiceInput {
  name: String!
  slug: String!
  description: String!
  icon: String
  order: Int
  startingPrice: Int          # NUEVO
}

input UpdateServiceInput {
  name: String
  slug: String
  description: String
  icon: String
  order: Int
  isActive: Boolean
  startingPrice: Int          # NUEVO
}
```

---

## Criterios de Aceptacion (Tests)

### Backend Tests
1. Given a Service entity, When checking fields, Then `startingPrice` exists as nullable Int
2. Given CreateServiceInput with `startingPrice: 29900`, When creating, Then service has `startingPrice: 29900`
3. Given a service with price, When querying `services`, Then `startingPrice` is returned
4. Given UpdateServiceInput with `startingPrice: 49900`, When updating, Then service price changes

### Frontend Tests
5. Given the Header component, When rendered, Then nav links point to valid routes (/, /services, /blog, /contact)
6. Given the Footer component, When rendered, Then no links to /about, /privacy, /terms exist
7. Given the Footer component, When rendered, Then service links use anchor sections (#services)
8. Given a ServiceCard with `startingPrice: 29900`, When rendered, Then shows "From USD $299"
9. Given the MacBook component, When rendered, Then container has z-0 and doesn't block interaction
10. Given the DualPositioning section, When employee mode, Then CTA doesn't link to /resume

---

## Riesgos y Mitigaciones

| Riesgo | Probabilidad | Mitigacion |
|--------|-------------|-----------|
| Prisma migration en produccion | Media | Usar `db push` para dev, migration para prod |
| Tests existentes se rompen | Media | Actualizar mocks con nuevo campo |
| i18n links se rompen | Baja | Usar patron consistente con next-intl Link |
