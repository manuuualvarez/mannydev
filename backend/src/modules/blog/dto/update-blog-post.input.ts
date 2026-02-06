import { InputType, PartialType } from '@nestjs/graphql';
import { CreateBlogPostInput } from './create-blog-post.input.js';

@InputType()
export class UpdateBlogPostInput extends PartialType(CreateBlogPostInput) {}
