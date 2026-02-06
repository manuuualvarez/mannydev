# Spec 02a: Complete Site Features - Backend Tasks

**Estado:** PENDIENTE
**Fecha:** 2026-01-30
**Agente:** backend-dev
**Dependencias:** Spec 01 completado (backend base funcional)
**Plan Principal:** `spec/02__complete-site-features.md`

---

## Resumen

Implementar los modulos backend faltantes para completar el sitio: Companies, Certifications, Pages, FAQs, SiteSettings. Extender el modelo Service con campos adicionales para paginas individuales. Crear seed data completo con informacion real del CV.

---

## GraphQL Schema Completo

### Types Nuevos

```graphql
# ============================================
# COMPANIES
# ============================================

type Company {
  id: ID!
  name: String!
  logoUrl: String
  description: String
  website: String
  role: String
  period: String
  highlights: [String!]
  order: Int!
  isVisible: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!
}

input CreateCompanyInput {
  name: String!
  logoUrl: String
  description: String
  website: String
  role: String
  period: String
  highlights: [String!]
  order: Int
  isVisible: Boolean
}

input UpdateCompanyInput {
  name: String
  logoUrl: String
  description: String
  website: String
  role: String
  period: String
  highlights: [String!]
  order: Int
  isVisible: Boolean
}

input CompanyWhereInput {
  isVisible: Boolean
}

# ============================================
# CERTIFICATIONS
# ============================================

type Certification {
  id: ID!
  title: String!
  provider: String!
  credentialUrl: String
  badgeUrl: String
  issueDate: DateTime
  skills: [String!]
  order: Int!
  isVisible: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!
}

input CreateCertificationInput {
  title: String!
  provider: String!
  credentialUrl: String
  badgeUrl: String
  issueDate: DateTime
  skills: [String!]
  order: Int
  isVisible: Boolean
}

input UpdateCertificationInput {
  title: String
  provider: String
  credentialUrl: String
  badgeUrl: String
  issueDate: DateTime
  skills: [String!]
  order: Int
  isVisible: Boolean
}

input CertificationWhereInput {
  isVisible: Boolean
}

# ============================================
# PAGES
# ============================================

type Page {
  id: ID!
  slug: String!
  title: String!
  content: String!
  seoMetadata: JSON
  isPublished: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!
}

input CreatePageInput {
  slug: String!
  title: String!
  content: String!
  seoMetadata: JSON
  isPublished: Boolean
}

input UpdatePageInput {
  slug: String
  title: String
  content: String
  seoMetadata: JSON
  isPublished: Boolean
}

# ============================================
# FAQs
# ============================================

type FAQ {
  id: ID!
  question: String!
  answer: String!
  category: String
  order: Int!
  isVisible: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!
}

input CreateFAQInput {
  question: String!
  answer: String!
  category: String
  order: Int
  isVisible: Boolean
}

input UpdateFAQInput {
  question: String
  answer: String
  category: String
  order: Int
  isVisible: Boolean
}

input FAQWhereInput {
  isVisible: Boolean
  category: String
}

# ============================================
# SITE SETTINGS
# ============================================

type SiteSetting {
  id: ID!
  key: String!
  value: JSON!
  createdAt: DateTime!
  updatedAt: DateTime!
}

# ============================================
# EXTENDED SERVICE
# ============================================

# Estos campos se agregan al Service existente
extend type Service {
  features: [String!]
  longDescription: String
  benefits: JSON
  priceRange: String
  timeline: String
}

# Actualizar CreateServiceInput
input CreateServiceInput {
  # ... campos existentes ...
  features: [String!]
  longDescription: String
  benefits: JSON
  priceRange: String
  timeline: String
}

# ============================================
# QUERIES
# ============================================

extend type Query {
  # Companies - Publico
  companies(where: CompanyWhereInput): [Company!]!
  company(id: ID!): Company

  # Certifications - Publico
  certifications(where: CertificationWhereInput): [Certification!]!
  certification(id: ID!): Certification

  # Pages - Publico (solo published)
  pageBySlug(slug: String!): Page

  # FAQs - Publico
  faqs(where: FAQWhereInput): [FAQ!]!
  faq(id: ID!): FAQ

  # Settings - Publico (para ciertos keys)
  getSetting(key: String!): SiteSetting
}

# ============================================
# MUTATIONS
# ============================================

extend type Mutation {
  # Companies - Admin
  createCompany(input: CreateCompanyInput!): Company!
  updateCompany(id: ID!, input: UpdateCompanyInput!): Company!
  deleteCompany(id: ID!): Company!

  # Certifications - Admin
  createCertification(input: CreateCertificationInput!): Certification!
  updateCertification(id: ID!, input: UpdateCertificationInput!): Certification!
  deleteCertification(id: ID!): Certification!

  # Pages - Admin
  createPage(input: CreatePageInput!): Page!
  updatePage(id: ID!, input: UpdatePageInput!): Page!
  deletePage(id: ID!): Page!

  # FAQs - Admin
  createFAQ(input: CreateFAQInput!): FAQ!
  updateFAQ(id: ID!, input: UpdateFAQInput!): FAQ!
  deleteFAQ(id: ID!): FAQ!

  # Settings - Admin
  setSetting(key: String!, value: JSON!): SiteSetting!
  deleteSetting(key: String!): SiteSetting!
}
```

---

## Orden de Implementacion

### Tarea 1.1: Actualizar Schema Prisma

**Objetivo:** Agregar modelos faltantes al schema.

**Archivo:** `backend/prisma/schema.prisma`

**Cambios:**

```prisma
// Agregar despues del modelo Lead existente

model Company {
  id          String   @id @default(cuid())
  name        String
  logoUrl     String?  @map("logo_url")
  description String?
  website     String?
  role        String?
  period      String?
  highlights  String[] @default([])
  order       Int      @default(0)
  isVisible   Boolean  @default(true) @map("is_visible")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@map("companies")
}

model Certification {
  id            String    @id @default(cuid())
  title         String
  provider      String
  credentialUrl String?   @map("credential_url")
  badgeUrl      String?   @map("badge_url")
  issueDate     DateTime? @map("issue_date")
  skills        String[]  @default([])
  order         Int       @default(0)
  isVisible     Boolean   @default(true) @map("is_visible")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  @@map("certifications")
}

model Page {
  id          String   @id @default(cuid())
  slug        String   @unique
  title       String
  content     String   @db.Text
  seoMetadata Json?    @map("seo_metadata")
  isPublished Boolean  @default(false) @map("is_published")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@map("pages")
}

model FAQ {
  id        String   @id @default(cuid())
  question  String
  answer    String   @db.Text
  category  String?
  order     Int      @default(0)
  isVisible Boolean  @default(true) @map("is_visible")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("faqs")
}

model SiteSetting {
  id        String   @id @default(cuid())
  key       String   @unique
  value     Json
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("site_settings")
}

// Actualizar modelo Service existente
model Service {
  id              String   @id @default(cuid())
  name            String
  slug            String   @unique
  description     String   @db.Text
  longDescription String?  @map("long_description") @db.Text
  icon            String?
  features        String[] @default([])
  benefits        Json?
  priceRange      String?  @map("price_range")
  timeline        String?
  order           Int      @default(0)
  isActive        Boolean  @default(true) @map("is_active")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  @@map("services")
}
```

**Comandos a ejecutar:**

```bash
cd backend
npx prisma generate
npx prisma db push
```

**Criterios de aceptacion:**
- [ ] Schema actualizado sin errores
- [ ] Prisma generate exitoso
- [ ] Tablas creadas en PostgreSQL

---

### Tarea 1.2: Implementar Companies Module

**Objetivo:** CRUD completo para empresas/clientes.

**Estructura de archivos:**

```
backend/src/modules/companies/
├── companies.module.ts
├── companies.resolver.ts
├── companies.service.ts
├── companies.service.spec.ts
├── entities/
│   └── company.entity.ts
└── dto/
    ├── create-company.input.ts
    ├── update-company.input.ts
    └── company-where.input.ts
```

**Implementacion:**

```typescript
// entities/company.entity.ts
import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class Company {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  logoUrl?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  website?: string;

  @Field({ nullable: true })
  role?: string;

  @Field({ nullable: true })
  period?: string;

  @Field(() => [String], { defaultValue: [] })
  highlights: string[];

  @Field(() => Int)
  order: number;

  @Field()
  isVisible: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
```

```typescript
// dto/create-company.input.ts
import { InputType, Field, Int } from '@nestjs/graphql';
import { IsString, IsUrl, IsOptional, IsBoolean, IsInt, IsArray, MinLength } from 'class-validator';

@InputType()
export class CreateCompanyInput {
  @Field()
  @IsString()
  @MinLength(2)
  name: string;

  @Field({ nullable: true })
  @IsUrl()
  @IsOptional()
  logoUrl?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field({ nullable: true })
  @IsUrl()
  @IsOptional()
  website?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  role?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  period?: string;

  @Field(() => [String], { nullable: true, defaultValue: [] })
  @IsArray()
  @IsOptional()
  highlights?: string[];

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  @IsInt()
  @IsOptional()
  order?: number;

  @Field({ nullable: true, defaultValue: true })
  @IsBoolean()
  @IsOptional()
  isVisible?: boolean;
}
```

```typescript
// companies.service.ts
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCompanyInput } from './dto/create-company.input';
import { UpdateCompanyInput } from './dto/update-company.input';
import { CompanyWhereInput } from './dto/company-where.input';

@Injectable()
export class CompaniesService {
  private readonly logger = new Logger(CompaniesService.name);

  constructor(private prisma: PrismaService) {}

  async findAll(where?: CompanyWhereInput) {
    return this.prisma.company.findMany({
      where: where ? { isVisible: where.isVisible } : undefined,
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.company.findUnique({ where: { id } });
  }

  async create(input: CreateCompanyInput) {
    this.logger.log(`Creating company: ${input.name}`);
    return this.prisma.company.create({ data: input });
  }

  async update(id: string, input: UpdateCompanyInput) {
    const company = await this.prisma.company.findUnique({ where: { id } });
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    return this.prisma.company.update({
      where: { id },
      data: input,
    });
  }

  async delete(id: string) {
    const company = await this.prisma.company.findUnique({ where: { id } });
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    return this.prisma.company.delete({ where: { id } });
  }
}
```

```typescript
// companies.resolver.ts
import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { CompaniesService } from './companies.service';
import { Company } from './entities/company.entity';
import { CreateCompanyInput } from './dto/create-company.input';
import { UpdateCompanyInput } from './dto/update-company.input';
import { CompanyWhereInput } from './dto/company-where.input';
import { Public } from '../../common/decorators/public.decorator';

@Resolver(() => Company)
export class CompaniesResolver {
  constructor(private readonly companiesService: CompaniesService) {}

  @Public()
  @Query(() => [Company])
  async companies(
    @Args('where', { nullable: true }) where?: CompanyWhereInput,
  ) {
    return this.companiesService.findAll(where);
  }

  @Public()
  @Query(() => Company, { nullable: true })
  async company(@Args('id', { type: () => ID }) id: string) {
    return this.companiesService.findOne(id);
  }

  @Mutation(() => Company)
  async createCompany(@Args('input') input: CreateCompanyInput) {
    return this.companiesService.create(input);
  }

  @Mutation(() => Company)
  async updateCompany(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateCompanyInput,
  ) {
    return this.companiesService.update(id, input);
  }

  @Mutation(() => Company)
  async deleteCompany(@Args('id', { type: () => ID }) id: string) {
    return this.companiesService.delete(id);
  }
}
```

**Criterios de aceptacion:**
- [ ] Query `companies` retorna lista de empresas visibles
- [ ] Query `company(id)` retorna empresa por ID
- [ ] Mutation `createCompany` crea empresa (requiere auth)
- [ ] Mutation `updateCompany` actualiza empresa (requiere auth)
- [ ] Mutation `deleteCompany` elimina empresa (requiere auth)

---

### Tarea 1.3: Implementar Certifications Module

**Objetivo:** CRUD completo para certificaciones.

**Estructura de archivos:**

```
backend/src/modules/certifications/
├── certifications.module.ts
├── certifications.resolver.ts
├── certifications.service.ts
├── certifications.service.spec.ts
├── entities/
│   └── certification.entity.ts
└── dto/
    ├── create-certification.input.ts
    ├── update-certification.input.ts
    └── certification-where.input.ts
```

**Implementacion similar a Companies:**

```typescript
// entities/certification.entity.ts
import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class Certification {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  provider: string;

  @Field({ nullable: true })
  credentialUrl?: string;

  @Field({ nullable: true })
  badgeUrl?: string;

  @Field({ nullable: true })
  issueDate?: Date;

  @Field(() => [String], { defaultValue: [] })
  skills: string[];

  @Field(() => Int)
  order: number;

  @Field()
  isVisible: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
```

**Criterios de aceptacion:**
- [ ] Query `certifications` retorna lista visible
- [ ] Query `certification(id)` retorna por ID
- [ ] Mutations protegidas funcionan

---

### Tarea 1.4: Implementar Pages Module

**Objetivo:** CRUD para paginas de contenido.

**Estructura de archivos:**

```
backend/src/modules/pages/
├── pages.module.ts
├── pages.resolver.ts
├── pages.service.ts
├── pages.service.spec.ts
├── entities/
│   └── page.entity.ts
└── dto/
    ├── create-page.input.ts
    └── update-page.input.ts
```

**Nota especial:** El query `pageBySlug` debe:
- Retornar solo paginas con `isPublished: true` para usuarios no autenticados
- Retornar cualquier pagina para admins

```typescript
// pages.service.ts
async findBySlug(slug: string, isAdmin = false) {
  const page = await this.prisma.page.findUnique({ where: { slug } });

  if (!page) return null;

  // Si no es admin, solo retornar si esta publicada
  if (!isAdmin && !page.isPublished) {
    return null;
  }

  return page;
}
```

**Criterios de aceptacion:**
- [ ] Query `pageBySlug` retorna solo publicadas para publico
- [ ] Mutations protegidas para CRUD

---

### Tarea 1.5: Implementar FAQs Module

**Objetivo:** CRUD para preguntas frecuentes.

**Estructura de archivos:**

```
backend/src/modules/faqs/
├── faqs.module.ts
├── faqs.resolver.ts
├── faqs.service.ts
├── faqs.service.spec.ts
├── entities/
│   └── faq.entity.ts
└── dto/
    ├── create-faq.input.ts
    ├── update-faq.input.ts
    └── faq-where.input.ts
```

**Filtros adicionales:**

```typescript
// faq-where.input.ts
@InputType()
export class FAQWhereInput {
  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isVisible?: boolean;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  category?: string;
}
```

**Criterios de aceptacion:**
- [ ] Query `faqs` soporta filtro por categoria
- [ ] FAQs ordenados por `order`

---

### Tarea 1.6: Implementar SiteSettings Module

**Objetivo:** Key-value store para configuracion del sitio.

**Estructura de archivos:**

```
backend/src/modules/settings/
├── settings.module.ts
├── settings.resolver.ts
├── settings.service.ts
├── settings.service.spec.ts
└── entities/
    └── site-setting.entity.ts
```

**Implementacion:**

```typescript
// settings.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(private prisma: PrismaService) {}

  async get(key: string) {
    return this.prisma.siteSetting.findUnique({ where: { key } });
  }

  async set(key: string, value: any) {
    return this.prisma.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  async delete(key: string) {
    return this.prisma.siteSetting.delete({ where: { key } });
  }

  async getAll() {
    return this.prisma.siteSetting.findMany();
  }
}
```

```typescript
// settings.resolver.ts
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { SettingsService } from './settings.service';
import { SiteSetting } from './entities/site-setting.entity';
import { Public } from '../../common/decorators/public.decorator';
import { GraphQLJSON } from 'graphql-scalars';

@Resolver(() => SiteSetting)
export class SettingsResolver {
  constructor(private readonly settingsService: SettingsService) {}

  @Public()
  @Query(() => SiteSetting, { nullable: true })
  async getSetting(@Args('key') key: string) {
    return this.settingsService.get(key);
  }

  @Mutation(() => SiteSetting)
  async setSetting(
    @Args('key') key: string,
    @Args('value', { type: () => GraphQLJSON }) value: any,
  ) {
    return this.settingsService.set(key, value);
  }

  @Mutation(() => SiteSetting)
  async deleteSetting(@Args('key') key: string) {
    return this.settingsService.delete(key);
  }
}
```

**Criterios de aceptacion:**
- [ ] Query `getSetting(key)` funciona publicamente
- [ ] Mutation `setSetting` solo para admins
- [ ] Value es JSON flexible

---

### Tarea 1.7: Extender Service Entity

**Objetivo:** Agregar campos para paginas de servicio individuales.

**Archivos a modificar:**

1. `backend/src/modules/services/entities/service.entity.ts`
2. `backend/src/modules/services/dto/create-service.input.ts`
3. `backend/src/modules/services/dto/update-service.input.ts`

**Cambios en entity:**

```typescript
// entities/service.entity.ts
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
  longDescription?: string;

  @Field({ nullable: true })
  icon?: string;

  @Field(() => [String], { defaultValue: [] })
  features: string[];

  @Field(() => GraphQLJSON, { nullable: true })
  benefits?: any;

  @Field({ nullable: true })
  priceRange?: string;

  @Field({ nullable: true })
  timeline?: string;

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

**Cambios en DTOs:**

```typescript
// dto/create-service.input.ts - agregar campos
@Field({ nullable: true })
@IsString()
@IsOptional()
longDescription?: string;

@Field(() => [String], { nullable: true, defaultValue: [] })
@IsArray()
@IsOptional()
features?: string[];

@Field(() => GraphQLJSON, { nullable: true })
@IsOptional()
benefits?: any;

@Field({ nullable: true })
@IsString()
@IsOptional()
priceRange?: string;

@Field({ nullable: true })
@IsString()
@IsOptional()
timeline?: string;
```

**Criterios de aceptacion:**
- [ ] Service tiene campos nuevos en GraphQL
- [ ] CRUD funciona con campos nuevos
- [ ] Campos opcionales no rompen servicios existentes

---

### Tarea 1.8: Seed Data

**Objetivo:** Crear datos iniciales reales del CV.

**Archivo:** `backend/prisma/seed.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // =====================================
  // COMPANIES
  // =====================================
  const companies = [
    {
      name: 'PayPal (Venmo)',
      logoUrl: '/logos/paypal.svg',
      description: 'Leading digital payments platform',
      website: 'https://venmo.com',
      role: 'Senior iOS Developer',
      period: '2023 - Present',
      highlights: [
        'Led feature development for Venmo mobile app with 80M+ users',
        'Implemented SwiftUI components improving development velocity by 40%',
        'Architected modular navigation system reducing coupling',
        'Mentored junior developers on iOS best practices',
      ],
      order: 1,
      isVisible: true,
    },
    {
      name: 'SmartJob',
      logoUrl: '/logos/smartjob.svg',
      description: 'AI-powered recruitment platform',
      website: 'https://smartjob.com',
      role: 'iOS Developer',
      period: '2022 - 2023',
      highlights: [
        'Built real-time job matching algorithm integration',
        'Developed push notification system with 95% delivery rate',
        'Implemented offline-first architecture using Core Data',
      ],
      order: 2,
      isVisible: true,
    },
    {
      name: 'Kubikware',
      logoUrl: '/logos/kubikware.svg',
      description: 'IoT solutions for smart homes',
      website: 'https://kubikware.com',
      role: 'iOS Developer',
      period: '2021 - 2022',
      highlights: [
        'Created IoT control interfaces for smart home devices',
        'Implemented Bluetooth LE connectivity layer',
        'Developed custom animations for device controls',
      ],
      order: 3,
      isVisible: true,
    },
    {
      name: 'PedidosYa',
      logoUrl: '/logos/pedidosya.svg',
      description: 'Latin America\'s largest food delivery platform',
      website: 'https://pedidosya.com',
      role: 'iOS Developer',
      period: '2019 - 2021',
      highlights: [
        'Contributed to core delivery app serving 20M+ users',
        'Implemented real-time order tracking with MapKit',
        'Optimized app launch time by 30%',
      ],
      order: 4,
      isVisible: true,
    },
    {
      name: 'Lipo (Warao Technologies)',
      logoUrl: '/logos/lipo.svg',
      description: 'Fintech startup focused on digital payments',
      website: null,
      role: 'Junior iOS Developer',
      period: '2017 - 2019',
      highlights: [
        'First professional iOS development role',
        'Built secure payment features with biometric auth',
        'Learned MVVM architecture and unit testing',
      ],
      order: 5,
      isVisible: true,
    },
  ];

  for (const company of companies) {
    await prisma.company.upsert({
      where: { id: company.name.toLowerCase().replace(/[^a-z0-9]/g, '-') },
      update: company,
      create: {
        id: company.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        ...company,
      },
    });
  }
  console.log('Companies seeded');

  // =====================================
  // CERTIFICATIONS
  // =====================================
  const certifications = [
    {
      title: 'Full-Stack E-Commerce with SwiftUI, Node.js & PostgreSQL',
      provider: 'Udemy',
      credentialUrl: null,
      badgeUrl: '/badges/ecommerce.png',
      issueDate: new Date('2024-06-01'),
      skills: ['SwiftUI', 'Node.js', 'PostgreSQL', 'REST API', 'Stripe'],
      order: 1,
      isVisible: true,
    },
    {
      title: 'NestJS: The Complete Developer\'s Guide',
      provider: 'Udemy',
      credentialUrl: null,
      badgeUrl: '/badges/nestjs.png',
      issueDate: new Date('2024-03-01'),
      skills: ['NestJS', 'TypeScript', 'GraphQL', 'PostgreSQL', 'Docker'],
      order: 2,
      isVisible: true,
    },
    {
      title: 'Next.js & React - The Complete Guide',
      provider: 'Udemy',
      credentialUrl: null,
      badgeUrl: '/badges/nextjs.png',
      issueDate: new Date('2024-01-01'),
      skills: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Vercel'],
      order: 3,
      isVisible: true,
    },
    {
      title: 'iOS & Swift - Testing Best Practices',
      provider: 'Essential Developer',
      credentialUrl: null,
      badgeUrl: '/badges/testing.png',
      issueDate: new Date('2023-09-01'),
      skills: ['XCTest', 'TDD', 'Swift', 'UI Testing', 'Mocking'],
      order: 4,
      isVisible: true,
    },
    {
      title: 'Python Programming Fundamentals',
      provider: 'In Progress',
      credentialUrl: null,
      badgeUrl: '/badges/python.png',
      issueDate: null,
      skills: ['Python', 'Data Structures', 'Algorithms'],
      order: 5,
      isVisible: true,
    },
    {
      title: 'Large Language Models (LLMs)',
      provider: 'In Progress',
      credentialUrl: null,
      badgeUrl: '/badges/llm.png',
      issueDate: null,
      skills: ['LLMs', 'Prompt Engineering', 'AI Integration'],
      order: 6,
      isVisible: true,
    },
  ];

  for (const cert of certifications) {
    await prisma.certification.upsert({
      where: { id: cert.title.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 50) },
      update: cert,
      create: {
        id: cert.title.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 50),
        ...cert,
      },
    });
  }
  console.log('Certifications seeded');

  // =====================================
  // SERVICES
  // =====================================
  const services = [
    {
      name: 'MVP Development',
      slug: 'mvp-development',
      description: 'Launch your product idea fast with a production-ready MVP that validates your business hypothesis.',
      longDescription: `
Transform your idea into a working product in weeks, not months. Our MVP development
process focuses on identifying and building the core features that will validate your
business hypothesis while laying a solid foundation for future growth.

We use modern technologies like Next.js, NestJS, and PostgreSQL to ensure your MVP
is not just a prototype, but a production-ready application that can scale with your business.
      `.trim(),
      icon: 'rocket',
      features: [
        'User authentication & onboarding flows',
        'Core business logic implementation',
        'Payment integration (Stripe)',
        'Admin dashboard for operations',
        'Analytics & tracking setup',
        'Responsive design for all devices',
      ],
      benefits: [
        { title: 'Fast to Market', description: '4-8 weeks from idea to launch', icon: 'clock' },
        { title: 'Scalable Foundation', description: 'Built with growth in mind', icon: 'trending-up' },
        { title: 'Full Ownership', description: 'Complete source code & documentation', icon: 'shield' },
        { title: 'Ongoing Support', description: '30 days of bug fixes included', icon: 'headphones' },
      ],
      priceRange: '$8,000 - $25,000',
      timeline: '4-8 weeks',
      order: 1,
      isActive: true,
    },
    {
      name: 'Web Applications',
      slug: 'web-applications',
      description: 'Custom web applications built with modern technologies for optimal performance and maintainability.',
      longDescription: `
From complex dashboards to customer-facing platforms, we build web applications
that are fast, secure, and maintainable. Using Next.js, React, and TypeScript
ensures the best developer experience and long-term code quality.

Every application is built with SEO in mind, includes proper authentication
and authorization, and follows accessibility best practices.
      `.trim(),
      icon: 'globe',
      features: [
        'Server-side rendering for SEO',
        'Real-time features with WebSockets',
        'Third-party API integrations',
        'Role-based access control',
        'Mobile-responsive design',
        'Performance optimization',
      ],
      benefits: [
        { title: 'SEO Optimized', description: 'Server-rendered for search engines', icon: 'search' },
        { title: 'Fast & Secure', description: 'Enterprise-grade security', icon: 'lock' },
        { title: 'Maintainable', description: 'Clean, documented code', icon: 'code' },
      ],
      priceRange: '$15,000 - $50,000',
      timeline: '6-12 weeks',
      order: 2,
      isActive: true,
    },
    {
      name: 'Mobile Apps',
      slug: 'mobile-apps',
      description: 'Native iOS apps with exceptional user experience, built by a developer with 6+ years of iOS experience.',
      longDescription: `
Leverage our extensive iOS development experience from companies like PayPal,
PedidosYa, and more. We build native Swift applications that follow Apple's
Human Interface Guidelines and deliver delightful user experiences.

Our apps are built for performance, accessibility, and long-term maintainability
using modern architectures like MVVM and SwiftUI.
      `.trim(),
      icon: 'smartphone',
      features: [
        'Native Swift/SwiftUI development',
        'App Store optimization & submission',
        'Push notifications setup',
        'In-app purchases integration',
        'Analytics and crash reporting',
        'Offline-first capabilities',
      ],
      benefits: [
        { title: '6+ Years Experience', description: 'Proven track record', icon: 'award' },
        { title: 'Native Performance', description: 'No compromise on quality', icon: 'zap' },
        { title: 'App Store Ready', description: 'We handle the submission', icon: 'check-circle' },
      ],
      priceRange: '$20,000 - $60,000',
      timeline: '8-16 weeks',
      order: 3,
      isActive: true,
    },
    {
      name: 'Business Automation',
      slug: 'business-automation',
      description: 'Automate repetitive workflows and save hours every week with custom n8n automations.',
      longDescription: `
We identify repetitive processes in your business and automate them using n8n,
custom scripts, and API integrations. Free your team to focus on high-value
work while automations handle the routine tasks.

From lead capture to customer onboarding to internal reporting, we can
automate almost any business process.
      `.trim(),
      icon: 'zap',
      features: [
        'Workflow analysis & mapping',
        'n8n automation setup',
        'API integrations (CRM, Email, etc.)',
        'Slack/Email notifications',
        'Data synchronization',
        'Custom webhooks',
      ],
      benefits: [
        { title: 'Save Time', description: '10+ hours per week automated', icon: 'clock' },
        { title: 'Reduce Errors', description: 'Consistent, reliable processes', icon: 'check-square' },
        { title: 'Easy to Modify', description: 'Visual workflow builder', icon: 'edit' },
      ],
      priceRange: '$2,000 - $10,000',
      timeline: '1-4 weeks',
      order: 4,
      isActive: true,
    },
    {
      name: 'Consulting',
      slug: 'consulting',
      description: 'Technical consulting and architecture reviews from an experienced senior developer.',
      longDescription: `
Get expert advice on your technical challenges. Whether you need an architecture
review, help with hiring developers, or guidance on technology choices, I can help.

With experience from PayPal, PedidosYa, and multiple startups, I've seen what
works and what doesn't in both enterprise and startup environments.
      `.trim(),
      icon: 'users',
      features: [
        'Architecture review & recommendations',
        'Technology stack selection',
        'Code review & best practices',
        'Team structure & hiring advice',
        'Process improvement',
        'Technical due diligence',
      ],
      benefits: [
        { title: 'Senior Expertise', description: 'Enterprise & startup experience', icon: 'briefcase' },
        { title: 'Actionable Advice', description: 'Clear recommendations', icon: 'target' },
        { title: 'Flexible Engagement', description: 'Hourly or project-based', icon: 'calendar' },
      ],
      priceRange: '$150 - $250/hour',
      timeline: 'Flexible',
      order: 5,
      isActive: true,
    },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: service,
      create: service,
    });
  }
  console.log('Services seeded');

  // =====================================
  // FAQs
  // =====================================
  const faqs = [
    {
      question: 'What is your development process?',
      answer: 'I follow an agile approach with weekly sprints and regular check-ins. We start with a discovery phase to understand your requirements, then move to design, development, and testing. You\'ll have visibility into progress throughout the project.',
      category: 'process',
      order: 1,
      isVisible: true,
    },
    {
      question: 'How long does a typical project take?',
      answer: 'It depends on the scope. An MVP typically takes 4-8 weeks, a full web application 6-12 weeks, and a native iOS app 8-16 weeks. I\'ll provide a detailed timeline during our initial consultation.',
      category: 'process',
      order: 2,
      isVisible: true,
    },
    {
      question: 'What technologies do you use?',
      answer: 'For web development: Next.js, React, TypeScript, NestJS, PostgreSQL, and Tailwind CSS. For mobile: Native Swift and SwiftUI. For automation: n8n and custom Node.js scripts.',
      category: 'technical',
      order: 3,
      isVisible: true,
    },
    {
      question: 'Do you provide ongoing support?',
      answer: 'Yes, all projects include 30 days of bug fixes after launch. For ongoing support and maintenance, I offer monthly retainer packages tailored to your needs.',
      category: 'support',
      order: 4,
      isVisible: true,
    },
    {
      question: 'What are your payment terms?',
      answer: 'Typically 30% upfront, 30% at midpoint, and 40% on completion. For smaller projects, it may be 50% upfront and 50% on completion. Payment via bank transfer or Stripe.',
      category: 'pricing',
      order: 5,
      isVisible: true,
    },
    {
      question: 'Can you work with my existing team?',
      answer: 'Absolutely. I can integrate with your existing development team, participate in code reviews, and help mentor junior developers. Clear communication and documentation are always priorities.',
      category: 'collaboration',
      order: 6,
      isVisible: true,
    },
  ];

  for (const faq of faqs) {
    await prisma.fAQ.upsert({
      where: { id: faq.question.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 50) },
      update: faq,
      create: {
        id: faq.question.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 50),
        ...faq,
      },
    });
  }
  console.log('FAQs seeded');

  // =====================================
  // SITE SETTINGS
  // =====================================
  const settings = [
    {
      key: 'site_title',
      value: 'Manuel Alvarez | Senior iOS Developer & Web Consultant',
    },
    {
      key: 'site_description',
      value: 'Expert development studio specializing in MVPs, web applications, mobile apps, and business automation.',
    },
    {
      key: 'contact_email',
      value: 'hello@manuelalvarez.cloud',
    },
    {
      key: 'social_links',
      value: {
        github: 'https://github.com/manuelalvarez',
        linkedin: 'https://linkedin.com/in/manuelalvarez',
        twitter: 'https://twitter.com/manuelalvarez',
      },
    },
    {
      key: 'hero_content',
      value: {
        headline: 'Build digital products that drive business growth',
        subheadline: 'Expert development studio specializing in MVPs, web applications, and business automation.',
        cta_primary: 'Start your project',
        cta_secondary: 'View services',
      },
    },
  ];

  for (const setting of settings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: setting,
      create: setting,
    });
  }
  console.log('Settings seeded');

  console.log('Database seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Agregar script a package.json:**

```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

**Ejecutar seed:**

```bash
npx prisma db seed
```

**Criterios de aceptacion:**
- [ ] Seed ejecuta sin errores
- [ ] Datos visibles en Prisma Studio
- [ ] Queries GraphQL retornan datos seeded

---

### Tarea 1.9: Tests

**Objetivo:** Unit tests y E2E tests para nuevos modulos.

#### Unit Tests

```typescript
// src/modules/companies/companies.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesService } from './companies.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('CompaniesService', () => {
  let service: CompaniesService;
  let prisma: PrismaService;

  const mockPrisma = {
    company: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompaniesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CompaniesService>(CompaniesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all companies when no filter', async () => {
      const companies = [{ id: '1', name: 'Test' }];
      mockPrisma.company.findMany.mockResolvedValue(companies);

      const result = await service.findAll();

      expect(result).toEqual(companies);
      expect(mockPrisma.company.findMany).toHaveBeenCalledWith({
        where: undefined,
        orderBy: { order: 'asc' },
      });
    });

    it('should return only visible companies when filtered', async () => {
      const companies = [{ id: '1', name: 'Test', isVisible: true }];
      mockPrisma.company.findMany.mockResolvedValue(companies);

      const result = await service.findAll({ isVisible: true });

      expect(result).toEqual(companies);
      expect(mockPrisma.company.findMany).toHaveBeenCalledWith({
        where: { isVisible: true },
        orderBy: { order: 'asc' },
      });
    });
  });

  describe('create', () => {
    it('should create a new company', async () => {
      const input = { name: 'New Company' };
      const created = { id: '1', ...input };
      mockPrisma.company.create.mockResolvedValue(created);

      const result = await service.create(input);

      expect(result).toEqual(created);
    });
  });

  describe('update', () => {
    it('should throw NotFoundException when company not found', async () => {
      mockPrisma.company.findUnique.mockResolvedValue(null);

      await expect(service.update('999', { name: 'Updated' }))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should throw NotFoundException when company not found', async () => {
      mockPrisma.company.findUnique.mockResolvedValue(null);

      await expect(service.delete('999'))
        .rejects.toThrow(NotFoundException);
    });
  });
});
```

#### E2E Tests

```typescript
// test/companies.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Companies (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Query companies', () => {
    it('should return companies without auth (public)', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            query {
              companies {
                id
                name
                role
                period
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.companies).toBeDefined();
          expect(Array.isArray(res.body.data.companies)).toBe(true);
        });
    });

    it('should filter by isVisible', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            query {
              companies(where: { isVisible: true }) {
                id
                isVisible
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          res.body.data.companies.forEach((company: any) => {
            expect(company.isVisible).toBe(true);
          });
        });
    });
  });

  describe('Mutation createCompany', () => {
    it('should fail without auth', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation {
              createCompany(input: { name: "Test" }) {
                id
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.errors).toBeDefined();
          expect(res.body.errors[0].message).toContain('Unauthorized');
        });
    });
  });
});
```

**Criterios de aceptacion:**
- [ ] Unit tests pasan con `npm run test`
- [ ] E2E tests pasan con `npm run test:e2e`
- [ ] Coverage > 80% en services

---

## Registrar Nuevos Modulos en app.module.ts

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
// ... existing imports ...
import { CompaniesModule } from './modules/companies/companies.module';
import { CertificationsModule } from './modules/certifications/certifications.module';
import { PagesModule } from './modules/pages/pages.module';
import { FAQsModule } from './modules/faqs/faqs.module';
import { SettingsModule } from './modules/settings/settings.module';

@Module({
  imports: [
    // ... existing imports ...
    CompaniesModule,
    CertificationsModule,
    PagesModule,
    FAQsModule,
    SettingsModule,
  ],
  // ...
})
export class AppModule {}
```

---

## Checklist Final Backend

- [ ] Schema Prisma actualizado con 5 nuevos modelos
- [ ] Migrations aplicadas a PostgreSQL
- [ ] CompaniesModule implementado y testeado
- [ ] CertificationsModule implementado y testeado
- [ ] PagesModule implementado y testeado
- [ ] FAQsModule implementado y testeado
- [ ] SettingsModule implementado y testeado
- [ ] Service entity extendida con campos nuevos
- [ ] Seed data ejecutado con datos del CV
- [ ] Unit tests pasan (>80% coverage)
- [ ] E2E tests pasan
- [ ] GraphQL Playground muestra todos los types nuevos
- [ ] Queries publicas funcionan sin auth
- [ ] Mutations protegidas requieren auth

---

## Comandos de Verificacion

```bash
# Aplicar schema
cd backend
npx prisma generate
npx prisma db push

# Ejecutar seed
npx prisma db seed

# Verificar en Prisma Studio
npx prisma studio

# Tests
npm run test
npm run test:e2e
npm run test:cov

# Desarrollo
npm run start:dev
# Ir a http://localhost:4000/graphql
```
