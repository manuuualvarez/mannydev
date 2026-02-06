import { Injectable, ConflictException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateBlogPostInput } from './dto/create-blog-post.input.js';
import { UpdateBlogPostInput } from './dto/update-blog-post.input.js';
import { BlogPaginationInput } from './dto/blog-pagination.input.js';

@Injectable()
export class BlogService {
  private readonly logger = new Logger(BlogService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Public: only published posts
  async findAllPublished(pagination?: BlogPaginationInput) {
    return this.prisma.blogPost.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' },
      take: pagination?.take,
      skip: pagination?.skip,
    });
  }

  // Admin: all posts
  async findAll(pagination?: BlogPaginationInput) {
    return this.prisma.blogPost.findMany({
      orderBy: { createdAt: 'desc' },
      take: pagination?.take,
      skip: pagination?.skip,
    });
  }

  async findOne(id: string) {
    return this.prisma.blogPost.findUnique({ where: { id } });
  }

  // Public: only published
  async findBySlugPublished(slug: string) {
    return this.prisma.blogPost.findUnique({
      where: { slug, isPublished: true },
    });
  }

  // Admin: any post by slug
  async findBySlug(slug: string) {
    return this.prisma.blogPost.findUnique({ where: { slug } });
  }

  async create(input: CreateBlogPostInput) {
    this.logger.log(`Creating blog post: ${input.title}`);

    const existing = await this.prisma.blogPost.findUnique({
      where: { slug: input.slug },
    });

    if (existing) {
      throw new ConflictException('Blog post with this slug already exists');
    }

    return this.prisma.blogPost.create({
      data: {
        title: input.title,
        slug: input.slug,
        content: input.content,
        excerpt: input.excerpt,
        coverImage: input.coverImage,
        seoMetadata: input.seoMetadata as object ?? undefined,
        isPublished: input.isPublished ?? false,
        publishedAt: input.isPublished ? new Date() : null,
        translations: input.translations as object ?? undefined,
      },
    });
  }

  async update(id: string, input: UpdateBlogPostInput) {
    const post = await this.prisma.blogPost.findUnique({ where: { id } });

    if (!post) {
      throw new NotFoundException('Blog post not found');
    }

    this.logger.log(`Updating blog post: ${id}`);

    // If publishing for the first time, set publishedAt
    const data: Record<string, unknown> = { ...input };
    if (input.isPublished && !post.isPublished && !post.publishedAt) {
      data.publishedAt = new Date();
    }

    return this.prisma.blogPost.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    const post = await this.prisma.blogPost.findUnique({ where: { id } });

    if (!post) {
      throw new NotFoundException('Blog post not found');
    }

    this.logger.log(`Deleting blog post: ${id}`);

    return this.prisma.blogPost.delete({ where: { id } });
  }

  async count(isPublished?: boolean) {
    return this.prisma.blogPost.count({
      where: isPublished !== undefined ? { isPublished } : undefined,
    });
  }
}
