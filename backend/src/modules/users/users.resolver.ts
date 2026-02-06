import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { UsersService } from './users.service.js';
import { User } from './entities/user.entity.js';
import { UpdateUserRoleInput } from './dto/update-user-role.input.js';
import { Roles } from '../../common/decorators/roles.decorator.js';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Roles('admin')
  @Query(() => [User], { name: 'users' })
  async users() {
    return this.usersService.findAll();
  }

  @Roles('admin')
  @Query(() => User, { name: 'user', nullable: true })
  async user(@Args('id', { type: () => ID }) id: string) {
    return this.usersService.findOne(id);
  }

  @Roles('admin')
  @Query(() => Int, { name: 'usersCount' })
  async usersCount() {
    return this.usersService.count();
  }

  @Roles('admin')
  @Mutation(() => User)
  async updateUserRole(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateUserRoleInput,
  ) {
    return this.usersService.updateRole(id, input);
  }

  @Roles('admin')
  @Mutation(() => User)
  async deleteUser(@Args('id', { type: () => ID }) id: string) {
    return this.usersService.delete(id);
  }
}
