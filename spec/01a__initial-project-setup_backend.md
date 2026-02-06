# Spec 01a: Initial Project Setup - Backend Tasks

**Estado:** COMPLETADO
**Fecha:** 2026-01-29
**Agente:** backend-dev
**Dependencias:** Ninguna (primera fase)
**Plan Principal:** `spec/01__initial-project-setup.md`

---

## Resumen

Implementar el backend completo de manuelalvarez.cloud usando NestJS con GraphQL (Apollo Server) y Prisma ORM. Incluye autenticacion con Clerk, tres modulos principales (Services, BlogPosts, Leads), y dockerizacion.

---

## Orden de Implementacion

### Fase 2.1: Setup Inicial NestJS

**Objetivo:** Crear proyecto NestJS con configuracion base.

**Tareas:**

1. Crear directorio `backend/` en el root del proyecto
2. Inicializar proyecto NestJS:
   ```bash
   cd backend
   npx @nestjs/cli new . --package-manager npm --skip-git
   ```
3. Instalar dependencias core:
   ```bash
   npm install @nestjs/graphql @nestjs/apollo @apollo/server graphql
   npm install @prisma/client
   npm install class-validator class-transformer
   npm install @nestjs/config
   npm install graphql-scalars
   npm install -D prisma
   npm install -D @types/node
   ```
4. Configurar `tsconfig.json` con strict mode
5. Crear archivo `.env.example` con todas las variables requeridas
6. Crear `.gitignore` apropiado

**Tests a implementar:**

```typescript
// test/app.e2e-spec.ts
describe('AppController (e2e)', () => {
  it('/ (GET) should return health check', () => {
    // Basic health check endpoint
  });
});
```

**Criterios de aceptacion:**
- [ ] `npm run start:dev` arranca sin errores
- [ ] Servidor escucha en puerto 4000

---

### Fase 2.2: Configurar Prisma Module

**Objetivo:** Setup de Prisma ORM con schema completo.

**Tareas:**

1. Inicializar Prisma:
   ```bash
   npx prisma init
   ```

2. Crear `prisma/schema.prisma` con el schema completo del SRS:
   ```prisma
   generator client {
     provider = "prisma-client-js"
   }

   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }

   model AdminUser {
     id          String   @id @default(cuid())
     clerkUserId String   @unique @map("clerk_user_id")
     role        Role     @default(ADMIN)
     createdAt   DateTime @default(now()) @map("created_at")
     updatedAt   DateTime @updatedAt @map("updated_at")

     @@map("admin_users")
   }

   enum Role {
     ADMIN
     SUPER_ADMIN
   }

   model Service {
     id          String   @id @default(cuid())
     name        String
     slug        String   @unique
     description String   @db.Text
     icon        String?
     order       Int      @default(0)
     isActive    Boolean  @default(true) @map("is_active")
     createdAt   DateTime @default(now()) @map("created_at")
     updatedAt   DateTime @updatedAt @map("updated_at")

     @@map("services")
   }

   model BlogPost {
     id          String    @id @default(cuid())
     slug        String    @unique
     title       String
     excerpt     String?
     content     String    @db.Text
     coverImage  String?   @map("cover_image")
     seoMetadata Json?     @map("seo_metadata")
     publishedAt DateTime? @map("published_at")
     isPublished Boolean   @default(false) @map("is_published")
     createdAt   DateTime  @default(now()) @map("created_at")
     updatedAt   DateTime  @updatedAt @map("updated_at")

     @@map("blog_posts")
   }

   model Lead {
     id        String     @id @default(cuid())
     name      String
     email     String
     company   String?
     message   String     @db.Text
     status    LeadStatus @default(NEW)
     notes     String?    @db.Text
     createdAt DateTime   @default(now()) @map("created_at")
     updatedAt DateTime   @updatedAt @map("updated_at")

     @@map("leads")
   }

   enum LeadStatus {
     NEW
     CONTACTED
     QUALIFIED
     PROPOSAL
     WON
     LOST
   }
   ```

3. Crear `src/prisma/prisma.module.ts`:
   ```typescript
   import { Global, Module } from '@nestjs/common';
   import { PrismaService } from './prisma.service';

   @Global()
   @Module({
     providers: [PrismaService],
     exports: [PrismaService],
   })
   export class PrismaModule {}
   ```

4. Crear `src/prisma/prisma.service.ts`:
   ```typescript
   import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
   import { PrismaClient } from '@prisma/client';

   @Injectable()
   export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
     async onModuleInit() {
       await this.$connect();
     }

     async onModuleDestroy() {
       await this.$disconnect();
     }
   }
   ```

5. Ejecutar migraciones:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

6. (Opcional) Crear `prisma/seed.ts` con datos iniciales

**Tests a implementar:**

```typescript
// src/prisma/prisma.service.spec.ts
describe('PrismaService', () => {
  it('should connect to database', async () => {
    // Test database connection
  });

  it('should disconnect gracefully', async () => {
    // Test disconnect
  });
});
```

**Criterios de aceptacion:**
- [ ] Prisma Client generado sin errores
- [ ] Conexion a PostgreSQL exitosa
- [ ] Schema aplicado a la base de datos

---

### Fase 2.3: Configurar GraphQL Module

**Objetivo:** Setup de Apollo Server con GraphQL.

**Tareas:**

1. Actualizar `src/app.module.ts`:
   ```typescript
   import { Module } from '@nestjs/common';
   import { GraphQLModule } from '@nestjs/graphql';
   import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
   import { ConfigModule } from '@nestjs/config';
   import { join } from 'path';
   import { PrismaModule } from './prisma/prisma.module';

   @Module({
     imports: [
       ConfigModule.forRoot({
         isGlobal: true,
       }),
       GraphQLModule.forRoot<ApolloDriverConfig>({
         driver: ApolloDriver,
         autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
         sortSchema: true,
         playground: process.env.NODE_ENV !== 'production',
         introspection: process.env.NODE_ENV !== 'production',
         context: ({ req }) => ({ req }),
       }),
       PrismaModule,
     ],
   })
   export class AppModule {}
   ```

2. Crear `src/common/scalars/date-time.scalar.ts` para DateTime scalar

3. Crear `src/common/scalars/json.scalar.ts` o usar `graphql-scalars`

**Tests a implementar:**

```typescript
// test/graphql.e2e-spec.ts
describe('GraphQL (e2e)', () => {
  it('should respond to introspection query', async () => {
    // Test GraphQL endpoint is working
  });
});
```

**Criterios de aceptacion:**
- [ ] GraphQL Playground accesible en http://localhost:4000/graphql
- [ ] Introspection query funciona

---

### Fase 2.4: Implementar Auth (Clerk)

**Objetivo:** Configurar autenticacion JWT con Clerk.

**Tareas:**

1. Instalar Clerk SDK:
   ```bash
   npm install @clerk/clerk-sdk-node
   ```

2. Crear `src/common/guards/clerk-auth.guard.ts`:
   ```typescript
   import {
     Injectable,
     CanActivate,
     ExecutionContext,
     UnauthorizedException,
   } from '@nestjs/common';
   import { GqlExecutionContext } from '@nestjs/graphql';
   import { Reflector } from '@nestjs/core';
   import { clerkClient } from '@clerk/clerk-sdk-node';
   import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

   @Injectable()
   export class ClerkAuthGuard implements CanActivate {
     constructor(private reflector: Reflector) {}

     async canActivate(context: ExecutionContext): Promise<boolean> {
       const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
         context.getHandler(),
         context.getClass(),
       ]);

       if (isPublic) {
         return true;
       }

       const ctx = GqlExecutionContext.create(context);
       const request = ctx.getContext().req;
       const authHeader = request.headers.authorization;

       if (!authHeader) {
         throw new UnauthorizedException('No authorization header');
       }

       const token = authHeader.replace('Bearer ', '');

       try {
         const decoded = await clerkClient.verifyToken(token);
         request.user = decoded;
         return true;
       } catch (error) {
         throw new UnauthorizedException('Invalid token');
       }
     }
   }
   ```

3. Crear `src/common/decorators/public.decorator.ts`:
   ```typescript
   import { SetMetadata } from '@nestjs/common';

   export const IS_PUBLIC_KEY = 'isPublic';
   export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
   ```

4. Crear `src/common/decorators/current-user.decorator.ts`:
   ```typescript
   import { createParamDecorator, ExecutionContext } from '@nestjs/common';
   import { GqlExecutionContext } from '@nestjs/graphql';

   export const CurrentUser = createParamDecorator(
     (data: unknown, context: ExecutionContext) => {
       const ctx = GqlExecutionContext.create(context);
       return ctx.getContext().req.user;
     },
   );
   ```

5. Registrar guard globalmente en `app.module.ts`:
   ```typescript
   import { APP_GUARD } from '@nestjs/core';
   import { ClerkAuthGuard } from './common/guards/clerk-auth.guard';

   providers: [
     {
       provide: APP_GUARD,
       useClass: ClerkAuthGuard,
     },
   ],
   ```

**Tests a implementar:**

```typescript
// src/common/guards/clerk-auth.guard.spec.ts
describe('ClerkAuthGuard', () => {
  it('should allow public routes without auth', async () => {
    // Test @Public() decorator
  });

  it('should reject requests without token', async () => {
    // Test missing auth header
  });

  it('should reject invalid tokens', async () => {
    // Test invalid JWT
  });

  it('should allow valid Clerk tokens', async () => {
    // Test valid JWT (mock Clerk verification)
  });
});
```

**Criterios de aceptacion:**
- [ ] Rutas con @Public() accesibles sin auth
- [ ] Rutas protegidas requieren JWT valido
- [ ] CurrentUser decorator retorna user info

---

### Fase 2.5: Implementar Services Module

**Objetivo:** CRUD completo para servicios.

**Tareas:**

1. Crear estructura de archivos:
   ```
   src/modules/services/
   ├── services.module.ts
   ├── services.resolver.ts
   ├── services.service.ts
   ├── entities/
   │   └── service.entity.ts
   └── dto/
       ├── create-service.input.ts
       ├── update-service.input.ts
       └── service-where.input.ts
   ```

2. Implementar `entities/service.entity.ts`:
   ```typescript
   import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

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

     @Field()
     createdAt: Date;

     @Field()
     updatedAt: Date;
   }
   ```

3. Implementar DTOs con class-validator:
   ```typescript
   // dto/create-service.input.ts
   import { InputType, Field, Int } from '@nestjs/graphql';
   import { IsString, IsBoolean, IsOptional, IsInt, MinLength, Matches } from 'class-validator';

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
     @IsOptional()
     order?: number;

     @Field({ nullable: true, defaultValue: true })
     @IsBoolean()
     @IsOptional()
     isActive?: boolean;
   }
   ```

4. Implementar `services.service.ts`:
   ```typescript
   import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
   import { PrismaService } from '../../prisma/prisma.service';
   import { CreateServiceInput } from './dto/create-service.input';
   import { UpdateServiceInput } from './dto/update-service.input';
   import { ServiceWhereInput } from './dto/service-where.input';

   @Injectable()
   export class ServicesService {
     constructor(private prisma: PrismaService) {}

     async findAll(where?: ServiceWhereInput) {
       return this.prisma.service.findMany({
         where: where ? { isActive: where.isActive } : undefined,
         orderBy: { order: 'asc' },
       });
     }

     async findOne(id: string) {
       return this.prisma.service.findUnique({ where: { id } });
     }

     async findBySlug(slug: string) {
       return this.prisma.service.findUnique({ where: { slug } });
     }

     async create(input: CreateServiceInput) {
       const existing = await this.prisma.service.findUnique({
         where: { slug: input.slug },
       });
       if (existing) {
         throw new ConflictException('Service with this slug already exists');
       }
       return this.prisma.service.create({ data: input });
     }

     async update(id: string, input: UpdateServiceInput) {
       const service = await this.prisma.service.findUnique({ where: { id } });
       if (!service) {
         throw new NotFoundException('Service not found');
       }
       return this.prisma.service.update({
         where: { id },
         data: input,
       });
     }

     async delete(id: string) {
       const service = await this.prisma.service.findUnique({ where: { id } });
       if (!service) {
         throw new NotFoundException('Service not found');
       }
       return this.prisma.service.delete({ where: { id } });
     }
   }
   ```

5. Implementar `services.resolver.ts`:
   ```typescript
   import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
   import { ServicesService } from './services.service';
   import { Service } from './entities/service.entity';
   import { CreateServiceInput } from './dto/create-service.input';
   import { UpdateServiceInput } from './dto/update-service.input';
   import { ServiceWhereInput } from './dto/service-where.input';
   import { Public } from '../../common/decorators/public.decorator';

   @Resolver(() => Service)
   export class ServicesResolver {
     constructor(private readonly servicesService: ServicesService) {}

     @Public()
     @Query(() => [Service])
     async services(
       @Args('where', { nullable: true }) where?: ServiceWhereInput,
     ) {
       return this.servicesService.findAll(where);
     }

     @Public()
     @Query(() => Service, { nullable: true })
     async service(@Args('id', { type: () => ID }) id: string) {
       return this.servicesService.findOne(id);
     }

     @Public()
     @Query(() => Service, { nullable: true })
     async serviceBySlug(@Args('slug') slug: string) {
       return this.servicesService.findBySlug(slug);
     }

     @Mutation(() => Service)
     async createService(@Args('input') input: CreateServiceInput) {
       return this.servicesService.create(input);
     }

     @Mutation(() => Service)
     async updateService(
       @Args('id', { type: () => ID }) id: string,
       @Args('input') input: UpdateServiceInput,
     ) {
       return this.servicesService.update(id, input);
     }

     @Mutation(() => Service)
     async deleteService(@Args('id', { type: () => ID }) id: string) {
       return this.servicesService.delete(id);
     }
   }
   ```

**Tests a implementar:**

```typescript
// src/modules/services/services.service.spec.ts
describe('ServicesService', () => {
  describe('findAll', () => {
    it('should return all services when no filter', async () => {});
    it('should return only active services when filtered', async () => {});
    it('should return services ordered by order field', async () => {});
  });

  describe('findBySlug', () => {
    it('should return service by slug', async () => {});
    it('should return null for non-existent slug', async () => {});
  });

  describe('create', () => {
    it('should create a new service', async () => {});
    it('should throw ConflictException for duplicate slug', async () => {});
  });

  describe('update', () => {
    it('should update existing service', async () => {});
    it('should throw NotFoundException for non-existent id', async () => {});
  });

  describe('delete', () => {
    it('should delete existing service', async () => {});
    it('should throw NotFoundException for non-existent id', async () => {});
  });
});

// src/modules/services/services.resolver.spec.ts
describe('ServicesResolver', () => {
  describe('Query: services', () => {
    it('should be public (no auth required)', async () => {});
  });

  describe('Mutation: createService', () => {
    it('should require authentication', async () => {});
  });
});

// test/services.e2e-spec.ts
describe('Services (e2e)', () => {
  it('GET /graphql - query services without auth', async () => {});
  it('POST /graphql - create service without auth should fail', async () => {});
  it('POST /graphql - create service with valid auth', async () => {});
});
```

**Criterios de aceptacion:**
- [ ] Query services funciona sin autenticacion
- [ ] Mutations requieren autenticacion
- [ ] Validacion de inputs funciona (slug format, required fields)
- [ ] Slug duplicado retorna error 409

---

### Fase 2.6: Implementar BlogPosts Module

**Objetivo:** CRUD completo para blog posts.

**Tareas:**

1. Crear estructura similar a Services:
   ```
   src/modules/blog/
   ├── blog.module.ts
   ├── blog.resolver.ts
   ├── blog.service.ts
   ├── entities/
   │   └── blog-post.entity.ts
   └── dto/
       ├── create-blog-post.input.ts
       ├── update-blog-post.input.ts
       └── blog-post-where.input.ts
   ```

2. Implementar entity con seoMetadata como JSON

3. Implementar service con logica:
   - `findAll`: Filtrar por isPublished para queries publicas
   - `findBySlug`: Solo retornar si isPublished = true para publico
   - Queries de admin retornan todos

4. Implementar resolver con:
   - Queries publicas solo muestran publicados
   - Mutations protegidas

**Tests a implementar:**

```typescript
// src/modules/blog/blog.service.spec.ts
describe('BlogService', () => {
  describe('findAll (public)', () => {
    it('should return only published posts by default', async () => {});
    it('should support pagination (take, skip)', async () => {});
  });

  describe('findBySlug (public)', () => {
    it('should return published post by slug', async () => {});
    it('should return null for unpublished post', async () => {});
  });

  describe('create', () => {
    it('should create draft post by default', async () => {});
    it('should set publishedAt when isPublished is true', async () => {});
  });

  describe('update', () => {
    it('should set publishedAt when publishing', async () => {});
  });
});

// test/blog.e2e-spec.ts
describe('Blog (e2e)', () => {
  it('should not return draft posts in public query', async () => {});
  it('should return full post content in blogPostBySlug', async () => {});
});
```

**Criterios de aceptacion:**
- [ ] Solo posts publicados visibles en queries publicas
- [ ] seoMetadata se almacena como JSON
- [ ] publishedAt se setea automaticamente al publicar
- [ ] Paginacion funciona (take, skip)

---

### Fase 2.7: Implementar Leads Module

**Objetivo:** CRUD para leads con createLead publico.

**Tareas:**

1. Crear estructura:
   ```
   src/modules/leads/
   ├── leads.module.ts
   ├── leads.resolver.ts
   ├── leads.service.ts
   ├── entities/
   │   └── lead.entity.ts
   └── dto/
       ├── create-lead.input.ts
       ├── update-lead.input.ts
       └── lead-where.input.ts
   ```

2. Implementar entity con LeadStatus enum

3. Implementar CreateLeadInput con validacion de email:
   ```typescript
   @InputType()
   export class CreateLeadInput {
     @Field()
     @IsString()
     @MinLength(2)
     name: string;

     @Field()
     @IsEmail()
     email: string;

     @Field({ nullable: true })
     @IsString()
     @IsOptional()
     company?: string;

     @Field()
     @IsString()
     @MinLength(10)
     message: string;
   }
   ```

4. Implementar resolver con:
   - `createLead`: @Public() - accesible sin auth
   - `leads`, `lead`, `updateLead`, `deleteLead`: Protegidos

**Tests a implementar:**

```typescript
// src/modules/leads/leads.service.spec.ts
describe('LeadsService', () => {
  describe('create', () => {
    it('should create lead with status NEW', async () => {});
    it('should validate email format', async () => {});
  });

  describe('findAll', () => {
    it('should filter by status', async () => {});
  });

  describe('update', () => {
    it('should update lead status', async () => {});
    it('should update notes', async () => {});
  });
});

// test/leads.e2e-spec.ts
describe('Leads (e2e)', () => {
  it('should create lead without authentication', async () => {});
  it('should reject invalid email', async () => {});
  it('should reject query leads without auth', async () => {});
  it('should allow query leads with valid auth', async () => {});
});
```

**Criterios de aceptacion:**
- [ ] createLead funciona sin autenticacion (formulario de contacto)
- [ ] Validacion de email funciona
- [ ] Queries y otras mutations requieren auth
- [ ] Filtro por status funciona

---

### Fase 2.8: Tests E2E

**Objetivo:** Suite completa de tests end-to-end.

**Tareas:**

1. Configurar test database (puede ser SQLite para tests o PostgreSQL de test)

2. Configurar `test/jest-e2e.json`:
   ```json
   {
     "moduleFileExtensions": ["js", "json", "ts"],
     "rootDir": ".",
     "testEnvironment": "node",
     "testRegex": ".e2e-spec.ts$",
     "transform": {
       "^.+\\.(t|j)s$": "ts-jest"
     },
     "setupFilesAfterEnv": ["./setup.ts"]
   }
   ```

3. Crear `test/setup.ts` para inicializar base de datos de test

4. Implementar tests E2E completos para cada modulo

**Tests a implementar:**

```typescript
// test/app.e2e-spec.ts
describe('Application (e2e)', () => {
  describe('Health', () => {
    it('should return 200 on health check', () => {});
  });

  describe('GraphQL', () => {
    it('should respond to introspection', () => {});
  });
});

// test/services.e2e-spec.ts - ya descrito arriba
// test/blog.e2e-spec.ts - ya descrito arriba
// test/leads.e2e-spec.ts - ya descrito arriba

// test/auth.e2e-spec.ts
describe('Authentication (e2e)', () => {
  it('should reject protected mutations without token', () => {});
  it('should accept protected mutations with valid token', () => {});
});
```

**Criterios de aceptacion:**
- [ ] Tests E2E pasan con `npm run test:e2e`
- [ ] Coverage > 80% en services

---

### Fase 2.9: Dockerizacion

**Objetivo:** Containerizar el backend.

**Tareas:**

1. Crear `Dockerfile` (produccion):
   ```dockerfile
   # Build stage
   FROM node:20-alpine AS builder

   WORKDIR /app

   COPY package*.json ./
   COPY prisma ./prisma/

   RUN npm ci

   COPY . .

   RUN npx prisma generate
   RUN npm run build

   # Production stage
   FROM node:20-alpine

   WORKDIR /app

   COPY --from=builder /app/dist ./dist
   COPY --from=builder /app/node_modules ./node_modules
   COPY --from=builder /app/package*.json ./
   COPY --from=builder /app/prisma ./prisma

   ENV NODE_ENV=production

   EXPOSE 4000

   CMD ["node", "dist/main.js"]
   ```

2. Crear `Dockerfile.dev` (desarrollo):
   ```dockerfile
   FROM node:20-alpine

   WORKDIR /app

   COPY package*.json ./
   COPY prisma ./prisma/

   RUN npm install

   COPY . .

   RUN npx prisma generate

   EXPOSE 4000

   CMD ["npm", "run", "start:dev"]
   ```

3. Crear `.dockerignore`:
   ```
   node_modules
   dist
   .git
   .env
   *.log
   ```

4. Testear build local:
   ```bash
   docker build -t manuelalvarez-backend .
   docker run -p 4000:4000 manuelalvarez-backend
   ```

**Criterios de aceptacion:**
- [ ] `docker build` exitoso sin errores
- [ ] Container arranca y responde en /graphql
- [ ] Prisma client funciona dentro del container

---

## Checklist Final Backend

- [ ] NestJS proyecto creado y configurado
- [ ] Prisma schema aplicado a PostgreSQL
- [ ] GraphQL Playground funcionando
- [ ] Auth con Clerk implementada
- [ ] Services CRUD completo con tests
- [ ] BlogPosts CRUD completo con tests
- [ ] Leads CRUD completo con tests
- [ ] Tests unitarios pasan
- [ ] Tests E2E pasan
- [ ] Docker build exitoso
- [ ] Documentacion de API generada (schema.gql)

---

## Comandos Utiles

```bash
# Desarrollo
npm run start:dev          # Iniciar con hot reload
npm run start:debug        # Iniciar con debugger

# Base de datos
npx prisma generate        # Regenerar client
npx prisma db push         # Aplicar schema
npx prisma studio          # GUI para explorar datos

# Tests
npm run test               # Unit tests
npm run test:watch         # Unit tests con watch
npm run test:cov           # Coverage report
npm run test:e2e           # E2E tests

# Build
npm run build              # Compilar TypeScript
npm run lint               # Lint code

# Docker
docker build -t backend .
docker run -p 4000:4000 --env-file .env backend
```

---

## Notas Importantes

1. **Clerk SDK**: Usar `@clerk/clerk-sdk-node` version compatible con NestJS
2. **GraphQL Code First**: Usamos decoradores de NestJS, no schema SDL manual
3. **Validation Pipe**: Habilitar globalmente para DTOs
4. **Error Handling**: NestJS convierte excepciones a errores GraphQL automaticamente
5. **Logger**: Usar Logger de NestJS para debugging
