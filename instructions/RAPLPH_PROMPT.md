/ralph-loop:ralph-loop "
Actúa usando el flujo Ralph-in-the-loop con TDD ESTRICTO y EJECUCIÓN OBLIGATORIA.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTEXTO DEL PROYECTO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Proyecto: manuelalvarez.cloud - Professional Services Website
Stack: Next.js 16 latest (App Router) + NestJS (GraphQL) + PostgreSQL + Prisma
Hosting: Hostinger VPS (Docker containers)
Domain: manuelalvarez.cloud | api.manuelalvarez.cloud

Documentación de referencia:
- @instructions/PRD.md (Product Requirements)
- @instructions/SRS.md (Software Requirements + Prisma Schema)
- @instructions/UID.md (UI Design + Animations)

Agentes disponibles:
- @.claude/agents/architect.md (Orquestación y diseño)
- @.claude/agents/backend-dev.md (NestJS + GraphQL)
- @.claude/agents/frontend-dev.md (Next.js + Animations)
- @.claude/agents/vps-agent.md (DevOps + Deploy)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OBJETIVO GLOBAL (NO NEGOCIABLE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Diseñar, implementar y validar una feature full-stack
para manuelalvarez.cloud (frontend/ + backend/),
utilizando **Test-Driven Development (TDD)** como metodología obligatoria.

⚠️ PROHIBIDO:
- Implementar lógica de negocio sin tests previos.
- Marcar tareas como completas sin tests pasando.
- Cerrar el loop solo con specs o código sin pruebas.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FEATURE A IMPLEMENTAR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Crear la estructura inicial del proyecto manuelalvarez.cloud:

BACKEND (NestJS + GraphQL):
1. Setup inicial de NestJS con GraphQL (Apollo Server)
2. Configurar Prisma con el schema definido en SRS.md
3. Implementar módulo de Services (CRUD completo)
4. Implementar módulo de BlogPosts (CRUD completo)
5. Implementar módulo de Leads (Create público + Admin CRUD)
6. Configurar autenticación con Clerk (guards, decorators)
7. Dockerizar el backend

FRONTEND (Next.js + Animations):
1. Setup inicial de Next.js 16 con App Router
2. Configurar Apollo Client para GraphQL
3. Implementar Landing Page con secciones:
   - Hero con text reveal animation
   - Services section con scroll-triggered reveals
   - Contact form que crea Lead via GraphQL
4. Configurar Clerk para auth
5. Implementar Admin básico (dashboard + services CRUD)
6. Dockerizar el frontend

INFRAESTRUCTURA:
1. docker-compose.yml para desarrollo
2. docker-compose.prod.yml para producción
3. Nginx config para reverse proxy

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FASE 1 — ANÁLISIS Y DISEÑO DE CONTRATOS (ARCHITECT)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@architect debe:

1. Analizar la FEATURE A IMPLEMENTAR.
2. Revisar documentación de referencia:
   - @instructions/PRD.md para requisitos del producto
   - @instructions/SRS.md para schema de DB y arquitectura
   - @instructions/UID.md para diseño de UI y animaciones
3. Identificar:
   - schema GraphQL (types, queries, mutations)
   - casos de uso
   - reglas de negocio
   - escenarios edge / error
4. Definir **criterios de aceptación expresados como tests**.
5. Crear specs en `/spec` (numeración incremental):

- spec/XX__feature-name.md
- spec/XXa__feature-name_backend.md
- spec/XXb__feature-name_frontend.md

Los specs DEBEN incluir explícitamente:
- lista de casos de test (Given / When / Then)
- qué tests van en backend y cuáles en frontend
- dependencias entre tests
- GraphQL schema propuesto (types, inputs, queries, mutations)

⚠️ Esta fase NO habilita implementación.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FASE 2 — TDD BACKEND (RED → GREEN → REFACTOR)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@backend-dev debe seguir ESTRICTAMENTE:

### 🔴 RED — Escribir tests primero
1. Crear tests en `backend/test` o `backend/src/**/__tests__`:
   - unit tests de services
   - tests de resolvers (GraphQL)
2. Los tests DEBEN fallar inicialmente.
3. Cubrir:
   - caso feliz
   - validaciones (class-validator)
   - errores esperados
   - permisos (roles / auth con Clerk)

⚠️ NO escribir implementación aún.

### 🟢 GREEN — Implementación mínima
4. Implementar la lógica mínima necesaria
   para que los tests pasen.
5. No optimizar ni abstraer prematuramente.

### 🔄 REFACTOR — Limpieza segura
6. Refactorizar código:
   - mejorar nombres
   - extraer funciones
   - eliminar duplicaciones
7. Verificar que TODOS los tests sigan pasando.

VALIDACIONES BACKEND OBLIGATORIAS:
- `cd backend && npm run test`
- `cd backend && npm run build`
- Verificar en GraphQL Playground (http://localhost:4000/graphql)
- MCP de Prisma si hay cambios de DB

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FASE 3 — TDD FRONTEND (RED → GREEN → REFACTOR)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@frontend-dev debe:

### 🔴 RED — Tests primero
1. Escribir tests antes de implementar UI:
   - componentes
   - hooks
   - GraphQL queries/mutations
2. Usar:
   - Playwright MCP para flujos E2E
   - tests de rendering y estados (loading / error / empty)
   - Skill @.claude/skills/frontend-testing para templates

⚠️ Los tests deben fallar inicialmente.

### 🟢 GREEN — Implementación mínima
3. Implementar la UI mínima
   para pasar los tests.
4. Respetar patrones del proyecto y UID.md para animaciones.

### 🔄 REFACTOR — Limpieza segura
5. Refactorizar UI y servicios
   manteniendo tests en verde.

VALIDACIONES FRONTEND OBLIGATORIAS:
- `cd frontend && npm run typecheck` (o `npx tsc --noEmit`)
- `cd frontend && npm run test`
- Playwright MCP sin errores
- UI funcional en navegador (http://localhost:3000)
- Animaciones funcionando (GSAP/Framer Motion)
- Responsive verificado (mobile/tablet/desktop)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FASE 4 — INTEGRACIÓN END-TO-END
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Ralph debe validar:

1. Backend tests pasando.
2. Frontend tests pasando.
3. Feature funcionando end-to-end.
4. `docker-compose up` levanta sin errores.
5. GraphQL queries funcionan desde el frontend.
6. Animaciones scroll-based funcionan correctamente.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONDICIÓN DE TERMINACIÓN (INFLEXIBLE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
El loop SOLO puede terminar cuando:

- Todos los tests están en verde.
- El código está implementado.
- La feature cumple los criterios de aceptación.
- No hay deuda técnica crítica.
- La app corre correctamente (frontend + backend + db).
- El build de los proyectos funciona.
- GraphQL Playground muestra el schema correctamente.
- Las animaciones respetan prefers-reduced-motion.
- Los E2E corren sin errores.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FINALIZACIÓN (STRING EXACTO)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Cuando TODO esté implementado y validado,
imprime EXACTAMENTE:

RALPH_DONE: La feature fue implementada siguiendo TDD estricto; tests backend y frontend están en verde; la funcionalidad funciona end-to-end y la app corre sin errores.
" --max-iterations 700 --completion-promise "RALPH_DONE: La feature fue implementada siguiendo TDD estricto; tests backend y frontend están en verde; la funcionalidad funciona end-to-end y la app corre sin errores."
