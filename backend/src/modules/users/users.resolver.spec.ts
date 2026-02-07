/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';

describe('UsersResolver', () => {
  let resolver: UsersResolver;

  const mockUsersService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByClerkId: jest.fn(),
    create: jest.fn(),
    updateRole: jest.fn(),
    count: jest.fn(),
    delete: jest.fn(),
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
        UsersResolver,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    resolver = module.get<UsersResolver>(UsersResolver);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('Query: users', () => {
    it('should return all users', async () => {
      // Arrange
      const mockUsers = [mockAdminUser, mockUser];
      mockUsersService.findAll.mockResolvedValue(mockUsers);

      // Act
      const result = await resolver.users();

      // Assert
      expect(result).toEqual(mockUsers);
      expect(mockUsersService.findAll).toHaveBeenCalled();
    });

    it('should return empty array when no users exist', async () => {
      // Arrange
      mockUsersService.findAll.mockResolvedValue([]);

      // Act
      const result = await resolver.users();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('Query: user', () => {
    it('should return user by id', async () => {
      // Arrange
      mockUsersService.findOne.mockResolvedValue(mockUser);

      // Act
      const result = await resolver.user('cuid-123');

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockUsersService.findOne).toHaveBeenCalledWith('cuid-123');
    });

    it('should return null for non-existent user', async () => {
      // Arrange
      mockUsersService.findOne.mockResolvedValue(null);

      // Act
      const result = await resolver.user('non-existent');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('Query: usersCount', () => {
    it('should return user count', async () => {
      // Arrange
      mockUsersService.count.mockResolvedValue(42);

      // Act
      const result = await resolver.usersCount();

      // Assert
      expect(result).toBe(42);
      expect(mockUsersService.count).toHaveBeenCalled();
    });
  });

  describe('Mutation: updateUserRole', () => {
    it('should update user role', async () => {
      // Arrange
      const updateInput = { role: 'ADMIN' };
      const updatedUser = { ...mockUser, role: 'ADMIN' };
      mockUsersService.updateRole.mockResolvedValue(updatedUser);

      // Act
      const result = await resolver.updateUserRole('cuid-123', updateInput);

      // Assert
      expect(result).toEqual(updatedUser);
      expect(result.role).toBe('ADMIN');
      expect(mockUsersService.updateRole).toHaveBeenCalledWith(
        'cuid-123',
        updateInput,
      );
    });
  });

  describe('Mutation: deleteUser', () => {
    it('should delete user and return the deleted user', async () => {
      // Arrange
      mockUsersService.delete.mockResolvedValue(mockUser);

      // Act
      const result = await resolver.deleteUser('cuid-123');

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockUsersService.delete).toHaveBeenCalledWith('cuid-123');
    });
  });

  describe('Decorators', () => {
    it('should have @Roles("admin") on users query', () => {
      const metadata = Reflect.getMetadata(
        'roles',
        UsersResolver.prototype.users,
      );
      expect(metadata).toContain('admin');
    });

    it('should have @Roles("admin") on user query', () => {
      const metadata = Reflect.getMetadata(
        'roles',
        UsersResolver.prototype.user,
      );
      expect(metadata).toContain('admin');
    });

    it('should have @Roles("admin") on usersCount query', () => {
      const metadata = Reflect.getMetadata(
        'roles',
        UsersResolver.prototype.usersCount,
      );
      expect(metadata).toContain('admin');
    });

    it('should have @Roles("admin") on updateUserRole mutation', () => {
      const metadata = Reflect.getMetadata(
        'roles',
        UsersResolver.prototype.updateUserRole,
      );
      expect(metadata).toContain('admin');
    });

    it('should have @Roles("admin") on deleteUser mutation', () => {
      const metadata = Reflect.getMetadata(
        'roles',
        UsersResolver.prototype.deleteUser,
      );
      expect(metadata).toContain('admin');
    });
  });
});
