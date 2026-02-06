import { ObjectType, Field, ID } from '@nestjs/graphql';
import { GraphQLJSON, GraphQLJSONObject } from 'graphql-scalars';

@ObjectType()
export class BlogPost {
  @Field(() => ID)
  id: string;

  @Field()
  slug: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  excerpt?: string;

  @Field()
  content: string;

  @Field({ nullable: true })
  coverImage?: string;

  @Field(() => GraphQLJSONObject, { nullable: true })
  seoMetadata?: Record<string, unknown>;

  @Field({ nullable: true })
  publishedAt?: Date;

  @Field()
  isPublished: boolean;

  @Field(() => GraphQLJSON, { nullable: true })
  translations?: Record<string, unknown>;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
