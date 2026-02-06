import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { BlogService } from './blog.service.js';
import { BlogPost } from './entities/blog-post.entity.js';
import { CreateBlogPostInput } from './dto/create-blog-post.input.js';
import { UpdateBlogPostInput } from './dto/update-blog-post.input.js';
import { BlogPaginationInput } from './dto/blog-pagination.input.js';
import { Public } from '../../common/decorators/public.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';

@Resolver(() => BlogPost)
export class BlogResolver {
  constructor(private readonly blogService: BlogService) {}

  // Public: only published posts
  @Public()
  @Query(() => [BlogPost], { name: 'blogPosts' })
  async blogPosts(
    @Args('pagination', { nullable: true }) pagination?: BlogPaginationInput,
  ) {
    return this.blogService.findAllPublished(pagination);
  }

  // Public: get published post by slug
  @Public()
  @Query(() => BlogPost, { name: 'blogPostBySlug', nullable: true })
  async blogPostBySlug(@Args('slug') slug: string) {
    return this.blogService.findBySlugPublished(slug);
  }

  // Admin: get all posts (including drafts)
  @Roles('admin')
  @Query(() => [BlogPost], { name: 'adminBlogPosts' })
  async adminBlogPosts(
    @Args('pagination', { nullable: true }) pagination?: BlogPaginationInput,
  ) {
    return this.blogService.findAll(pagination);
  }

  // Admin: get any post by id
  @Roles('admin')
  @Query(() => BlogPost, { name: 'adminBlogPost', nullable: true })
  async adminBlogPost(@Args('id', { type: () => ID }) id: string) {
    return this.blogService.findOne(id);
  }

  // Admin: get any post by slug (including drafts)
  @Roles('admin')
  @Query(() => BlogPost, { name: 'adminBlogPostBySlug', nullable: true })
  async adminBlogPostBySlug(@Args('slug') slug: string) {
    return this.blogService.findBySlug(slug);
  }

  // Public: count published posts
  @Public()
  @Query(() => Int, { name: 'blogPostsCount' })
  async blogPostsCount() {
    return this.blogService.count(true);
  }

  @Roles('admin')
  @Mutation(() => BlogPost)
  async createBlogPost(@Args('input') input: CreateBlogPostInput) {
    return this.blogService.create(input);
  }

  @Roles('admin')
  @Mutation(() => BlogPost)
  async updateBlogPost(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateBlogPostInput,
  ) {
    return this.blogService.update(id, input);
  }

  @Roles('admin')
  @Mutation(() => BlogPost)
  async deleteBlogPost(@Args('id', { type: () => ID }) id: string) {
    return this.blogService.delete(id);
  }
}
