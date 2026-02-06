import { InputType, Field } from '@nestjs/graphql';
import { IsEnum, IsOptional } from 'class-validator';
import { LeadStatus } from '../entities/lead.entity.js';

@InputType()
export class LeadWhereInput {
  @Field(() => LeadStatus, { nullable: true })
  @IsEnum(LeadStatus)
  @IsOptional()
  status?: LeadStatus;
}
