import { Test, TestingModule } from '@nestjs/testing';
import { DashboardResolver } from './dashboard.resolver';
import { DashboardService } from './dashboard.service';

describe('DashboardResolver', () => {
  let resolver: DashboardResolver;
  let mockDashboardService: any;

  beforeEach(async () => {
    mockDashboardService = {
      getStats: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardResolver,
        { provide: DashboardService, useValue: mockDashboardService },
      ],
    }).compile();

    resolver = module.get<DashboardResolver>(DashboardResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('should return dashboard stats', async () => {
    const mockStats = {
      totalServices: 4,
      activeServices: 3,
      totalBlogPosts: 2,
      publishedBlogPosts: 1,
      draftBlogPosts: 1,
      totalLeads: 10,
      newLeads: 5,
      contactedLeads: 3,
      qualifiedLeads: 2,
      leadsThisMonth: 7,
      leadsLastMonth: 3,
      totalUsers: 15,
    };

    mockDashboardService.getStats.mockResolvedValue(mockStats);

    const result = await resolver.dashboardStats();
    expect(result).toEqual(mockStats);
  });

  it('should have @Roles("admin") decorator', () => {
    // Verify the resolver method has the admin role guard
    const metadata = Reflect.getMetadata('roles', DashboardResolver.prototype.dashboardStats);
    expect(metadata).toContain('admin');
  });
});
