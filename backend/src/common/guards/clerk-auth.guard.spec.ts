/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import {
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ClerkAuthGuard } from './clerk-auth.guard';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ROLES_KEY } from '../decorators/roles.decorator';

// Mock the Clerk SDK
jest.mock('@clerk/clerk-sdk-node', () => ({
  verifyToken: jest.fn(),
}));

import { verifyToken } from '@clerk/clerk-sdk-node';

const mockVerifyToken = verifyToken as jest.MockedFunction<typeof verifyToken>;

describe('ClerkAuthGuard', () => {
  let guard: ClerkAuthGuard;
  let reflector: Reflector;

  const mockGqlContext = {
    getContext: jest.fn(),
  };

  const mockExecutionContext = {
    getHandler: jest.fn(),
    getClass: jest.fn(),
    getType: jest.fn().mockReturnValue('graphql'),
  } as unknown as ExecutionContext;

  const originalEnv = process.env;

  beforeEach(async () => {
    process.env = { ...originalEnv, CLERK_SECRET_KEY: 'test_secret_key' };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClerkAuthGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<ClerkAuthGuard>(ClerkAuthGuard);
    reflector = module.get<Reflector>(Reflector);

    // Setup GqlExecutionContext mock
    jest
      .spyOn(GqlExecutionContext, 'create')
      .mockReturnValue(mockGqlContext as unknown as GqlExecutionContext);
  });

  afterEach(() => {
    jest.clearAllMocks();
    process.env = originalEnv;
  });

  describe('canActivate', () => {
    it('should allow public routes without authentication', async () => {
      // Arrange
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

      // Act
      const result = await guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
        mockExecutionContext.getHandler(),
        mockExecutionContext.getClass(),
      ]);
    });

    it('should reject requests without authorization header', async () => {
      // Arrange
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      mockGqlContext.getContext.mockReturnValue({
        req: {
          headers: {},
        },
      });

      // Act & Assert
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should reject requests with invalid token', async () => {
      // Arrange
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      mockGqlContext.getContext.mockReturnValue({
        req: {
          headers: {
            authorization: 'Bearer invalid-token',
          },
        },
      });
      mockVerifyToken.mockRejectedValue(new Error('Invalid token'));

      // Act & Assert
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should allow requests with valid Clerk token', async () => {
      // Arrange
      const mockUser = {
        sub: 'user_123',
        email: 'test@example.com',
      };
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      const mockReq = {
        headers: {
          authorization: 'Bearer valid-token',
        },
        user: undefined as unknown,
      };
      mockGqlContext.getContext.mockReturnValue({ req: mockReq });
      mockVerifyToken.mockResolvedValue(
        mockUser as unknown as ReturnType<typeof verifyToken>,
      );

      // Act
      const result = await guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(true);
      expect(mockReq.user).toEqual(mockUser);
      expect(mockVerifyToken).toHaveBeenCalledWith('valid-token', {
        secretKey: 'test_secret_key',
        issuer: null,
      });
    });

    it('should handle Bearer prefix correctly', async () => {
      // Arrange
      const mockUser = { sub: 'user_123' };
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      const mockReq = {
        headers: {
          authorization: 'Bearer   token-with-spaces',
        },
        user: undefined as unknown,
      };
      mockGqlContext.getContext.mockReturnValue({ req: mockReq });
      mockVerifyToken.mockResolvedValue(
        mockUser as unknown as ReturnType<typeof verifyToken>,
      );

      // Act
      await guard.canActivate(mockExecutionContext);

      // Assert
      expect(mockVerifyToken).toHaveBeenCalledWith('  token-with-spaces', {
        secretKey: 'test_secret_key',
        issuer: null,
      });
    });

    it('should reject when CLERK_SECRET_KEY is not configured', async () => {
      // Arrange
      delete process.env.CLERK_SECRET_KEY;
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      mockGqlContext.getContext.mockReturnValue({
        req: {
          headers: {
            authorization: 'Bearer some-token',
          },
        },
      });

      // Act & Assert
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('Role validation', () => {
    it('should allow access when no role is required', async () => {
      // Arrange - valid JWT, no @Roles decorator
      const mockUser = {
        sub: 'user_123',
        email: 'test@example.com',
      };
      const mockReq = {
        headers: {
          authorization: 'Bearer valid-token',
        },
        user: undefined as unknown,
      };

      // First call returns false (not public), second call returns undefined (no roles)
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockImplementation((key: unknown) => {
          if (key === IS_PUBLIC_KEY) return false;
          if (key === ROLES_KEY) return undefined;
          return undefined;
        });

      mockGqlContext.getContext.mockReturnValue({ req: mockReq });
      mockVerifyToken.mockResolvedValue(
        mockUser as unknown as ReturnType<typeof verifyToken>,
      );

      // Act
      const result = await guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(true);
    });

    it('should allow access when user has required role', async () => {
      // Arrange - valid JWT with publicMetadata.role = 'admin', @Roles('admin')
      const mockUser = {
        sub: 'user_123',
        email: 'admin@example.com',
        publicMetadata: {
          role: 'admin',
        },
      };
      const mockReq = {
        headers: {
          authorization: 'Bearer valid-token',
        },
        user: undefined as unknown,
      };

      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockImplementation((key: unknown) => {
          if (key === IS_PUBLIC_KEY) return false;
          if (key === ROLES_KEY) return ['admin'];
          return undefined;
        });

      mockGqlContext.getContext.mockReturnValue({ req: mockReq });
      mockVerifyToken.mockResolvedValue(
        mockUser as unknown as ReturnType<typeof verifyToken>,
      );

      // Act
      const result = await guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(true);
      expect(mockReq.user).toEqual(mockUser);
    });

    it('should allow access when user has one of multiple required roles', async () => {
      // Arrange - user has super_admin, route requires admin or super_admin
      const mockUser = {
        sub: 'user_456',
        email: 'superadmin@example.com',
        publicMetadata: {
          role: 'super_admin',
        },
      };
      const mockReq = {
        headers: {
          authorization: 'Bearer valid-token',
        },
        user: undefined as unknown,
      };

      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockImplementation((key: unknown) => {
          if (key === IS_PUBLIC_KEY) return false;
          if (key === ROLES_KEY) return ['admin', 'super_admin'];
          return undefined;
        });

      mockGqlContext.getContext.mockReturnValue({ req: mockReq });
      mockVerifyToken.mockResolvedValue(
        mockUser as unknown as ReturnType<typeof verifyToken>,
      );

      // Act
      const result = await guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(true);
    });

    it('should deny access when user lacks required role', async () => {
      // Arrange - valid JWT without admin role, @Roles('admin')
      const mockUser = {
        sub: 'user_123',
        email: 'user@example.com',
        publicMetadata: {
          role: 'user',
        },
      };
      const mockReq = {
        headers: {
          authorization: 'Bearer valid-token',
        },
        user: undefined as unknown,
      };

      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockImplementation((key: unknown) => {
          if (key === IS_PUBLIC_KEY) return false;
          if (key === ROLES_KEY) return ['admin'];
          return undefined;
        });

      mockGqlContext.getContext.mockReturnValue({ req: mockReq });
      mockVerifyToken.mockResolvedValue(
        mockUser as unknown as ReturnType<typeof verifyToken>,
      );

      // Act & Assert
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should deny access when user has no role and role is required', async () => {
      // Arrange - valid JWT without any role in publicMetadata
      const mockUser = {
        sub: 'user_123',
        email: 'user@example.com',
        publicMetadata: {},
      };
      const mockReq = {
        headers: {
          authorization: 'Bearer valid-token',
        },
        user: undefined as unknown,
      };

      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockImplementation((key: unknown) => {
          if (key === IS_PUBLIC_KEY) return false;
          if (key === ROLES_KEY) return ['admin'];
          return undefined;
        });

      mockGqlContext.getContext.mockReturnValue({ req: mockReq });
      mockVerifyToken.mockResolvedValue(
        mockUser as unknown as ReturnType<typeof verifyToken>,
      );

      // Act & Assert
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should deny access when publicMetadata is undefined', async () => {
      // Arrange - valid JWT without publicMetadata at all
      const mockUser = {
        sub: 'user_123',
        email: 'user@example.com',
      };
      const mockReq = {
        headers: {
          authorization: 'Bearer valid-token',
        },
        user: undefined as unknown,
      };

      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockImplementation((key: unknown) => {
          if (key === IS_PUBLIC_KEY) return false;
          if (key === ROLES_KEY) return ['admin'];
          return undefined;
        });

      mockGqlContext.getContext.mockReturnValue({ req: mockReq });
      mockVerifyToken.mockResolvedValue(
        mockUser as unknown as ReturnType<typeof verifyToken>,
      );

      // Act & Assert
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
