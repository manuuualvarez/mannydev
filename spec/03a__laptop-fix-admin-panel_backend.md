# Spec: MacBook Fix + Admin Panel - Backend Tasks

**Estado:** PENDIENTE
**Fecha:** 2026-02-04
**Agente:** backend-dev
**Dependencia:** Ninguna (puede ejecutarse en paralelo con frontend Fase 1)

---

## Resumen

El backend ya tiene la mayoría de funcionalidades implementadas. Esta fase se enfoca en:

1. Verificar y mejorar la validación de roles en ClerkAuthGuard
2. Agregar query `me` para obtener info del usuario autenticado
3. Asegurar que todas las mutations admin requieren rol admin

---

## Tareas

### Tarea 1: Verificar ClerkAuthGuard valida roles

**Archivo:** `backend/src/common/guards/clerk-auth.guard.ts`

**Requisitos:**
- El guard debe verificar no solo que el JWT es válido, sino también el rol
- Para mutations marcadas con `@Roles('admin')`, verificar `publicMetadata.role`
- Retornar 403 Forbidden si el rol no coincide

**Test Cases:**
```typescript
// backend/src/common/guards/clerk-auth.guard.spec.ts

describe('ClerkAuthGuard', () => {
  describe('Role validation', () => {
    it('should allow access when no role is required', async () => {
      // Setup: valid JWT, no @Roles decorator
      // Expect: canActivate returns true
    });

    it('should allow access when user has required role', async () => {
      // Setup: valid JWT with publicMetadata.role = 'admin', @Roles('admin')
      // Expect: canActivate returns true
    });

    it('should deny access when user lacks required role', async () => {
      // Setup: valid JWT without admin role, @Roles('admin')
      // Expect: canActivate returns false or throws ForbiddenException
    });

    it('should deny access when JWT is invalid', async () => {
      // Setup: invalid/expired JWT
      // Expect: canActivate returns false or throws UnauthorizedException
    });
  });
});
```

**Implementación esperada:**
```typescript
@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    // Get request from GraphQL context
    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext();

    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      // Verify token with Clerk
      const payload = await clerkClient.verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY,
      });

      req.user = payload;

      // Check roles if @Roles decorator is present
      const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
        context.getHandler(),
        context.getClass(),
      ]);

      if (requiredRoles && requiredRoles.length > 0) {
        const userRole = payload.publicMetadata?.role as string;
        if (!requiredRoles.includes(userRole)) {
          throw new ForbiddenException('Insufficient permissions');
        }
      }

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) throw error;
      throw new UnauthorizedException('Invalid token');
    }
  }
}
```

---

### Tarea 2: Crear/Verificar @Roles decorator

**Archivo:** `backend/src/common/decorators/roles.decorator.ts`

**Test:**
```typescript
// backend/src/common/decorators/roles.decorator.spec.ts

describe('Roles decorator', () => {
  it('should set metadata with provided roles', () => {
    @Roles('admin', 'super_admin')
    class TestClass {}

    const roles = Reflect.getMetadata('roles', TestClass);
    expect(roles).toEqual(['admin', 'super_admin']);
  });
});
```

**Implementación:**
```typescript
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
```

---

### Tarea 3: Agregar query `me` para usuario autenticado

**Archivo:** `backend/src/modules/auth/auth.resolver.ts`

**Propósito:** Permitir al frontend obtener información del usuario actual incluyendo su rol.

**GraphQL Schema:**
```graphql
type AuthUser {
  id: String!
  email: String
  firstName: String
  lastName: String
  imageUrl: String
  role: String
}

type Query {
  me: AuthUser
}
```

**Test Cases:**
```typescript
// backend/src/modules/auth/auth.resolver.spec.ts

describe('AuthResolver', () => {
  describe('me query', () => {
    it('should return null when not authenticated', async () => {
      // Setup: no auth header
      // Expect: returns null (not error, for graceful handling)
    });

    it('should return user info when authenticated', async () => {
      // Setup: valid JWT
      // Expect: returns user with id, email, role from publicMetadata
    });
  });
});
```

**Implementación:**
```typescript
// modules/auth/entities/auth-user.entity.ts
@ObjectType()
export class AuthUser {
  @Field()
  id: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field({ nullable: true })
  role?: string;
}

// modules/auth/auth.resolver.ts
@Resolver()
export class AuthResolver {
  @Query(() => AuthUser, { nullable: true })
  async me(@Context() context: any): Promise<AuthUser | null> {
    const user = context.req.user;
    if (!user) return null;

    return {
      id: user.sub,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
      role: user.publicMetadata?.role,
    };
  }
}
```

---

### Tarea 4: Verificar mutations admin tienen @Roles('admin')

**Archivos a verificar:**
- `backend/src/modules/services/services.resolver.ts`
- `backend/src/modules/blog/blog.resolver.ts`
- `backend/src/modules/leads/leads.resolver.ts`

**Checklist:**
- [ ] `createService` tiene `@UseGuards(ClerkAuthGuard)` y `@Roles('admin')`
- [ ] `updateService` tiene `@UseGuards(ClerkAuthGuard)` y `@Roles('admin')`
- [ ] `deleteService` tiene `@UseGuards(ClerkAuthGuard)` y `@Roles('admin')`
- [ ] `createBlogPost` tiene `@UseGuards(ClerkAuthGuard)` y `@Roles('admin')`
- [ ] `updateBlogPost` tiene `@UseGuards(ClerkAuthGuard)` y `@Roles('admin')`
- [ ] `deleteBlogPost` tiene `@UseGuards(ClerkAuthGuard)` y `@Roles('admin')`
- [ ] `updateLead` tiene `@UseGuards(ClerkAuthGuard)` y `@Roles('admin')`
- [ ] `deleteLead` tiene `@UseGuards(ClerkAuthGuard)` y `@Roles('admin')`
- [ ] queries `leads`, `lead` tienen `@UseGuards(ClerkAuthGuard)` y `@Roles('admin')`

---

## Orden de Ejecución (TDD)

1. **RED:** Escribir tests para ClerkAuthGuard con validación de roles
2. **RED:** Escribir tests para query `me`
3. **GREEN:** Implementar/modificar ClerkAuthGuard
4. **GREEN:** Implementar @Roles decorator (si no existe)
5. **GREEN:** Implementar query `me`
6. **GREEN:** Agregar @Roles('admin') a mutations que falten
7. **REFACTOR:** Limpiar código, mejorar typing
8. **VERIFY:** `npm run test` && `npm run build`

---

## Verificación Final

```bash
cd backend

# 1. Run tests
npm run test

# 2. Build project
npm run build

# 3. Start server
npm run start:dev

# 4. Test in GraphQL Playground
# Query: { me { id email role } }
# Should return null if no auth, user info if authenticated
```

---

## Criterios de Aceptación

- [ ] Todos los tests pasan (`npm run test`)
- [ ] Build exitoso (`npm run build`)
- [ ] Query `me` funciona en GraphQL Playground
- [ ] Mutations admin retornan 401 sin token
- [ ] Mutations admin retornan 403 sin rol admin
- [ ] Mutations admin funcionan con token de admin
