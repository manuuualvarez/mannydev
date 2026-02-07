import { Test, TestingModule } from '@nestjs/testing';
import { AuthResolver } from './auth.resolver';

describe('AuthResolver', () => {
  let resolver: AuthResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthResolver],
    }).compile();

    resolver = module.get<AuthResolver>(AuthResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('me query', () => {
    it('should return null when not authenticated', () => {
      // Arrange - no auth header / no user in context
      const context = {
        req: {
          user: undefined,
        },
      };

      // Act
      const result = resolver.me(context);

      // Assert
      expect(result).toBeNull();
    });

    it('should return user info when authenticated', () => {
      // Arrange - valid JWT with user data
      const context = {
        req: {
          user: {
            sub: 'user_123',
            email: 'test@example.com',
            firstName: 'John',
            lastName: 'Doe',
            imageUrl: 'https://example.com/avatar.jpg',
            publicMetadata: {
              role: 'admin',
            },
          },
        },
      };

      // Act
      const result = resolver.me(context);

      // Assert
      expect(result).toEqual({
        id: 'user_123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        imageUrl: 'https://example.com/avatar.jpg',
        role: 'admin',
      });
    });

    it('should handle missing optional fields', () => {
      // Arrange - user with only sub (minimal)
      const context = {
        req: {
          user: {
            sub: 'user_456',
            publicMetadata: {},
          },
        },
      };

      // Act
      const result = resolver.me(context);

      // Assert
      expect(result).toEqual({
        id: 'user_456',
        email: undefined,
        firstName: undefined,
        lastName: undefined,
        imageUrl: undefined,
        role: undefined,
      });
    });

    it('should handle missing publicMetadata', () => {
      // Arrange - user without publicMetadata
      const context = {
        req: {
          user: {
            sub: 'user_789',
            email: 'noMeta@example.com',
          },
        },
      };

      // Act
      const result = resolver.me(context);

      // Assert
      expect(result).toEqual({
        id: 'user_789',
        email: 'noMeta@example.com',
        firstName: undefined,
        lastName: undefined,
        imageUrl: undefined,
        role: undefined,
      });
    });

    it('should return user role from publicMetadata', () => {
      // Arrange - user with role in publicMetadata
      const context = {
        req: {
          user: {
            sub: 'admin_001',
            email: 'admin@example.com',
            publicMetadata: {
              role: 'admin',
            },
          },
        },
      };

      // Act
      const result = resolver.me(context);

      // Assert
      expect(result).not.toBeNull();
      expect(result?.role).toBe('admin');
    });
  });
});
