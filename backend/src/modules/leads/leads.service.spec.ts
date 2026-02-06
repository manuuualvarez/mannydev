import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { PrismaService } from '../../prisma/prisma.service';
import { LeadStatus } from './entities/lead.entity';

describe('LeadsService', () => {
  let service: LeadsService;

  const mockPrismaService = {
    lead: {
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
        LeadsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<LeadsService>(LeadsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create lead with status NEW', async () => {
      // Arrange
      const createInput = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'I need help with my project',
      };
      const createdLead = {
        id: '1',
        ...createInput,
        status: 'NEW',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrismaService.lead.create.mockResolvedValue(createdLead);

      // Act
      const result = await service.create(createInput);

      // Assert
      expect(result).toEqual(createdLead);
      expect(result.status).toBe('NEW');
      expect(mockPrismaService.lead.create).toHaveBeenCalledWith({
        data: createInput,
      });
    });

    it('should create lead with company if provided', async () => {
      // Arrange
      const createInput = {
        name: 'John Doe',
        email: 'john@example.com',
        company: 'Acme Inc',
        message: 'I need help with my project',
      };
      const createdLead = {
        id: '1',
        ...createInput,
        status: 'NEW',
      };
      mockPrismaService.lead.create.mockResolvedValue(createdLead);

      // Act
      const result = await service.create(createInput);

      // Assert
      expect(result.company).toBe('Acme Inc');
    });
  });

  describe('findAll', () => {
    it('should return all leads', async () => {
      // Arrange
      const mockLeads = [
        { id: '1', name: 'John', email: 'john@example.com', status: 'NEW' },
        { id: '2', name: 'Jane', email: 'jane@example.com', status: 'CONTACTED' },
      ];
      mockPrismaService.lead.findMany.mockResolvedValue(mockLeads);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual(mockLeads);
      expect(mockPrismaService.lead.findMany).toHaveBeenCalledWith({
        where: undefined,
        orderBy: { createdAt: 'desc' },
        take: undefined,
        skip: undefined,
      });
    });

    it('should filter by status', async () => {
      // Arrange
      const mockLeads = [
        { id: '1', name: 'John', email: 'john@example.com', status: 'NEW' },
      ];
      mockPrismaService.lead.findMany.mockResolvedValue(mockLeads);

      // Act
      const result = await service.findAll({ status: LeadStatus.NEW });

      // Assert
      expect(result).toEqual(mockLeads);
      expect(mockPrismaService.lead.findMany).toHaveBeenCalledWith({
        where: { status: LeadStatus.NEW },
        orderBy: { createdAt: 'desc' },
        take: undefined,
        skip: undefined,
      });
    });
  });

  describe('findOne', () => {
    it('should return lead by id', async () => {
      // Arrange
      const mockLead = { id: '1', name: 'John', email: 'john@example.com' };
      mockPrismaService.lead.findUnique.mockResolvedValue(mockLead);

      // Act
      const result = await service.findOne('1');

      // Assert
      expect(result).toEqual(mockLead);
    });

    it('should return null for non-existent id', async () => {
      // Arrange
      mockPrismaService.lead.findUnique.mockResolvedValue(null);

      // Act
      const result = await service.findOne('non-existent');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update lead status', async () => {
      // Arrange
      const existingLead = { id: '1', name: 'John', status: 'NEW' };
      const updatedLead = { ...existingLead, status: 'CONTACTED' };
      mockPrismaService.lead.findUnique.mockResolvedValue(existingLead);
      mockPrismaService.lead.update.mockResolvedValue(updatedLead);

      // Act
      const result = await service.update('1', { status: LeadStatus.CONTACTED });

      // Assert
      expect(result.status).toBe('CONTACTED');
    });

    it('should update notes', async () => {
      // Arrange
      const existingLead = { id: '1', name: 'John', notes: null };
      const updatedLead = { ...existingLead, notes: 'Followed up via email' };
      mockPrismaService.lead.findUnique.mockResolvedValue(existingLead);
      mockPrismaService.lead.update.mockResolvedValue(updatedLead);

      // Act
      const result = await service.update('1', { notes: 'Followed up via email' });

      // Assert
      expect(result.notes).toBe('Followed up via email');
    });

    it('should throw NotFoundException for non-existent id', async () => {
      // Arrange
      mockPrismaService.lead.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.update('non-existent', { status: LeadStatus.CONTACTED }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete existing lead', async () => {
      // Arrange
      const existingLead = { id: '1', name: 'John', email: 'john@example.com' };
      mockPrismaService.lead.findUnique.mockResolvedValue(existingLead);
      mockPrismaService.lead.delete.mockResolvedValue(existingLead);

      // Act
      const result = await service.delete('1');

      // Assert
      expect(result).toEqual(existingLead);
    });

    it('should throw NotFoundException for non-existent id', async () => {
      // Arrange
      mockPrismaService.lead.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.delete('non-existent')).rejects.toThrow(NotFoundException);
    });
  });
});
