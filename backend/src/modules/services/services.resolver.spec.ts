import { Test, TestingModule } from '@nestjs/testing';
import { ServicesResolver } from './services.resolver';
import { ServicesService } from './services.service';

describe('ServicesResolver', () => {
  let resolver: ServicesResolver;

  const mockServicesService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findBySlug: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServicesResolver,
        {
          provide: ServicesService,
          useValue: mockServicesService,
        },
      ],
    }).compile();

    resolver = module.get<ServicesResolver>(ServicesResolver);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Query: services', () => {
    it('should return all services', async () => {
      // Arrange
      const mockServices = [
        { id: '1', name: 'Service 1', slug: 'service-1' },
        { id: '2', name: 'Service 2', slug: 'service-2' },
      ];
      mockServicesService.findAll.mockResolvedValue(mockServices);

      // Act
      const result = await resolver.services();

      // Assert
      expect(result).toEqual(mockServices);
      expect(mockServicesService.findAll).toHaveBeenCalled();
    });

    it('should support filtering by isActive', async () => {
      // Arrange
      const mockServices = [{ id: '1', name: 'Active Service', isActive: true }];
      mockServicesService.findAll.mockResolvedValue(mockServices);

      // Act
      const result = await resolver.services({ isActive: true });

      // Assert
      expect(result).toEqual(mockServices);
      expect(mockServicesService.findAll).toHaveBeenCalledWith({ isActive: true });
    });
  });

  describe('Query: service', () => {
    it('should return service by id', async () => {
      // Arrange
      const mockService = { id: '1', name: 'Service 1', slug: 'service-1' };
      mockServicesService.findOne.mockResolvedValue(mockService);

      // Act
      const result = await resolver.service('1');

      // Assert
      expect(result).toEqual(mockService);
      expect(mockServicesService.findOne).toHaveBeenCalledWith('1');
    });

    it('should return null for non-existent service', async () => {
      // Arrange
      mockServicesService.findOne.mockResolvedValue(null);

      // Act
      const result = await resolver.service('non-existent');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('Query: serviceBySlug', () => {
    it('should return service by slug', async () => {
      // Arrange
      const mockService = { id: '1', name: 'Service 1', slug: 'service-1' };
      mockServicesService.findBySlug.mockResolvedValue(mockService);

      // Act
      const result = await resolver.serviceBySlug('service-1');

      // Assert
      expect(result).toEqual(mockService);
      expect(mockServicesService.findBySlug).toHaveBeenCalledWith('service-1');
    });
  });

  describe('Mutation: createService', () => {
    it('should create a new service', async () => {
      // Arrange
      const createInput = {
        name: 'New Service',
        slug: 'new-service',
        description: 'A new service description',
      };
      const createdService = { id: '1', ...createInput };
      mockServicesService.create.mockResolvedValue(createdService);

      // Act
      const result = await resolver.createService(createInput);

      // Assert
      expect(result).toEqual(createdService);
      expect(mockServicesService.create).toHaveBeenCalledWith(createInput);
    });
  });

  describe('Mutation: updateService', () => {
    it('should update existing service', async () => {
      // Arrange
      const updateInput = { name: 'Updated Name' };
      const updatedService = { id: '1', name: 'Updated Name', slug: 'service-1' };
      mockServicesService.update.mockResolvedValue(updatedService);

      // Act
      const result = await resolver.updateService('1', updateInput);

      // Assert
      expect(result).toEqual(updatedService);
      expect(mockServicesService.update).toHaveBeenCalledWith('1', updateInput);
    });
  });

  describe('Mutation: deleteService', () => {
    it('should delete existing service', async () => {
      // Arrange
      const deletedService = { id: '1', name: 'Service', slug: 'service-1' };
      mockServicesService.delete.mockResolvedValue(deletedService);

      // Act
      const result = await resolver.deleteService('1');

      // Assert
      expect(result).toEqual(deletedService);
      expect(mockServicesService.delete).toHaveBeenCalledWith('1');
    });
  });

  describe('startingPrice support', () => {
    it('should create service with startingPrice via resolver', async () => {
      // Arrange
      const createInput = {
        name: 'Premium Service',
        slug: 'premium-service',
        description: 'A premium service',
        startingPrice: 29900,
      };
      const createdService = { id: '1', ...createInput };
      mockServicesService.create.mockResolvedValue(createdService);

      // Act
      const result = await resolver.createService(createInput);

      // Assert
      expect(result.startingPrice).toBe(29900);
      expect(mockServicesService.create).toHaveBeenCalledWith(createInput);
    });

    it('should return services with startingPrice field', async () => {
      // Arrange
      const mockServices = [
        { id: '1', name: 'Service 1', slug: 'service-1', startingPrice: 29900 },
        { id: '2', name: 'Service 2', slug: 'service-2', startingPrice: null },
      ];
      mockServicesService.findAll.mockResolvedValue(mockServices);

      // Act
      const result = await resolver.services();

      // Assert
      expect(result[0].startingPrice).toBe(29900);
      expect(result[1].startingPrice).toBeNull();
    });

    it('should update service startingPrice via resolver', async () => {
      // Arrange
      const updateInput = { startingPrice: 49900 };
      const updatedService = { id: '1', name: 'Service', slug: 'service-1', startingPrice: 49900 };
      mockServicesService.update.mockResolvedValue(updatedService);

      // Act
      const result = await resolver.updateService('1', updateInput);

      // Assert
      expect(result.startingPrice).toBe(49900);
      expect(mockServicesService.update).toHaveBeenCalledWith('1', updateInput);
    });
  });

  describe('servicesCount', () => {
    it('should return service count', async () => {
      mockServicesService.count.mockResolvedValue(4);
      const result = await resolver.servicesCount(true);
      expect(result).toBe(4);
      expect(mockServicesService.count).toHaveBeenCalledWith(true);
    });

    it('should return total count when isActive is undefined', async () => {
      mockServicesService.count.mockResolvedValue(6);
      const result = await resolver.servicesCount();
      expect(result).toBe(6);
    });
  });
});
