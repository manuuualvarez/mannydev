import { Resolver, Query } from '@nestjs/graphql';
import { DashboardService } from './dashboard.service.js';
import { DashboardStats } from './entities/dashboard-stats.entity.js';
import { Roles } from '../../common/decorators/roles.decorator.js';

@Resolver()
export class DashboardResolver {
  constructor(private readonly dashboardService: DashboardService) {}

  @Roles('admin')
  @Query(() => DashboardStats, { name: 'dashboardStats' })
  async dashboardStats() {
    return this.dashboardService.getStats();
  }
}
