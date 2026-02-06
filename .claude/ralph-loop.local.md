---
active: true
iteration: 1
max_iterations: 900
completion_promise: "RALPH_DONE: La feature fue implementada siguiendo TDD estricto; tests backend y frontend están en verde; la funcionalidad funciona end-to-end y la app corre sin errores."
started_at: "2026-02-06T13:01:00Z"
---


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
- @.claude/agens/vps-agent.md (DevOps + Deploy)

Skills disponibles:
- /api-design-principles
- /vercel-react-best-practices
- /content-research-writer
- /ui-ux-pro-max
- /brainstorming
- /next-best-practices
- /marketing-psychology
Entre otros tantos skills
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
Con la cantidad de skills que tenes como /ui-ux-pro-max, la app se ve espantosa, los links no navegan a las secciones indicadas, hay errores 404 con clicks que se hacen en la app, es un desastre.
Tampoco se ven cards, o dla manera que /marketing-psychology lo defina, para vender los servicios, con un precio minimo o a partir de usd x , me parece una pagina muy poco profesional, no destinada a generar ingresos.
La animacion de la computadora se ve muy oscura y tapa el contendido de lo que se quiere mostrar, esta horroroso esto.
Haz algo mejor.
En el ultimo flow te colgaste, tardaste 53 minutos y no resolviste nada.
Es necesario que el /frontend-dev checkee todos los links que esta renderizando (incluisve los internos a secciones que no andan).
Porque la tabla de usuario se llama admin_users, debiese ser users con la property role, y soportar un admin mira si esto crece?
Los mocks o la tabla de services pareciera estar mal llenada, y no muestra toda la info requerida.


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
5. Crear specs en  (numeración incremental):

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
1. Crear tests en  o :
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
- 
> backend@0.0.1 test
> jest
- 
> backend@0.0.1 build
> nest build
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
- 
> frontend@0.1.0 typecheck
> tsc --noEmit (o 
[41m                                                                               [0m
[41m[37m                This is not the tsc command you are looking for                [0m
[41m                                                                               [0m

To get access to the TypeScript compiler, [34mtsc[0m, from the command line either:

- Use [1mnpm install typescript[0m to first add TypeScript to your project [1mbefore[0m using npx
- Use [1myarn[0m to avoid accidentally running code from un-installed packages)
- 
> frontend@0.1.0 test
> vitest run


[1m[46m RUN [49m[22m [36mv4.0.18 [39m[90m/Users/manuelalvarez/Developer/My Brand/MannyDevClaud/frontend[39m

 [32m✓[39m src/__tests__/components/admin/admin-sidebar-collapse.test.tsx [2m([22m[2m5 tests[22m[2m)[22m[32m 265[2mms[22m[39m
 [32m✓[39m src/__tests__/components/sections/hero-section.test.tsx [2m([22m[2m6 tests[22m[2m)[22m[32m 281[2mms[22m[39m
 [32m✓[39m src/__tests__/components/layout/header.test.tsx [2m([22m[2m8 tests[22m[2m)[22m[33m 320[2mms[22m[39m
 [32m✓[39m src/__tests__/components/layout/footer.test.tsx [2m([22m[2m8 tests[22m[2m)[22m[33m 385[2mms[22m[39m
 [32m✓[39m src/__tests__/components/sections/dual-positioning-section.test.tsx [2m([22m[2m6 tests[22m[2m)[22m[33m 429[2mms[22m[39m
 [32m✓[39m src/__tests__/components/admin/data-table.test.tsx [2m([22m[2m5 tests[22m[2m)[22m[33m 401[2mms[22m[39m
 [32m✓[39m src/__tests__/components/admin/admin-sidebar.test.tsx [2m([22m[2m12 tests[22m[2m)[22m[33m 616[2mms[22m[39m
 [32m✓[39m src/__tests__/app/admin/services/page.test.tsx [2m([22m[2m9 tests[22m[2m)[22m[33m 511[2mms[22m[39m
 [32m✓[39m src/__tests__/components/admin/admin-header.test.tsx [2m([22m[2m4 tests[22m[2m)[22m[32m 36[2mms[22m[39m
 [32m✓[39m src/__tests__/components/sections/experience-section.test.tsx [2m([22m[2m5 tests[22m[2m)[22m[32m 78[2mms[22m[39m
 [32m✓[39m src/__tests__/components/theme-toggle.test.tsx [2m([22m[2m5 tests[22m[2m)[22m[32m 215[2mms[22m[39m
 [32m✓[39m src/__tests__/components/backgrounds/macbook-scroll-background.test.tsx [2m([22m[2m7 tests[22m[2m)[22m[32m 121[2mms[22m[39m
 [32m✓[39m src/__tests__/components/sections/services-section.test.tsx [2m([22m[2m5 tests[22m[2m)[22m[32m 73[2mms[22m[39m
 [32m✓[39m src/__tests__/i18n/language-switcher.test.tsx [2m([22m[2m4 tests[22m[2m)[22m[32m 33[2mms[22m[39m
 [32m✓[39m src/__tests__/components/sections/contact-section.test.tsx [2m([22m[2m7 tests[22m[2m)[22m[33m 1132[2mms[22m[39m
 [32m✓[39m src/__tests__/providers/theme-provider.test.tsx [2m([22m[2m3 tests[22m[2m)[22m[32m 28[2mms[22m[39m
 [32m✓[39m src/__tests__/components/admin/dashboard.test.tsx [2m([22m[2m5 tests[22m[2m)[22m[32m 69[2mms[22m[39m
 [32m✓[39m src/__tests__/animations/gsap-config.test.ts [2m([22m[2m1 test[22m[2m)[22m[32m 7[2mms[22m[39m
 [32m✓[39m src/__tests__/i18n/messages-consistency.test.ts [2m([22m[2m3 tests[22m[2m)[22m[32m 4[2mms[22m[39m
 [32m✓[39m src/__tests__/i18n/use-translated-content.test.ts [2m([22m[2m5 tests[22m[2m)[22m[32m 16[2mms[22m[39m
 [32m✓[39m src/__tests__/hooks/use-services.test.tsx [2m([22m[2m3 tests[22m[2m)[22m[32m 2[2mms[22m[39m

[2m Test Files [22m [1m[32m21 passed[39m[22m[90m (21)[39m
[2m      Tests [22m [1m[32m116 passed[39m[22m[90m (116)[39m
[2m   Start at [22m 10:00:56
[2m   Duration [22m 3.62s[2m (transform 1.82s, setup 2.30s, import 6.72s, tests 5.02s, environment 12.36s)[22m
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
4.  levanta sin errores.
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

