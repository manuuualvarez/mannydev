# Spec 05a: Backend - Service Pricing Support

**Estado:** PENDIENTE
**Agente:** backend-dev
**Dependencias:** Ninguna

---

## Tareas

### 1. Agregar campo `startingPrice` al schema Prisma

**Archivo:** `backend/prisma/schema.prisma`

Agregar al modelo Service:
```prisma
startingPrice Int? @map("starting_price")
```

Luego ejecutar:
```bash
cd backend && npx prisma generate && npx prisma db push
```

### 2. Actualizar Entity GraphQL

**Archivo:** `backend/src/modules/services/entities/service.entity.ts`

Agregar:
```typescript
@Field(() => Int, { nullable: true })
startingPrice?: number;
```

### 3. Actualizar DTOs

**Archivo:** `backend/src/modules/services/dto/create-service.input.ts`
```typescript
@Field(() => Int, { nullable: true })
@IsInt()
@Min(0)
@IsOptional()
startingPrice?: number;
```

**Archivo:** `backend/src/modules/services/dto/update-service.input.ts`
```typescript
@Field(() => Int, { nullable: true })
@IsInt()
@Min(0)
@IsOptional()
startingPrice?: number;
```

---

## Tests TDD (Given/When/Then)

### Test 1: Service entity has startingPrice field
- **Given:** Service GraphQL type
- **When:** Checking field metadata
- **Then:** `startingPrice` exists as nullable Int

### Test 2: Create service with pricing
- **Given:** CreateServiceInput with `startingPrice: 29900`
- **When:** Calling `servicesService.create(input)`
- **Then:** Created service has `startingPrice: 29900`

### Test 3: Update service pricing
- **Given:** An existing service
- **When:** Calling `servicesService.update(id, { startingPrice: 49900 })`
- **Then:** Updated service has `startingPrice: 49900`

### Test 4: Query returns pricing
- **Given:** Services with pricing in DB
- **When:** Calling `servicesService.findAll()`
- **Then:** Response includes `startingPrice` field

### Test 5: Create service without pricing (nullable)
- **Given:** CreateServiceInput without `startingPrice`
- **When:** Calling `servicesService.create(input)`
- **Then:** Created service has `startingPrice: null`

---

## Validaciones Post-Implementacion

- [ ] `npm run build` exitoso
- [ ] `npm run test` - todos los tests pasan
- [ ] GraphQL Playground muestra `startingPrice` en type Service
- [ ] Prisma schema actualizado con `db push`
