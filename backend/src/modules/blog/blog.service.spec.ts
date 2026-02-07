/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { BlogService } from './blog.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('BlogService', () => {
  let service: BlogService;

  const mockPrismaService = {
    blogPost: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlogService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<BlogService>(BlogService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll (public)', () => {
    it('should return only published posts by default', async () => {
      // Arrange
      const mockPosts = [
        { id: '1', title: 'Post 1', slug: 'post-1', isPublished: true },
        { id: '2', title: 'Post 2', slug: 'post-2', isPublished: true },
      ];
      mockPrismaService.blogPost.findMany.mockResolvedValue(mockPosts);

      // Act
      const result = await service.findAllPublished();

      // Assert
      expect(result).toEqual(mockPosts);
      expect(mockPrismaService.blogPost.findMany).toHaveBeenCalledWith({
        where: { isPublished: true },
        orderBy: { publishedAt: 'desc' },
        take: undefined,
        skip: undefined,
      });
    });

    it('should support pagination (take, skip)', async () => {
      // Arrange
      const mockPosts = [{ id: '1', title: 'Post 1', slug: 'post-1' }];
      mockPrismaService.blogPost.findMany.mockResolvedValue(mockPosts);

      // Act
      const result = await service.findAllPublished({ take: 10, skip: 5 });

      // Assert
      expect(result).toEqual(mockPosts);
      expect(mockPrismaService.blogPost.findMany).toHaveBeenCalledWith({
        where: { isPublished: true },
        orderBy: { publishedAt: 'desc' },
        take: 10,
        skip: 5,
      });
    });
  });

  describe('findAll (admin)', () => {
    it('should return all posts for admin', async () => {
      // Arrange
      const mockPosts = [
        { id: '1', title: 'Post 1', isPublished: true },
        { id: '2', title: 'Draft', isPublished: false },
      ];
      mockPrismaService.blogPost.findMany.mockResolvedValue(mockPosts);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual(mockPosts);
      expect(mockPrismaService.blogPost.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
        take: undefined,
        skip: undefined,
      });
    });
  });

  describe('findBySlug (public)', () => {
    it('should return published post by slug', async () => {
      // Arrange
      const mockPost = {
        id: '1',
        title: 'Post 1',
        slug: 'post-1',
        isPublished: true,
      };
      mockPrismaService.blogPost.findUnique.mockResolvedValue(mockPost);

      // Act
      const result = await service.findBySlugPublished('post-1');

      // Assert
      expect(result).toEqual(mockPost);
      expect(mockPrismaService.blogPost.findUnique).toHaveBeenCalledWith({
        where: { slug: 'post-1', isPublished: true },
      });
    });

    it('should return null for unpublished post', async () => {
      // Arrange
      mockPrismaService.blogPost.findUnique.mockResolvedValue(null);

      // Act
      const result = await service.findBySlugPublished('draft-post');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create draft post by default', async () => {
      // Arrange
      const createInput = {
        title: 'New Post',
        slug: 'new-post',
        content: 'Post content here',
      };
      const createdPost = {
        id: '1',
        ...createInput,
        isPublished: false,
        publishedAt: null,
      };
      mockPrismaService.blogPost.findUnique.mockResolvedValue(null);
      mockPrismaService.blogPost.create.mockResolvedValue(createdPost);

      // Act
      const result = await service.create(createInput);

      // Assert
      expect(result).toEqual(createdPost);
      expect(result.isPublished).toBe(false);
      expect(result.publishedAt).toBeNull();
    });

    it('should set publishedAt when isPublished is true', async () => {
      // Arrange
      const createInput = {
        title: 'New Post',
        slug: 'new-post',
        content: 'Post content here',
        isPublished: true,
      };
      const now = new Date();
      const createdPost = {
        id: '1',
        ...createInput,
        publishedAt: now,
      };
      mockPrismaService.blogPost.findUnique.mockResolvedValue(null);
      mockPrismaService.blogPost.create.mockResolvedValue(createdPost);

      // Act
      await service.create(createInput);

      // Assert
      expect(mockPrismaService.blogPost.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          publishedAt: expect.any(Date),
        }),
      });
    });

    it('should throw ConflictException for duplicate slug', async () => {
      // Arrange
      const createInput = {
        title: 'New Post',
        slug: 'existing-slug',
        content: 'Post content',
      };
      mockPrismaService.blogPost.findUnique.mockResolvedValue({
        id: '1',
        slug: 'existing-slug',
      });

      // Act & Assert
      await expect(service.create(createInput)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('update', () => {
    it('should update existing post', async () => {
      // Arrange
      const updateInput = { title: 'Updated Title' };
      const existingPost = {
        id: '1',
        title: 'Old Title',
        slug: 'post-1',
        isPublished: false,
      };
      const updatedPost = { ...existingPost, ...updateInput };
      mockPrismaService.blogPost.findUnique.mockResolvedValue(existingPost);
      mockPrismaService.blogPost.update.mockResolvedValue(updatedPost);

      // Act
      const result = await service.update('1', updateInput);

      // Assert
      expect(result).toEqual(updatedPost);
    });

    it('should set publishedAt when publishing', async () => {
      // Arrange
      const updateInput = { isPublished: true };
      const existingPost = {
        id: '1',
        title: 'Post',
        isPublished: false,
        publishedAt: null,
      };
      mockPrismaService.blogPost.findUnique.mockResolvedValue(existingPost);
      mockPrismaService.blogPost.update.mockResolvedValue({
        ...existingPost,
        isPublished: true,
        publishedAt: new Date(),
      });

      // Act
      await service.update('1', updateInput);

      // Assert
      expect(mockPrismaService.blogPost.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: expect.objectContaining({
          isPublished: true,
          publishedAt: expect.any(Date),
        }),
      });
    });

    it('should throw NotFoundException for non-existent id', async () => {
      // Arrange
      mockPrismaService.blogPost.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.update('non-existent', { title: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete existing post', async () => {
      // Arrange
      const existingPost = { id: '1', title: 'Post', slug: 'post-1' };
      mockPrismaService.blogPost.findUnique.mockResolvedValue(existingPost);
      mockPrismaService.blogPost.delete.mockResolvedValue(existingPost);

      // Act
      const result = await service.delete('1');

      // Assert
      expect(result).toEqual(existingPost);
    });

    it('should throw NotFoundException for non-existent id', async () => {
      // Arrange
      mockPrismaService.blogPost.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.delete('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
