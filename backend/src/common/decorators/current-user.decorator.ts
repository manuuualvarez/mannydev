import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export interface ClerkUser {
  sub: string;
  email?: string;
  [key: string]: unknown;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): ClerkUser | undefined => {
    const ctx = GqlExecutionContext.create(context);
    const gqlContext = ctx.getContext<{ req: { user?: ClerkUser } }>();
    return gqlContext.req.user;
  },
);
