import { Injectable, ConflictException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateServiceInput } from './dto/create-service.input.js';
import { UpdateServiceInput } from './dto/update-service.input.js';
import { ServiceWhereInput } from './dto/service-where.input.js';

@Injectable()
export class ServicesService {
  private readonly logger = new Logger(ServicesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(where?: ServiceWhereInput) {
    return this.prisma.service.findMany({
      where: where ? { isActive: where.isActive } : undefined,
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.service.findUnique({ where: { id } });
  }

  async findBySlug(slug: string) {
    return this.prisma.service.findUnique({ where: { slug } });
  }

  async create(input: CreateServiceInput) {
    this.logger.log(`Creating service: ${input.name}`);

    const existing = await this.prisma.service.findUnique({
      where: { slug: input.slug },
    });

    if (existing) {
      throw new ConflictException('Service with this slug already exists');
    }

    return this.prisma.service.create({
      data: {
        name: input.name,
        slug: input.slug,
        description: input.description,
        icon: input.icon,
        order: input.order,
        isActive: input.isActive,
        startingPrice: input.startingPrice,
        translations: input.translations as object ?? undefined,
      },
    });
  }

  async update(id: string, input: UpdateServiceInput) {
    const service = await this.prisma.service.findUnique({ where: { id } });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    this.logger.log(`Updating service: ${id}`);

    const data: Record<string, unknown> = { ...input };
    if (input.translations !== undefined) {
      data.translations = input.translations as object;
    }

    return this.prisma.service.update({
      where: { id },
      data,
    });
  }

  async count(isActive?: boolean) {
    return this.prisma.service.count({
      where: isActive !== undefined ? { isActive } : undefined,
    });
  }

  async delete(id: string) {
    const service = await this.prisma.service.findUnique({ where: { id } });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    this.logger.log(`Deleting service: ${id}`);

    return this.prisma.service.delete({ where: { id } });
  }
}
