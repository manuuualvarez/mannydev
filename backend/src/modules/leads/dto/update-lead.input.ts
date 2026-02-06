import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { LeadStatus } from '../entities/lead.entity.js';

@InputType()
export class UpdateLeadInput {
  @Field(() => LeadStatus, { nullable: true })
  @IsEnum(LeadStatus)
  @IsOptional()
  status?: LeadStatus;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  notes?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  company?: string;
}
