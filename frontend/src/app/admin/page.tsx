'use client';

import { useQuery } from '@apollo/client/react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Briefcase,
  FileText,
  Users,
  UserCog,
  TrendingUp,
  TrendingDown,
  Plus,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { GET_DASHBOARD_STATS, GET_ADMIN_LEADS } from '@/lib/graphql/admin';
import { cn } from '@/lib/utils';

interface DashboardStats {
  totalServices: number;
  activeServices: number;
  totalBlogPosts: number;
  publishedBlogPosts: number;
  draftBlogPosts: number;
  totalLeads: number;
  newLeads: number;
  contactedLeads: number;
  qualifiedLeads: number;
  leadsThisMonth: number;
  leadsLastMonth: number;
  totalUsers: number;
}

interface Lead {
  id: string;
  name: string;
  email: string;
  status: string;
}

function StatCard({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
}: {
  title: string;
  value: number;
  subtitle?: string;
  trend?: number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="w-4 h-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
        {trend !== undefined && (
          <div
            className={cn(
              'flex items-center gap-1 text-xs mt-1',
              trend >= 0 ? 'text-green-600' : 'text-red-600'
            )}
          >
            {trend >= 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>{Math.abs(Math.round(trend))}% vs last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function FunnelBar({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { data, loading } = useQuery<{ dashboardStats: DashboardStats }>(
    GET_DASHBOARD_STATS
  );
  const { data: leadsData } = useQuery<{ leads: Lead[]; leadsCount: number }>(
    GET_ADMIN_LEADS,
    {
      variables: { pagination: { take: 5 } },
    }
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const stats = data?.dashboardStats;
  const recentLeads = leadsData?.leads || [];

  const leadTrend = stats
    ? ((stats.leadsThisMonth - stats.leadsLastMonth) /
        Math.max(stats.leadsLastMonth, 1)) *
      100
    : 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex gap-3">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/services/new">
              <Plus className="w-4 h-4 mr-2" />
              New Service
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/admin/blog/new">
              <Plus className="w-4 h-4 mr-2" />
              New Post
            </Link>
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Services"
          value={stats?.activeServices ?? 0}
          subtitle={`${stats?.totalServices ?? 0} total`}
          icon={Briefcase}
        />
        <StatCard
          title="Published Posts"
          value={stats?.publishedBlogPosts ?? 0}
          subtitle={`${stats?.draftBlogPosts ?? 0} drafts`}
          icon={FileText}
        />
        <StatCard
          title="Total Leads"
          value={stats?.totalLeads ?? 0}
          subtitle={`${stats?.newLeads ?? 0} new`}
          icon={Users}
        />
        <StatCard
          title="Leads This Month"
          value={stats?.leadsThisMonth ?? 0}
          trend={leadTrend}
          icon={TrendingUp}
        />
        <StatCard
          title="Total Users"
          value={stats?.totalUsers ?? 0}
          icon={UserCog}
        />
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Leads */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Leads</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/leads">
                View all <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-sm">{lead.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {lead.email}
                    </p>
                  </div>
                  <Badge
                    variant={lead.status === 'NEW' ? 'default' : 'secondary'}
                  >
                    {lead.status}
                  </Badge>
                </div>
              ))}
              {recentLeads.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No leads yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Lead Funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Lead Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <FunnelBar
                label="New"
                value={stats?.newLeads ?? 0}
                total={stats?.totalLeads ?? 1}
                color="bg-blue-500"
              />
              <FunnelBar
                label="Contacted"
                value={stats?.contactedLeads ?? 0}
                total={stats?.totalLeads ?? 1}
                color="bg-amber-500"
              />
              <FunnelBar
                label="Qualified"
                value={stats?.qualifiedLeads ?? 0}
                total={stats?.totalLeads ?? 1}
                color="bg-green-500"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
