import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { ServicesService } from './services.service.js';
import { Service } from './entities/service.entity.js';
import { CreateServiceInput } from './dto/create-service.input.js';
import { UpdateServiceInput } from './dto/update-service.input.js';
import { ServiceWhereInput } from './dto/service-where.input.js';
import { Public } from '../../common/decorators/public.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';

@Resolver(() => Service)
export class ServicesResolver {
  constructor(private readonly servicesService: ServicesService) {}

  @Public()
  @Query(() => [Service], { name: 'services' })
  async services(@Args('where', { nullable: true }) where?: ServiceWhereInput) {
    return this.servicesService.findAll(where);
  }

  @Public()
  @Query(() => Service, { name: 'service', nullable: true })
  async service(@Args('id', { type: () => ID }) id: string) {
    return this.servicesService.findOne(id);
  }

  @Public()
  @Query(() => Service, { name: 'serviceBySlug', nullable: true })
  async serviceBySlug(@Args('slug') slug: string) {
    return this.servicesService.findBySlug(slug);
  }

  @Roles('admin')
  @Query(() => Int, { name: 'servicesCount' })
  async servicesCount(
    @Args('isActive', { nullable: true }) isActive?: boolean,
  ) {
    return this.servicesService.count(isActive);
  }

  @Roles('admin')
  @Mutation(() => Service)
  async createService(@Args('input') input: CreateServiceInput) {
    return this.servicesService.create(input);
  }

  @Roles('admin')
  @Mutation(() => Service)
  async updateService(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateServiceInput,
  ) {
    return this.servicesService.update(id, input);
  }

  @Roles('admin')
  @Mutation(() => Service)
  async deleteService(@Args('id', { type: () => ID }) id: string) {
    return this.servicesService.delete(id);
  }
}
