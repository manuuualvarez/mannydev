import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    this.logger.log('Fetching dashboard stats');

    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayLastMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1,
    );

    // Execute all counts in parallel
    const [
      totalServices,
      activeServices,
      totalBlogPosts,
      publishedBlogPosts,
      draftBlogPosts,
      totalLeads,
      newLeads,
      contactedLeads,
      qualifiedLeads,
      leadsThisMonth,
      leadsLastMonth,
      totalUsers,
    ] = await Promise.all([
      this.prisma.service.count(),
      this.prisma.service.count({ where: { isActive: true } }),
      this.prisma.blogPost.count(),
      this.prisma.blogPost.count({ where: { isPublished: true } }),
      this.prisma.blogPost.count({ where: { isPublished: false } }),
      this.prisma.lead.count(),
      this.prisma.lead.count({ where: { status: 'NEW' } }),
      this.prisma.lead.count({ where: { status: 'CONTACTED' } }),
      this.prisma.lead.count({ where: { status: 'QUALIFIED' } }),
      this.prisma.lead.count({
        where: { createdAt: { gte: firstDayThisMonth } },
      }),
      this.prisma.lead.count({
        where: {
          createdAt: {
            gte: firstDayLastMonth,
            lt: firstDayThisMonth,
          },
        },
      }),
      this.prisma.user.count(),
    ]);

    return {
      totalServices,
      activeServices,
      totalBlogPosts,
      publishedBlogPosts,
      draftBlogPosts,
      totalLeads,
      newLeads,
      contactedLeads,
      qualifiedLeads,
      leadsThisMonth,
      leadsLastMonth,
      totalUsers,
    };
  }
}
