# Spec 04a: Backend - i18n Schema + Dashboard Stats

**Estado:** PENDIENTE
**Fecha:** 2026-02-05
**Agente:** backend-dev
**Depende de:** Nada (es la primera fase)
**Bloquea:** Fase 2 (Frontend i18n), Fase 4 (Admin Dashboard)

---

## Objetivo

Preparar el backend para soportar contenido bilingue (espanol/ingles) mediante un campo JSON `translations` en los modelos Service y BlogPost, y crear una query dedicada `dashboardStats` que retorne estadisticas reales para el admin dashboard.

---

## Tarea 1: Modificar Prisma Schema

### Archivo: `backend/prisma/schema.prisma`

Agregar campo `translations` de tipo `Json?` a los modelos `Service` y `BlogPost`.

**Cambios exactos:**

```prisma
model Service {
  id           String   @id @default(cuid())
  name         String
  slug         String   @unique
  description  String   @db.Text
  icon         String?
  order        Int      @default(0)
  isActive     Boolean  @default(true) @map("is_active")
  translations Json?    @db.JsonB          // NUEVO
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  @@map("services")
}

model BlogPost {
  id           String    @id @default(cuid())
  slug         String    @unique
  title        String
  excerpt      String?
  content      String    @db.Text
  coverImage   String?   @map("cover_image")
  seoMetadata  Json?     @map("seo_metadata")
  publishedAt  DateTime? @map("published_at")
  isPublished  Boolean   @default(false) @map("is_published")
  translations Json?     @db.JsonB          // NUEVO
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")

  @@map("blog_posts")
}
```

**Nota:** Usar `@db.JsonB` para PostgreSQL (mas eficiente para queries que `Json`).

### Despues de modificar:

```bash
cd backend
npx prisma generate
npx prisma db push    # O npx prisma migrate dev --name add-translations-field
```

### Estructura esperada del JSON `translations`:

Para `Service`:
```json
{
  "es": {
    "name": "Desarrollo Web",
    "description": "Creamos aplicaciones web modernas y escalables..."
  },
  "en": {
    "name": "Web Development",
    "description": "We build modern and scalable web applications..."
  }
}
```

Para `BlogPost`:
```json
{
  "es": {
    "title": "Como construir un MVP en 4 semanas",
    "excerpt": "Guia practica para lanzar tu producto minimo viable...",
    "content": "# Introduccion\n\nEn este articulo..."
  },
  "en": {
    "title": "How to build an MVP in 4 weeks",
    "excerpt": "A practical guide to launching your minimum viable product...",
    "content": "# Introduction\n\nIn this article..."
  }
}
```

---

## Tarea 2: Crear TypeScript Interfaces para Translations

### Archivo nuevo: `backend/src/common/types/translations.ts`

```typescript
// Translation shapes for each model
export interface ServiceTranslation {
  name: string;
  description: string;
}

export interface BlogPostTranslation {
  title: string;
  excerpt?: string;
  content: string;
}

export type Locale = 'es' | 'en';

export type TranslationsMap<T> = Partial<Record<Locale, Partial<T>>>;

// Type guards
export function isValidLocale(locale: string): locale is Locale {
  return locale === 'es' || locale === 'en';
}

export function getTranslation<T>(
  translations: TranslationsMap<T> | null | undefined,
  locale: Locale,
  fallbackLocale: Locale = 'es',
): Partial<T> | undefined {
  if (!translations) return undefined;
  return translations[locale] ?? translations[fallbackLocale];
}
```

---

## Tarea 3: Actualizar GraphQL Entity - Service

### Archivo: `backend/src/modules/services/entities/service.entity.ts`

Agregar el campo `translations` al ObjectType.

**Cambio:**
```typescript
import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-scalars';

@ObjectType()
export class Service {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  slug: string;

  @Field()
  description: string;

  @Field({ nullable: true })
  icon?: string;

  @Field(() => Int)
  order: number;

  @Field()
  isActive: boolean;

  @Field(() => GraphQLJSON, { nullable: true })    // NUEVO
  translations?: Record<string, unknown>;           // NUEVO

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
```

**Nota:** `graphql-scalars` ya esta instalado en el proyecto (`"graphql-scalars": "^1.25.0"` en package.json). Usar `GraphQLJSON` para el scalar JSON.

---

## Tarea 4: Actualizar GraphQL Entity - BlogPost

### Archivo: `backend/src/modules/blog/entities/blog-post.entity.ts`

Mismo patron que Service. Agregar:

```typescript
@Field(() => GraphQLJSON, { nullable: true })
translations?: Record<string, unknown>;
```

---

## Tarea 5: Actualizar DTOs - CreateServiceInput

### Archivo: `backend/src/modules/services/dto/create-service.input.ts`

Agregar campo `translations`:

```typescript
import { InputType, Field, Int } from '@nestjs/graphql';
import { IsString, IsBoolean, IsOptional, IsInt, MinLength, Matches, Min, IsObject } from 'class-validator';
import { GraphQLJSON } from 'graphql-scalars';

@InputType()
export class CreateServiceInput {
  @Field()
  @IsString()
  @MinLength(2)
  name: string;

  @Field()
  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: 'Slug must be lowercase with hyphens only' })
  slug: string;

  @Field()
  @IsString()
  @MinLength(10)
  description: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  icon?: string;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;

  @Field({ nullable: true, defaultValue: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @Field(() => GraphQLJSON, { nullable: true })    // NUEVO
  @IsObject()                                       // NUEVO
  @IsOptional()                                     // NUEVO
  translations?: Record<string, unknown>;            // NUEVO
}
```

### Archivo: `backend/src/modules/services/dto/update-service.input.ts`

Mismo patron: agregar el campo `translations` con los mismos decoradores (todo opcional en update).

---

## Tarea 6: Actualizar DTOs - Blog Post

### Archivos:
- `backend/src/modules/blog/dto/create-blog-post.input.ts`
- `backend/src/modules/blog/dto/update-blog-post.input.ts`

Mismo patron que servicios. Agregar campo `translations` a ambos.

---

## Tarea 7: Actualizar ServicesService

### Archivo: `backend/src/modules/services/services.service.ts`

NO se necesitan cambios significativos en el servicio. Prisma maneja el campo JSON transparentemente. Los metodos `create`, `update`, `findAll` ya funcionaran porque Prisma pasa el JSON tal cual a PostgreSQL.

**Verificar** que `create` y `update` pasen `translations` al `data`:

En `create`:
```typescript
async create(input: CreateServiceInput) {
  // ... slug uniqueness check existente ...
  return this.prisma.service.create({ data: input });
  // ^^ Esto ya funciona porque input ahora incluye `translations`
}
```

En `update`:
```typescript
async update(id: string, input: UpdateServiceInput) {
  // ... existence check existente ...
  return this.prisma.service.update({
    where: { id },
    data: input,
    // ^^ Esto ya funciona
  });
}
```

**El campo `translations` fluye automaticamente porque Prisma acepta JSON nativo.**

---

## Tarea 8: Actualizar ServicesResolver - Agregar argumento `locale` (opcional)

### Archivo: `backend/src/modules/services/services.resolver.ts`

NO modificar las queries existentes para no romper el contrato actual. El campo `translations` ya estara disponible en el response porque lo agregamos al entity.

El frontend se encargara de extraer la traduccion correcta del campo `translations` segun el locale activo. Esto es mas simple y flexible que filtrar en backend.

**Razon:** El backend retorna TODAS las traducciones. El frontend decide cual mostrar. Esto permite caching mas eficiente (una sola response para ambos idiomas) y simplifica el backend.

---

## Tarea 9: Crear Dashboard Stats Module

### Archivos nuevos:

#### `backend/src/modules/dashboard/dashboard.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { DashboardResolver } from './dashboard.resolver.js';
import { DashboardService } from './dashboard.service.js';
import { PrismaModule } from '../../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  providers: [DashboardResolver, DashboardService],
})
export class DashboardModule {}
```

#### `backend/src/modules/dashboard/entities/dashboard-stats.entity.ts`

```typescript
import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class DashboardStats {
  @Field(() => Int)
  totalServices: number;

  @Field(() => Int)
  activeServices: number;

  @Field(() => Int)
  totalBlogPosts: number;

  @Field(() => Int)
  publishedBlogPosts: number;

  @Field(() => Int)
  draftBlogPosts: number;

  @Field(() => Int)
  totalLeads: number;

  @Field(() => Int)
  newLeads: number;

  @Field(() => Int)
  contactedLeads: number;

  @Field(() => Int)
  qualifiedLeads: number;

  @Field(() => Int)
  leadsThisMonth: number;

  @Field(() => Int)
  leadsLastMonth: number;
}
```

#### `backend/src/modules/dashboard/dashboard.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    this.logger.log('Fetching dashboard stats');

    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Execute all counts in parallel
    const [
      totalServices,
      activeServices,
      totalBlogPosts,
      publishedBlogPosts,
      draftBlogPosts,
      totalLeads,
      newLeads,
      contactedLeads,
      qualifiedLeads,
      leadsThisMonth,
      leadsLastMonth,
    ] = await Promise.all([
      this.prisma.service.count(),
      this.prisma.service.count({ where: { isActive: true } }),
      this.prisma.blogPost.count(),
      this.prisma.blogPost.count({ where: { isPublished: true } }),
      this.prisma.blogPost.count({ where: { isPublished: false } }),
      this.prisma.lead.count(),
      this.prisma.lead.count({ where: { status: 'NEW' } }),
      this.prisma.lead.count({ where: { status: 'CONTACTED' } }),
      this.prisma.lead.count({ where: { status: 'QUALIFIED' } }),
      this.prisma.lead.count({
        where: { createdAt: { gte: firstDayThisMonth } },
      }),
      this.prisma.lead.count({
        where: {
          createdAt: {
            gte: firstDayLastMonth,
            lt: firstDayThisMonth,
          },
        },
      }),
    ]);

    return {
      totalServices,
      activeServices,
      totalBlogPosts,
      publishedBlogPosts,
      draftBlogPosts,
      totalLeads,
      newLeads,
      contactedLeads,
      qualifiedLeads,
      leadsThisMonth,
      leadsLastMonth,
    };
  }
}
```

#### `backend/src/modules/dashboard/dashboard.resolver.ts`

```typescript
import { Resolver, Query } from '@nestjs/graphql';
import { DashboardService } from './dashboard.service.js';
import { DashboardStats } from './entities/dashboard-stats.entity.js';
import { Roles } from '../../common/decorators/roles.decorator.js';

@Resolver()
export class DashboardResolver {
  constructor(private readonly dashboardService: DashboardService) {}

  @Roles('admin')
  @Query(() => DashboardStats, { name: 'dashboardStats' })
  async dashboardStats() {
    return this.dashboardService.getStats();
  }
}
```

---

## Tarea 10: Agregar query `servicesCount`

### Archivo: `backend/src/modules/services/services.resolver.ts`

Agregar una nueva query al resolver existente:

```typescript
@Roles('admin')
@Query(() => Int, { name: 'servicesCount' })
async servicesCount(
  @Args('isActive', { nullable: true }) isActive?: boolean,
) {
  return this.servicesService.count(isActive);
}
```

### Archivo: `backend/src/modules/services/services.service.ts`

Agregar metodo `count`:

```typescript
async count(isActive?: boolean) {
  return this.prisma.service.count({
    where: isActive !== undefined ? { isActive } : undefined,
  });
}
```

---

## Tarea 11: Registrar DashboardModule

### Archivo: `backend/src/app.module.ts`

Agregar `DashboardModule` al array de imports:

```typescript
import { DashboardModule } from './modules/dashboard/dashboard.module.js';

@Module({
  imports: [
    // ... modulos existentes ...
    DashboardModule,  // NUEVO
  ],
})
export class AppModule {}
```

---

## Tarea 12: Tests Unitarios

### Test: translations-prisma-schema-migration
**Given** el schema de Prisma tiene el campo `translations Json? @db.JsonB` en Service
**When** se ejecuta `npx prisma db push`
**Then** la columna `translations` de tipo `jsonb` existe en la tabla `services` de PostgreSQL
**Type:** integration
**Layer:** backend

### Test: service-create-with-translations
**Given** no existe un servicio con slug "desarrollo-web"
**When** se ejecuta la mutation `createService` con input que incluye `translations: { es: { name: "Desarrollo Web", description: "..." }, en: { name: "Web Development", description: "..." } }`
**Then** el servicio se crea exitosamente y el campo `translations` se persiste correctamente en la DB
**Type:** unit
**Layer:** backend

```typescript
// Archivo: backend/src/modules/services/services.service.spec.ts (agregar test)
describe('create with translations', () => {
  it('should create a service with translations', async () => {
    const input = {
      name: 'Desarrollo Web',
      slug: 'desarrollo-web',
      description: 'Creamos aplicaciones web modernas y escalables para tu negocio.',
      translations: {
        es: { name: 'Desarrollo Web', description: 'Creamos aplicaciones web modernas...' },
        en: { name: 'Web Development', description: 'We build modern web applications...' },
      },
    };

    mockPrismaService.service.findUnique.mockResolvedValue(null);
    mockPrismaService.service.create.mockResolvedValue({
      id: 'test-id',
      ...input,
      icon: null,
      order: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await service.create(input);
    expect(result.translations).toEqual(input.translations);
    expect(mockPrismaService.service.create).toHaveBeenCalledWith({
      data: input,
    });
  });
});
```

### Test: service-create-without-translations
**Given** no existe un servicio con slug "mobile-dev"
**When** se ejecuta la mutation `createService` con input SIN campo `translations`
**Then** el servicio se crea exitosamente con `translations: null` (backward compatible)
**Type:** unit
**Layer:** backend

```typescript
it('should create a service without translations (backward compatible)', async () => {
  const input = {
    name: 'Mobile Development',
    slug: 'mobile-dev',
    description: 'We build mobile apps for iOS and Android.',
  };

  mockPrismaService.service.findUnique.mockResolvedValue(null);
  mockPrismaService.service.create.mockResolvedValue({
    id: 'test-id',
    ...input,
    translations: null,
    icon: null,
    order: 0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const result = await service.create(input);
  expect(result.translations).toBeNull();
});
```

### Test: service-update-translations
**Given** un servicio existe con translations en espanol
**When** se ejecuta `updateService` con nuevas translations que incluyen ingles
**Then** el campo `translations` se actualiza con ambos idiomas
**Type:** unit
**Layer:** backend

```typescript
it('should update service translations', async () => {
  const existingService = {
    id: 'test-id',
    name: 'Desarrollo Web',
    slug: 'desarrollo-web',
    description: 'Original',
    translations: { es: { name: 'Desarrollo Web' } },
    icon: null,
    order: 0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const updateInput = {
    translations: {
      es: { name: 'Desarrollo Web', description: 'Creamos apps...' },
      en: { name: 'Web Development', description: 'We build apps...' },
    },
  };

  mockPrismaService.service.findUnique.mockResolvedValue(existingService);
  mockPrismaService.service.update.mockResolvedValue({
    ...existingService,
    ...updateInput,
  });

  const result = await service.update('test-id', updateInput);
  expect(result.translations).toEqual(updateInput.translations);
});
```

### Test: blog-post-create-with-translations
**Given** no existe un blog post con slug "como-construir-mvp"
**When** se ejecuta `createBlogPost` con translations
**Then** el blog post se crea con el campo translations persistido
**Type:** unit
**Layer:** backend

### Test: dashboard-stats-all-counts
**Given** la DB tiene: 6 servicios (4 activos), 5 blog posts (3 publicados, 2 drafts), 20 leads (8 NEW, 5 CONTACTED, 3 QUALIFIED, 2 PROPOSAL, 1 WON, 1 LOST), 12 leads este mes, 8 leads el mes pasado
**When** se ejecuta la query `dashboardStats`
**Then** retorna `{ totalServices: 6, activeServices: 4, totalBlogPosts: 5, publishedBlogPosts: 3, draftBlogPosts: 2, totalLeads: 20, newLeads: 8, contactedLeads: 5, qualifiedLeads: 3, leadsThisMonth: 12, leadsLastMonth: 8 }`
**Type:** unit
**Layer:** backend

```typescript
// Archivo: backend/src/modules/dashboard/dashboard.service.spec.ts (nuevo archivo)
import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let mockPrisma: any;

  beforeEach(async () => {
    mockPrisma = {
      service: { count: jest.fn() },
      blogPost: { count: jest.fn() },
      lead: { count: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  it('should return all dashboard stats correctly', async () => {
    // Mock counts in order of Promise.all calls
    mockPrisma.service.count
      .mockResolvedValueOnce(6)   // totalServices
      .mockResolvedValueOnce(4);  // activeServices

    mockPrisma.blogPost.count
      .mockResolvedValueOnce(5)   // totalBlogPosts
      .mockResolvedValueOnce(3)   // publishedBlogPosts
      .mockResolvedValueOnce(2);  // draftBlogPosts

    mockPrisma.lead.count
      .mockResolvedValueOnce(20)  // totalLeads
      .mockResolvedValueOnce(8)   // newLeads
      .mockResolvedValueOnce(5)   // contactedLeads
      .mockResolvedValueOnce(3)   // qualifiedLeads
      .mockResolvedValueOnce(12)  // leadsThisMonth
      .mockResolvedValueOnce(8);  // leadsLastMonth

    const result = await service.getStats();

    expect(result).toEqual({
      totalServices: 6,
      activeServices: 4,
      totalBlogPosts: 5,
      publishedBlogPosts: 3,
      draftBlogPosts: 2,
      totalLeads: 20,
      newLeads: 8,
      contactedLeads: 5,
      qualifiedLeads: 3,
      leadsThisMonth: 12,
      leadsLastMonth: 8,
    });

    // Verify Promise.all was used (11 total count calls)
    expect(mockPrisma.service.count).toHaveBeenCalledTimes(2);
    expect(mockPrisma.blogPost.count).toHaveBeenCalledTimes(3);
    expect(mockPrisma.lead.count).toHaveBeenCalledTimes(6);
  });

  it('should use correct date ranges for monthly lead counts', async () => {
    // Setup all mocks
    mockPrisma.service.count.mockResolvedValue(0);
    mockPrisma.blogPost.count.mockResolvedValue(0);
    mockPrisma.lead.count.mockResolvedValue(0);

    await service.getStats();

    // Get the calls to lead.count
    const leadCountCalls = mockPrisma.lead.count.mock.calls;

    // 5th call (index 4) = leadsThisMonth
    const thisMonthWhere = leadCountCalls[4][0]?.where;
    expect(thisMonthWhere).toHaveProperty('createdAt');
    expect(thisMonthWhere.createdAt).toHaveProperty('gte');

    // 6th call (index 5) = leadsLastMonth
    const lastMonthWhere = leadCountCalls[5][0]?.where;
    expect(lastMonthWhere).toHaveProperty('createdAt');
    expect(lastMonthWhere.createdAt).toHaveProperty('gte');
    expect(lastMonthWhere.createdAt).toHaveProperty('lt');
  });
});
```

### Test: dashboard-stats-empty-database
**Given** la DB esta vacia (0 servicios, 0 blog posts, 0 leads)
**When** se ejecuta `dashboardStats`
**Then** retorna todos los campos en 0
**Type:** unit
**Layer:** backend

```typescript
it('should handle empty database gracefully', async () => {
  mockPrisma.service.count.mockResolvedValue(0);
  mockPrisma.blogPost.count.mockResolvedValue(0);
  mockPrisma.lead.count.mockResolvedValue(0);

  const result = await service.getStats();

  expect(result.totalServices).toBe(0);
  expect(result.totalBlogPosts).toBe(0);
  expect(result.totalLeads).toBe(0);
  expect(result.leadsThisMonth).toBe(0);
  expect(result.leadsLastMonth).toBe(0);
});
```

### Test: dashboard-resolver-requires-admin
**Given** un usuario NO autenticado como admin
**When** intenta ejecutar la query `dashboardStats`
**Then** recibe un error de autorizacion (403 o Unauthorized)
**Type:** unit
**Layer:** backend

```typescript
// Archivo: backend/src/modules/dashboard/dashboard.resolver.spec.ts (nuevo archivo)
import { Test, TestingModule } from '@nestjs/testing';
import { DashboardResolver } from './dashboard.resolver';
import { DashboardService } from './dashboard.service';

describe('DashboardResolver', () => {
  let resolver: DashboardResolver;
  let mockDashboardService: any;

  beforeEach(async () => {
    mockDashboardService = {
      getStats: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardResolver,
        { provide: DashboardService, useValue: mockDashboardService },
      ],
    }).compile();

    resolver = module.get<DashboardResolver>(DashboardResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('should return dashboard stats', async () => {
    const mockStats = {
      totalServices: 4,
      activeServices: 3,
      totalBlogPosts: 2,
      publishedBlogPosts: 1,
      draftBlogPosts: 1,
      totalLeads: 10,
      newLeads: 5,
      contactedLeads: 3,
      qualifiedLeads: 2,
      leadsThisMonth: 7,
      leadsLastMonth: 3,
    };

    mockDashboardService.getStats.mockResolvedValue(mockStats);

    const result = await resolver.dashboardStats();
    expect(result).toEqual(mockStats);
  });

  it('should have @Roles("admin") decorator', () => {
    // Verify the resolver method has the admin role guard
    const metadata = Reflect.getMetadata('roles', DashboardResolver.prototype.dashboardStats);
    expect(metadata).toContain('admin');
  });
});
```

### Test: services-count-query
**Given** existen 6 servicios, 4 activos y 2 inactivos
**When** se ejecuta `servicesCount(isActive: true)`
**Then** retorna 4
**Type:** unit
**Layer:** backend

```typescript
// Agregar al archivo existente: backend/src/modules/services/services.service.spec.ts
describe('count', () => {
  it('should count all services', async () => {
    mockPrismaService.service.count.mockResolvedValue(6);
    const result = await service.count();
    expect(result).toBe(6);
    expect(mockPrismaService.service.count).toHaveBeenCalledWith({
      where: undefined,
    });
  });

  it('should count active services only', async () => {
    mockPrismaService.service.count.mockResolvedValue(4);
    const result = await service.count(true);
    expect(result).toBe(4);
    expect(mockPrismaService.service.count).toHaveBeenCalledWith({
      where: { isActive: true },
    });
  });

  it('should count inactive services only', async () => {
    mockPrismaService.service.count.mockResolvedValue(2);
    const result = await service.count(false);
    expect(result).toBe(2);
    expect(mockPrismaService.service.count).toHaveBeenCalledWith({
      where: { isActive: false },
    });
  });
});
```

### Test: services-resolver-services-count
**Given** el servicio retorna count = 4
**When** se ejecuta la query `servicesCount` via resolver
**Then** el resolver retorna 4
**Type:** unit
**Layer:** backend

```typescript
// Agregar al archivo existente: backend/src/modules/services/services.resolver.spec.ts
describe('servicesCount', () => {
  it('should return service count', async () => {
    mockServicesService.count.mockResolvedValue(4);
    const result = await resolver.servicesCount(true);
    expect(result).toBe(4);
    expect(mockServicesService.count).toHaveBeenCalledWith(true);
  });

  it('should return total count when isActive is undefined', async () => {
    mockServicesService.count.mockResolvedValue(6);
    const result = await resolver.servicesCount();
    expect(result).toBe(6);
  });
});
```

---

## Resumen de Archivos

### Archivos a MODIFICAR:

| Archivo | Cambio |
|---------|--------|
| `backend/prisma/schema.prisma` | Agregar `translations Json? @db.JsonB` a Service y BlogPost |
| `backend/src/modules/services/entities/service.entity.ts` | Agregar campo `translations` con GraphQLJSON |
| `backend/src/modules/blog/entities/blog-post.entity.ts` | Agregar campo `translations` con GraphQLJSON |
| `backend/src/modules/services/dto/create-service.input.ts` | Agregar campo `translations` |
| `backend/src/modules/services/dto/update-service.input.ts` | Agregar campo `translations` |
| `backend/src/modules/blog/dto/create-blog-post.input.ts` | Agregar campo `translations` |
| `backend/src/modules/blog/dto/update-blog-post.input.ts` | Agregar campo `translations` |
| `backend/src/modules/services/services.service.ts` | Agregar metodo `count()` |
| `backend/src/modules/services/services.resolver.ts` | Agregar query `servicesCount` |
| `backend/src/app.module.ts` | Importar `DashboardModule` |
| `backend/src/modules/services/services.service.spec.ts` | Agregar tests: translations + count |
| `backend/src/modules/services/services.resolver.spec.ts` | Agregar test: servicesCount |

### Archivos a CREAR:

| Archivo | Contenido |
|---------|-----------|
| `backend/src/common/types/translations.ts` | Interfaces TypeScript para translations |
| `backend/src/modules/dashboard/dashboard.module.ts` | Modulo NestJS |
| `backend/src/modules/dashboard/dashboard.service.ts` | Servicio con getStats() |
| `backend/src/modules/dashboard/dashboard.resolver.ts` | Resolver con query dashboardStats |
| `backend/src/modules/dashboard/entities/dashboard-stats.entity.ts` | GraphQL ObjectType |
| `backend/src/modules/dashboard/dashboard.service.spec.ts` | Tests unitarios servicio |
| `backend/src/modules/dashboard/dashboard.resolver.spec.ts` | Tests unitarios resolver |

---

## Checklist de Verificacion

- [ ] `npx prisma generate` ejecuta sin errores
- [ ] `npx prisma db push` aplica el schema sin errores
- [ ] `npm run build` compila sin errores de TypeScript
- [ ] `npm test` pasa todos los tests existentes (73) + nuevos tests
- [ ] GraphQL Playground en `http://localhost:4000/graphql` muestra:
  - [ ] Campo `translations` en tipo `Service`
  - [ ] Campo `translations` en tipo `BlogPost`
  - [ ] Query `dashboardStats` disponible
  - [ ] Query `servicesCount` disponible
- [ ] Query `services` sigue funcionando sin cambios (backward compatible)
- [ ] Mutation `createService` acepta `translations` como parametro opcional
- [ ] Query `dashboardStats` requiere autenticacion admin
