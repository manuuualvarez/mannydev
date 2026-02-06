import { InputType, Field, Int } from '@nestjs/graphql';
import { IsString, IsBoolean, IsOptional, IsInt, MinLength, Matches, Min, IsObject } from 'class-validator';
import { GraphQLJSON } from 'graphql-scalars';

@InputType()
export class CreateServiceInput {
  @Field()
  @IsString()
  @MinLength(2)
  name: string;

  @Field()
  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: 'Slug must be lowercase with hyphens only' })
  slug: string;

  @Field()
  @IsString()
  @MinLength(10)
  description: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  icon?: string;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @Min(0)
  @IsOptional()
  startingPrice?: number;

  @Field({ nullable: true, defaultValue: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsObject()
  @IsOptional()
  translations?: Record<string, unknown>;
}
