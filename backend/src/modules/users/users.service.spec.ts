import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;

  const mockPrismaService = {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  const mockUser = {
    id: 'cuid-123',
    clerkUserId: 'clerk_user_abc',
    role: 'USER',
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  };

  const mockAdminUser = {
    id: 'cuid-456',
    clerkUserId: 'clerk_user_admin',
    role: 'ADMIN',
    createdAt: new Date('2026-01-02T00:00:00Z'),
    updatedAt: new Date('2026-01-02T00:00:00Z'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all users ordered by createdAt desc', async () => {
      // Arrange
      const mockUsers = [mockAdminUser, mockUser];
      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual(mockUsers);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return empty array when no users exist', async () => {
      // Arrange
      mockPrismaService.user.findMany.mockResolvedValue([]);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return user by id', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      // Act
      const result = await service.findOne('cuid-123');

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'cuid-123' },
      });
    });

    it('should return null for non-existent id', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      // Act
      const result = await service.findOne('non-existent');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findByClerkId', () => {
    it('should return user by clerkUserId', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      // Act
      const result = await service.findByClerkId('clerk_user_abc');

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { clerkUserId: 'clerk_user_abc' },
      });
    });

    it('should return null for non-existent clerkUserId', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      // Act
      const result = await service.findByClerkId('non-existent-clerk-id');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new user with default role', async () => {
      // Arrange
      const createInput = { clerkUserId: 'clerk_user_new' };
      const createdUser = {
        id: 'cuid-new',
        clerkUserId: 'clerk_user_new',
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrismaService.user.create.mockResolvedValue(createdUser);

      // Act
      const result = await service.create(createInput);

      // Assert
      expect(result).toEqual(createdUser);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: createInput,
      });
    });

    it('should create a new user with explicit role', async () => {
      // Arrange
      const createInput = { clerkUserId: 'clerk_user_admin_new', role: 'ADMIN' };
      const createdUser = {
        id: 'cuid-admin-new',
        ...createInput,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrismaService.user.create.mockResolvedValue(createdUser);

      // Act
      const result = await service.create(createInput);

      // Assert
      expect(result).toEqual(createdUser);
      expect(result.role).toBe('ADMIN');
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: createInput,
      });
    });
  });

  describe('updateRole', () => {
    it('should update user role', async () => {
      // Arrange
      const updateInput = { role: 'ADMIN' };
      const updatedUser = { ...mockUser, role: 'ADMIN' };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      // Act
      const result = await service.updateRole('cuid-123', updateInput);

      // Assert
      expect(result).toEqual(updatedUser);
      expect(result.role).toBe('ADMIN');
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'cuid-123' },
        data: { role: 'ADMIN' },
      });
    });

    it('should throw NotFoundException for non-existent user', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.updateRole('non-existent', { role: 'ADMIN' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update role to SUPER_ADMIN', async () => {
      // Arrange
      const updateInput = { role: 'SUPER_ADMIN' };
      const updatedUser = { ...mockUser, role: 'SUPER_ADMIN' };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      // Act
      const result = await service.updateRole('cuid-123', updateInput);

      // Assert
      expect(result.role).toBe('SUPER_ADMIN');
    });
  });

  describe('count', () => {
    it('should return total user count', async () => {
      // Arrange
      mockPrismaService.user.count.mockResolvedValue(42);

      // Act
      const result = await service.count();

      // Assert
      expect(result).toBe(42);
      expect(mockPrismaService.user.count).toHaveBeenCalled();
    });

    it('should return zero when no users exist', async () => {
      // Arrange
      mockPrismaService.user.count.mockResolvedValue(0);

      // Act
      const result = await service.count();

      // Assert
      expect(result).toBe(0);
    });
  });

  describe('delete', () => {
    it('should delete existing user', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.delete.mockResolvedValue(mockUser);

      // Act
      const result = await service.delete('cuid-123');

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
        where: { id: 'cuid-123' },
      });
    });

    it('should throw NotFoundException for non-existent user', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.delete('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
