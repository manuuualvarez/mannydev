import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Reflector } from '@nestjs/core';
import { verifyToken } from '@clerk/clerk-sdk-node';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';
import { ROLES_KEY } from '../decorators/roles.decorator.js';

interface ClerkTokenPayload {
  sub: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  publicMetadata?: {
    role?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface RequestWithUser {
  headers: {
    authorization?: string;
  };
  user?: ClerkTokenPayload;
}

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private readonly logger = new Logger(ClerkAuthGuard.name);

  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req as RequestWithUser;
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      this.logger.warn('No authorization header provided');
      throw new UnauthorizedException('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      const secretKey = process.env.CLERK_SECRET_KEY;
      if (!secretKey) {
        this.logger.error('CLERK_SECRET_KEY is not configured');
        throw new UnauthorizedException('Authentication not configured');
      }

      const decoded = await verifyToken(token, {
        secretKey,
        issuer: null, // Will be inferred from the token
      });
      request.user = decoded as ClerkTokenPayload;
      this.logger.debug(`User authenticated: ${decoded.sub}`);

      // Check roles if @Roles decorator is present
      const requiredRoles = this.reflector.getAllAndOverride<string[]>(
        ROLES_KEY,
        [context.getHandler(), context.getClass()],
      );

      if (requiredRoles && requiredRoles.length > 0) {
        const userRole = (decoded as ClerkTokenPayload).publicMetadata?.role;
        if (!userRole || !requiredRoles.includes(userRole)) {
          this.logger.warn(
            `User ${decoded.sub} lacks required role. Has: ${userRole}, needs: ${requiredRoles.join(', ')}`,
          );
          throw new ForbiddenException('Insufficient permissions');
        }
        this.logger.debug(
          `User ${decoded.sub} has required role: ${userRole}`,
        );
      }

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      this.logger.warn(`Token verification failed: ${(error as Error).message}`);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
