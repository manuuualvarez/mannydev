import { InputType, Field } from '@nestjs/graphql';
import {
  IsString,
  IsBoolean,
  IsOptional,
  MinLength,
  Matches,
  IsObject,
} from 'class-validator';
import { GraphQLJSON, GraphQLJSONObject } from 'graphql-scalars';

@InputType()
export class CreateBlogPostInput {
  @Field()
  @IsString()
  @MinLength(3)
  title: string;

  @Field()
  @IsString()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug must be lowercase with hyphens only',
  })
  slug: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  excerpt?: string;

  @Field()
  @IsString()
  @MinLength(10)
  content: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  coverImage?: string;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsObject()
  @IsOptional()
  seoMetadata?: Record<string, unknown>;

  @Field({ nullable: true, defaultValue: false })
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsObject()
  @IsOptional()
  translations?: Record<string, unknown>;
}
