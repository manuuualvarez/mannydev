import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateUserInput } from './dto/create-user.input.js';
import { UpdateUserRoleInput } from './dto/update-user-role.input.js';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByClerkId(clerkUserId: string) {
    return this.prisma.user.findUnique({
      where: { clerkUserId },
    });
  }

  async create(input: CreateUserInput) {
    this.logger.log(`Creating user with clerkUserId: ${input.clerkUserId}`);
    return this.prisma.user.create({
      data: {
        clerkUserId: input.clerkUserId,
        role: (input.role as Role) ?? undefined,
      },
    });
  }

  async updateRole(id: string, input: UpdateUserRoleInput) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    this.logger.log(`Updating role for user ${id} to ${input.role}`);

    return this.prisma.user.update({
      where: { id },
      data: { role: input.role as Role },
    });
  }

  async count() {
    return this.prisma.user.count();
  }

  async delete(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    this.logger.log(`Deleting user: ${id}`);

    return this.prisma.user.delete({ where: { id } });
  }
}
