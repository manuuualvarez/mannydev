import { Query, Resolver } from '@nestjs/graphql';
import { Public } from '../decorators/public.decorator.js';

@Resolver()
export class HealthResolver {
  @Public()
  @Query(() => String, { description: 'Health check query' })
  health(): string {
    return 'OK';
  }
}
