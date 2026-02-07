import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { LeadsService } from './leads.service.js';
import { Lead, LeadStatus } from './entities/lead.entity.js';
import { CreateLeadInput } from './dto/create-lead.input.js';
import { UpdateLeadInput } from './dto/update-lead.input.js';
import { LeadWhereInput } from './dto/lead-where.input.js';
import { LeadPaginationInput } from './dto/lead-pagination.input.js';
import { Public } from '../../common/decorators/public.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';

@Resolver(() => Lead)
export class LeadsResolver {
  constructor(private readonly leadsService: LeadsService) {}

  // Public: create lead (contact form)
  @Public()
  @Mutation(() => Lead)
  async createLead(@Args('input') input: CreateLeadInput) {
    return this.leadsService.create(input);
  }

  // Admin: get all leads
  @Roles('admin')
  @Query(() => [Lead], { name: 'leads' })
  async leads(
    @Args('where', { nullable: true }) where?: LeadWhereInput,
    @Args('pagination', { nullable: true }) pagination?: LeadPaginationInput,
  ) {
    return this.leadsService.findAll(where, pagination);
  }

  // Admin: get lead by id
  @Roles('admin')
  @Query(() => Lead, { name: 'lead', nullable: true })
  async lead(@Args('id', { type: () => ID }) id: string) {
    return this.leadsService.findOne(id);
  }

  // Admin: count leads
  @Roles('admin')
  @Query(() => Int, { name: 'leadsCount' })
  async leadsCount(
    @Args('status', { type: () => LeadStatus, nullable: true })
    status?: LeadStatus,
  ) {
    return this.leadsService.count(status);
  }

  // Admin: update lead
  @Roles('admin')
  @Mutation(() => Lead)
  async updateLead(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateLeadInput,
  ) {
    return this.leadsService.update(id, input);
  }

  // Admin: delete lead
  @Roles('admin')
  @Mutation(() => Lead)
  async deleteLead(@Args('id', { type: () => ID }) id: string) {
    return this.leadsService.delete(id);
  }
}
