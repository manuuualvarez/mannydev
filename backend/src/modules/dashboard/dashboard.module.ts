import { Module } from '@nestjs/common';
import { DashboardResolver } from './dashboard.resolver.js';
import { DashboardService } from './dashboard.service.js';
import { PrismaModule } from '../../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  providers: [DashboardResolver, DashboardService],
})
export class DashboardModule {}
