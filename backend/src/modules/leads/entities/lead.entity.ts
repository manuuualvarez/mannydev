import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';

export enum LeadStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  QUALIFIED = 'QUALIFIED',
  PROPOSAL = 'PROPOSAL',
  WON = 'WON',
  LOST = 'LOST',
}

registerEnumType(LeadStatus, {
  name: 'LeadStatus',
  description: 'Status of a lead in the sales pipeline',
});

@ObjectType()
export class Lead {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  company?: string;

  @Field()
  message: string;

  @Field(() => LeadStatus)
  status: LeadStatus;

  @Field({ nullable: true })
  notes?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
