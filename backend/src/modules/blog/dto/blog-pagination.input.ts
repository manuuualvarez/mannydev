import { InputType, Field, Int } from '@nestjs/graphql';
import { IsInt, IsOptional, Min, Max } from 'class-validator';

@InputType()
export class BlogPaginationInput {
  @Field(() => Int, { nullable: true, defaultValue: 10 })
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  take?: number;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  skip?: number;
}
