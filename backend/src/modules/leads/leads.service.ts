import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateLeadInput } from './dto/create-lead.input.js';
import { UpdateLeadInput } from './dto/update-lead.input.js';
import { LeadWhereInput } from './dto/lead-where.input.js';
import { LeadPaginationInput } from './dto/lead-pagination.input.js';

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(where?: LeadWhereInput, pagination?: LeadPaginationInput) {
    return this.prisma.lead.findMany({
      where: where ? { status: where.status } : undefined,
      orderBy: { createdAt: 'desc' },
      take: pagination?.take,
      skip: pagination?.skip,
    });
  }

  async findOne(id: string) {
    return this.prisma.lead.findUnique({ where: { id } });
  }

  async create(input: CreateLeadInput) {
    this.logger.log(`Creating lead from: ${input.email}`);

    const lead = await this.prisma.lead.create({
      data: input,
    });

    this.notifyWebhook(lead);

    return lead;
  }

  private notifyWebhook(lead: {
    id: string;
    name: string;
    email: string;
    company: string | null;
    message: string;
    createdAt: Date;
  }) {
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    if (!webhookUrl) return;

    fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: lead.id,
        name: lead.name,
        email: lead.email,
        company: lead.company,
        message: lead.message,
        createdAt: lead.createdAt,
        source: 'manuelalvarez.cloud',
      }),
    }).catch((err) => {
      this.logger.warn(`Failed to notify webhook: ${err.message}`);
    });
  }

  async update(id: string, input: UpdateLeadInput) {
    const lead = await this.prisma.lead.findUnique({ where: { id } });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    this.logger.log(`Updating lead: ${id}`);

    return this.prisma.lead.update({
      where: { id },
      data: input,
    });
  }

  async delete(id: string) {
    const lead = await this.prisma.lead.findUnique({ where: { id } });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    this.logger.log(`Deleting lead: ${id}`);

    return this.prisma.lead.delete({ where: { id } });
  }

  async count(status?: string) {
    return this.prisma.lead.count({
      where: status ? { status: status as any } : undefined,
    });
  }
}
