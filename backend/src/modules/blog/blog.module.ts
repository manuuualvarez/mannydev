import { Module } from '@nestjs/common';
import { BlogService } from './blog.service.js';
import { BlogResolver } from './blog.resolver.js';

@Module({
  providers: [BlogService, BlogResolver],
  exports: [BlogService],
})
export class BlogModule {}
