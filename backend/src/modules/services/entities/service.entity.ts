import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-scalars';

@ObjectType()
export class Service {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  slug: string;

  @Field()
  description: string;

  @Field({ nullable: true })
  icon?: string;

  @Field(() => Int)
  order: number;

  @Field()
  isActive: boolean;

  @Field(() => Int, { nullable: true })
  startingPrice?: number;

  @Field(() => GraphQLJSON, { nullable: true })
  translations?: Record<string, unknown>;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
