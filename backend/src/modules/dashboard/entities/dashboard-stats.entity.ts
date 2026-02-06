import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class DashboardStats {
  @Field(() => Int)
  totalServices: number;

  @Field(() => Int)
  activeServices: number;

  @Field(() => Int)
  totalBlogPosts: number;

  @Field(() => Int)
  publishedBlogPosts: number;

  @Field(() => Int)
  draftBlogPosts: number;

  @Field(() => Int)
  totalLeads: number;

  @Field(() => Int)
  newLeads: number;

  @Field(() => Int)
  contactedLeads: number;

  @Field(() => Int)
  qualifiedLeads: number;

  @Field(() => Int)
  leadsThisMonth: number;

  @Field(() => Int)
  leadsLastMonth: number;

  @Field(() => Int)
  totalUsers: number;
}
