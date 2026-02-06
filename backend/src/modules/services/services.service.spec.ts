import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ServicesService } from './services.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('ServicesService', () => {
  let service: ServicesService;

  const mockPrismaService = {
    service: {
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
        ServicesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ServicesService>(ServicesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all services when no filter provided', async () => {
      // Arrange
      const mockServices = [
        { id: '1', name: 'Service 1', slug: 'service-1', order: 0 },
        { id: '2', name: 'Service 2', slug: 'service-2', order: 1 },
      ];
      mockPrismaService.service.findMany.mockResolvedValue(mockServices);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual(mockServices);
      expect(mockPrismaService.service.findMany).toHaveBeenCalledWith({
        where: undefined,
        orderBy: { order: 'asc' },
      });
    });

    it('should return only active services when filtered', async () => {
      // Arrange
      const mockServices = [
        { id: '1', name: 'Service 1', slug: 'service-1', isActive: true },
      ];
      mockPrismaService.service.findMany.mockResolvedValue(mockServices);

      // Act
      const result = await service.findAll({ isActive: true });

      // Assert
      expect(result).toEqual(mockServices);
      expect(mockPrismaService.service.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { order: 'asc' },
      });
    });

    it('should return services ordered by order field', async () => {
      // Arrange
      const mockServices = [
        { id: '1', name: 'First', order: 0 },
        { id: '2', name: 'Second', order: 1 },
        { id: '3', name: 'Third', order: 2 },
      ];
      mockPrismaService.service.findMany.mockResolvedValue(mockServices);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result[0].order).toBe(0);
      expect(result[1].order).toBe(1);
      expect(mockPrismaService.service.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { order: 'asc' } }),
      );
    });
  });

  describe('findOne', () => {
    it('should return service by id', async () => {
      // Arrange
      const mockService = { id: '1', name: 'Service 1', slug: 'service-1' };
      mockPrismaService.service.findUnique.mockResolvedValue(mockService);

      // Act
      const result = await service.findOne('1');

      // Assert
      expect(result).toEqual(mockService);
      expect(mockPrismaService.service.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should return null for non-existent id', async () => {
      // Arrange
      mockPrismaService.service.findUnique.mockResolvedValue(null);

      // Act
      const result = await service.findOne('non-existent');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findBySlug', () => {
    it('should return service by slug', async () => {
      // Arrange
      const mockService = { id: '1', name: 'Service 1', slug: 'service-1' };
      mockPrismaService.service.findUnique.mockResolvedValue(mockService);

      // Act
      const result = await service.findBySlug('service-1');

      // Assert
      expect(result).toEqual(mockService);
      expect(mockPrismaService.service.findUnique).toHaveBeenCalledWith({
        where: { slug: 'service-1' },
      });
    });

    it('should return null for non-existent slug', async () => {
      // Arrange
      mockPrismaService.service.findUnique.mockResolvedValue(null);

      // Act
      const result = await service.findBySlug('non-existent');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new service', async () => {
      // Arrange
      const createInput = {
        name: 'New Service',
        slug: 'new-service',
        description: 'A new service description',
      };
      const createdService = { id: '1', ...createInput, order: 0, isActive: true };
      mockPrismaService.service.findUnique.mockResolvedValue(null);
      mockPrismaService.service.create.mockResolvedValue(createdService);

      // Act
      const result = await service.create(createInput);

      // Assert
      expect(result).toEqual(createdService);
      expect(mockPrismaService.service.create).toHaveBeenCalledWith({
        data: createInput,
      });
    });

    it('should throw ConflictException for duplicate slug', async () => {
      // Arrange
      const createInput = {
        name: 'Existing Service',
        slug: 'existing-slug',
        description: 'Description',
      };
      mockPrismaService.service.findUnique.mockResolvedValue({ id: '1', slug: 'existing-slug' });

      // Act & Assert
      await expect(service.create(createInput)).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should update existing service', async () => {
      // Arrange
      const updateInput = { name: 'Updated Name' };
      const existingService = { id: '1', name: 'Old Name', slug: 'service-1' };
      const updatedService = { ...existingService, ...updateInput };
      mockPrismaService.service.findUnique.mockResolvedValue(existingService);
      mockPrismaService.service.update.mockResolvedValue(updatedService);

      // Act
      const result = await service.update('1', updateInput);

      // Assert
      expect(result).toEqual(updatedService);
      expect(mockPrismaService.service.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateInput,
      });
    });

    it('should throw NotFoundException for non-existent id', async () => {
      // Arrange
      mockPrismaService.service.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update('non-existent', { name: 'Test' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should delete existing service', async () => {
      // Arrange
      const existingService = { id: '1', name: 'Service', slug: 'service-1' };
      mockPrismaService.service.findUnique.mockResolvedValue(existingService);
      mockPrismaService.service.delete.mockResolvedValue(existingService);

      // Act
      const result = await service.delete('1');

      // Assert
      expect(result).toEqual(existingService);
      expect(mockPrismaService.service.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException for non-existent id', async () => {
      // Arrange
      mockPrismaService.service.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.delete('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create with translations', () => {
    it('should create a service with translations', async () => {
      const input = {
        name: 'Desarrollo Web',
        slug: 'desarrollo-web',
        description: 'Creamos aplicaciones web modernas y escalables para tu negocio.',
        translations: {
          es: { name: 'Desarrollo Web', description: 'Creamos aplicaciones web modernas...' },
          en: { name: 'Web Development', description: 'We build modern web applications...' },
        },
      };

      mockPrismaService.service.findUnique.mockResolvedValue(null);
      mockPrismaService.service.create.mockResolvedValue({
        id: 'test-id',
        ...input,
        icon: null,
        order: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.create(input);
      expect(result.translations).toEqual(input.translations);
      expect(mockPrismaService.service.create).toHaveBeenCalledWith({
        data: input,
      });
    });

    it('should create a service without translations (backward compatible)', async () => {
      const input = {
        name: 'Mobile Development',
        slug: 'mobile-dev',
        description: 'We build mobile apps for iOS and Android.',
      };

      mockPrismaService.service.findUnique.mockResolvedValue(null);
      mockPrismaService.service.create.mockResolvedValue({
        id: 'test-id',
        ...input,
        translations: null,
        icon: null,
        order: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.create(input);
      expect(result.translations).toBeNull();
    });

    it('should update service translations', async () => {
      const existingService = {
        id: 'test-id',
        name: 'Desarrollo Web',
        slug: 'desarrollo-web',
        description: 'Original',
        translations: { es: { name: 'Desarrollo Web' } },
        icon: null,
        order: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updateInput = {
        translations: {
          es: { name: 'Desarrollo Web', description: 'Creamos apps...' },
          en: { name: 'Web Development', description: 'We build apps...' },
        },
      };

      mockPrismaService.service.findUnique.mockResolvedValue(existingService);
      mockPrismaService.service.update.mockResolvedValue({
        ...existingService,
        ...updateInput,
      });

      const result = await service.update('test-id', updateInput);
      expect(result.translations).toEqual(updateInput.translations);
    });
  });

  describe('startingPrice', () => {
    it('should create service with startingPrice', async () => {
      // Arrange
      const createInput = {
        name: 'Premium Service',
        slug: 'premium-service',
        description: 'A premium service with pricing information',
        startingPrice: 29900,
      };
      const createdService = {
        id: 'price-1',
        ...createInput,
        icon: null,
        order: 0,
        isActive: true,
        translations: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrismaService.service.findUnique.mockResolvedValue(null);
      mockPrismaService.service.create.mockResolvedValue(createdService);

      // Act
      const result = await service.create(createInput);

      // Assert
      expect(result.startingPrice).toBe(29900);
      expect(mockPrismaService.service.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ startingPrice: 29900 }),
      });
    });

    it('should create service without startingPrice (null)', async () => {
      // Arrange
      const createInput = {
        name: 'Basic Service',
        slug: 'basic-service',
        description: 'A basic service without pricing',
      };
      const createdService = {
        id: 'price-2',
        ...createInput,
        startingPrice: null,
        icon: null,
        order: 0,
        isActive: true,
        translations: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrismaService.service.findUnique.mockResolvedValue(null);
      mockPrismaService.service.create.mockResolvedValue(createdService);

      // Act
      const result = await service.create(createInput);

      // Assert
      expect(result.startingPrice).toBeNull();
    });

    it('should update service startingPrice', async () => {
      // Arrange
      const existingService = {
        id: 'price-3',
        name: 'Existing Service',
        slug: 'existing-service',
        description: 'An existing service',
        startingPrice: 19900,
        icon: null,
        order: 0,
        isActive: true,
        translations: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const updateInput = { startingPrice: 49900 };
      mockPrismaService.service.findUnique.mockResolvedValue(existingService);
      mockPrismaService.service.update.mockResolvedValue({
        ...existingService,
        startingPrice: 49900,
      });

      // Act
      const result = await service.update('price-3', updateInput);

      // Assert
      expect(result.startingPrice).toBe(49900);
      expect(mockPrismaService.service.update).toHaveBeenCalledWith({
        where: { id: 'price-3' },
        data: expect.objectContaining({ startingPrice: 49900 }),
      });
    });

    it('should return services with startingPrice field', async () => {
      // Arrange
      const mockServices = [
        { id: '1', name: 'Service A', slug: 'service-a', order: 0, startingPrice: 29900 },
        { id: '2', name: 'Service B', slug: 'service-b', order: 1, startingPrice: null },
        { id: '3', name: 'Service C', slug: 'service-c', order: 2, startingPrice: 99900 },
      ];
      mockPrismaService.service.findMany.mockResolvedValue(mockServices);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result[0].startingPrice).toBe(29900);
      expect(result[1].startingPrice).toBeNull();
      expect(result[2].startingPrice).toBe(99900);
    });
  });

  describe('count', () => {
    it('should count all services', async () => {
      mockPrismaService.service.count.mockResolvedValue(6);
      const result = await service.count();
      expect(result).toBe(6);
      expect(mockPrismaService.service.count).toHaveBeenCalledWith({
        where: undefined,
      });
    });

    it('should count active services only', async () => {
      mockPrismaService.service.count.mockResolvedValue(4);
      const result = await service.count(true);
      expect(result).toBe(4);
      expect(mockPrismaService.service.count).toHaveBeenCalledWith({
        where: { isActive: true },
      });
    });

    it('should count inactive services only', async () => {
      mockPrismaService.service.count.mockResolvedValue(2);
      const result = await service.count(false);
      expect(result).toBe(2);
      expect(mockPrismaService.service.count).toHaveBeenCalledWith({
        where: { isActive: false },
      });
    });
  });
});
