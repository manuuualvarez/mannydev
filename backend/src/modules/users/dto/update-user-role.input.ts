import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsIn } from 'class-validator';

@InputType()
export class UpdateUserRoleInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @IsIn(['USER', 'ADMIN', 'SUPER_ADMIN'])
  role: string;
}
