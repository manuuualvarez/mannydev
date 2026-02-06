import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';

@InputType()
export class CreateUserInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  clerkUserId: string;

  @Field({ nullable: true, defaultValue: 'USER' })
  @IsString()
  @IsIn(['USER', 'ADMIN', 'SUPER_ADMIN'])
  @IsOptional()
  role?: string;
}
