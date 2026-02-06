# Spec 05b: Frontend - Navigation Fix, Pricing Cards, MacBook Redesign

**Estado:** PENDIENTE
**Agente:** frontend-dev
**Dependencias:** 05a (backend pricing)

---

## Tareas

### 1. Fix Header Navigation (i18n-aware links)

**Archivo:** `frontend/src/components/layout/header.tsx`

- Importar `Link` de `next-intl` en lugar de `next/link`
- Esto asegura que los links respetan el locale actual
- Links validos: `/`, `/services`, `/blog`, `/contact`

### 2. Fix Footer Links (eliminar rutas inexistentes)

**Archivo:** `frontend/src/components/layout/footer.tsx`

- **Eliminar** links a: `/about`, `/privacy`, `/terms`
- **Cambiar** service links de `/services/web-development` a `/#services` (anchor)
- **Eliminar** la columna "Legal" completa (no existen esas paginas)
- **Mover** "Blog" y "Contact" a la columna "Company" sin "About"

### 3. Redisenar Service Cards con Pricing

**Archivo:** `frontend/src/components/sections/service-card.tsx`

- Agregar `startingPrice` al interface ServiceCardProps
- Mostrar "Desde USD $X" formateado (centavos a dolares)
- Cambiar link de `/services/${slug}` a `/contact` (CTA directo)
- Agregar badge de precio prominente
- Mejorar CTA: "Consultar" en lugar de "Learn more"

### 4. Actualizar Services Section

**Archivo:** `frontend/src/components/sections/services-section.tsx`

- Agregar `id="services"` al section element (para anchor links)
- Pasar `startingPrice` a ServiceCard

### 5. Actualizar GraphQL query

**Archivo:** `frontend/src/lib/graphql/queries/services.ts`

- Agregar `startingPrice` al query `GetServices`

### 6. Actualizar hook useServices

**Archivo:** `frontend/src/hooks/use-services.ts`

- Agregar `startingPrice` al tipo Service

### 7. Fix MacBook Animation

**Archivo:** `frontend/src/components/backgrounds/macbook-scroll-background.tsx`

Problemas:
- Muy oscura, tapa contenido
- Screen gradient demasiado oscuro

Soluciones:
- Reducir opacidad general del MacBook (0.3 en scroll down es bueno, pero inicial debe ser mas sutil)
- Cambiar screen de `zinc-900/950` a algo mas brillante que muestre codigo
- Reducir tamano del MacBook para no dominar la pantalla
- Agregar `opacity-60` inicial al contenedor
- Hacer que se desvanezca mas rapido al scrollear

### 8. Fix Dual Positioning Links

**Archivo:** `frontend/src/components/sections/dual-positioning-section.tsx`

- Cambiar `/resume` a `/contact` (pagina que existe)
- Agregar `id="dual-positioning"` para anchor navigation

### 9. Actualizar i18n Messages

**Archivos:** `frontend/messages/es.json`, `frontend/messages/en.json`

- Agregar traducciones para pricing: "Desde", "Consultar"
- Actualizar footer sin links eliminados
- Agregar "section anchors" labels

---

## Tests TDD (Given/When/Then)

### Navigation Tests

**Test 1: Header renders valid navigation links**
- **Given:** Header component rendered
- **When:** Checking nav link hrefs
- **Then:** All links point to valid routes (/services, /blog, /contact)

**Test 2: Footer has no broken links**
- **Given:** Footer component rendered
- **When:** Checking all link hrefs
- **Then:** No links to /about, /privacy, /terms, /services/web-development

**Test 3: Footer service links are anchor links**
- **Given:** Footer component rendered
- **When:** Checking service link hrefs
- **Then:** Links use `/#services` format

### Service Card Tests

**Test 4: ServiceCard displays pricing when available**
- **Given:** ServiceCard with `startingPrice: 29900`
- **When:** Rendered
- **Then:** Shows "USD $299" or equivalent formatted text

**Test 5: ServiceCard handles null pricing**
- **Given:** ServiceCard with `startingPrice: null`
- **When:** Rendered
- **Then:** Shows "Consultar" instead of price

**Test 6: ServiceCard CTA links to /contact**
- **Given:** ServiceCard rendered
- **When:** Checking CTA href
- **Then:** Points to `/contact` (not `/services/slug`)

### MacBook Tests

**Test 7: MacBook has reduced opacity**
- **Given:** MacBookScrollBackground rendered
- **When:** Checking container styles
- **Then:** Has reduced opacity class

### Services Section Tests

**Test 8: Services section has anchor id**
- **Given:** ServicesSection rendered
- **When:** Checking section element
- **Then:** Has `id="services"`

### DualPositioning Tests

**Test 9: Employee CTA does not link to /resume**
- **Given:** DualPositioningSection in employee mode
- **When:** Checking CTA href
- **Then:** Does not link to /resume

---

## Validaciones Post-Implementacion

- [ ] `npm run typecheck` sin errores
- [ ] `npm run test` - todos los tests pasan (nuevos + existentes)
- [ ] `npx next build` exitoso
- [ ] No hay links a rutas 404 en la app
- [ ] Service cards muestran pricing
- [ ] MacBook animation mejorada (mas clara, no tapa contenido)
- [ ] Footer limpio sin links rotos
- [ ] i18n funciona correctamente en ambos idiomas
