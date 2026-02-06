import { Resolver, Query, Context } from '@nestjs/graphql';
import { AuthUser } from './entities/auth-user.entity.js';
import { Public } from '../../common/decorators/public.decorator.js';

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

interface GraphQLContext {
  req: {
    user?: ClerkTokenPayload;
  };
}

@Resolver()
export class AuthResolver {
  @Public()
  @Query(() => AuthUser, { nullable: true })
  async me(@Context() context: GraphQLContext): Promise<AuthUser | null> {
    const user = context.req.user;
    if (!user) {
      return null;
    }

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
