/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('DashboardService', () => {
  let service: DashboardService;

  let mockPrisma: any;

  beforeEach(async () => {
    mockPrisma = {
      service: { count: jest.fn() },
      blogPost: { count: jest.fn() },
      lead: { count: jest.fn() },
      user: { count: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  it('should return all dashboard stats correctly', async () => {
    // Mock counts in order of Promise.all calls
    mockPrisma.service.count
      .mockResolvedValueOnce(6) // totalServices
      .mockResolvedValueOnce(4); // activeServices

    mockPrisma.blogPost.count
      .mockResolvedValueOnce(5) // totalBlogPosts
      .mockResolvedValueOnce(3) // publishedBlogPosts
      .mockResolvedValueOnce(2); // draftBlogPosts

    mockPrisma.lead.count
      .mockResolvedValueOnce(20) // totalLeads
      .mockResolvedValueOnce(8) // newLeads
      .mockResolvedValueOnce(5) // contactedLeads
      .mockResolvedValueOnce(3) // qualifiedLeads
      .mockResolvedValueOnce(12) // leadsThisMonth
      .mockResolvedValueOnce(8); // leadsLastMonth

    mockPrisma.user.count.mockResolvedValueOnce(15); // totalUsers

    const result = await service.getStats();

    expect(result).toEqual({
      totalServices: 6,
      activeServices: 4,
      totalBlogPosts: 5,
      publishedBlogPosts: 3,
      draftBlogPosts: 2,
      totalLeads: 20,
      newLeads: 8,
      contactedLeads: 5,
      qualifiedLeads: 3,
      leadsThisMonth: 12,
      leadsLastMonth: 8,
      totalUsers: 15,
    });

    // Verify Promise.all was used (12 total count calls)
    expect(mockPrisma.service.count).toHaveBeenCalledTimes(2);
    expect(mockPrisma.blogPost.count).toHaveBeenCalledTimes(3);
    expect(mockPrisma.lead.count).toHaveBeenCalledTimes(6);
    expect(mockPrisma.user.count).toHaveBeenCalledTimes(1);
  });

  it('should use correct date ranges for monthly lead counts', async () => {
    // Setup all mocks
    mockPrisma.service.count.mockResolvedValue(0);
    mockPrisma.blogPost.count.mockResolvedValue(0);
    mockPrisma.lead.count.mockResolvedValue(0);
    mockPrisma.user.count.mockResolvedValue(0);

    await service.getStats();

    // Get the calls to lead.count
    const leadCountCalls = mockPrisma.lead.count.mock.calls;

    // 5th call (index 4) = leadsThisMonth
    const thisMonthWhere = leadCountCalls[4][0]?.where;
    expect(thisMonthWhere).toHaveProperty('createdAt');
    expect(thisMonthWhere.createdAt).toHaveProperty('gte');

    // 6th call (index 5) = leadsLastMonth
    const lastMonthWhere = leadCountCalls[5][0]?.where;
    expect(lastMonthWhere).toHaveProperty('createdAt');
    expect(lastMonthWhere.createdAt).toHaveProperty('gte');
    expect(lastMonthWhere.createdAt).toHaveProperty('lt');
  });

  it('should handle empty database gracefully', async () => {
    mockPrisma.service.count.mockResolvedValue(0);
    mockPrisma.blogPost.count.mockResolvedValue(0);
    mockPrisma.lead.count.mockResolvedValue(0);
    mockPrisma.user.count.mockResolvedValue(0);

    const result = await service.getStats();

    expect(result.totalServices).toBe(0);
    expect(result.totalBlogPosts).toBe(0);
    expect(result.totalLeads).toBe(0);
    expect(result.leadsThisMonth).toBe(0);
    expect(result.leadsLastMonth).toBe(0);
    expect(result.totalUsers).toBe(0);
  });
});
