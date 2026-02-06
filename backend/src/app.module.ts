import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { HealthResolver } from './common/resolvers/health.resolver.js';
import { ClerkAuthGuard } from './common/guards/clerk-auth.guard.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { ServicesModule } from './modules/services/services.module.js';
import { BlogModule } from './modules/blog/blog.module.js';
import { LeadsModule } from './modules/leads/leads.module.js';
import { DashboardModule } from './modules/dashboard/dashboard.module.js';
import { UsersModule } from './modules/users/users.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: process.env.NODE_ENV !== 'production',
      introspection: process.env.NODE_ENV !== 'production',
      context: ({ req }: { req: Request }) => ({ req }),
    }),
    PrismaModule,
    AuthModule,
    ServicesModule,
    BlogModule,
    LeadsModule,
    DashboardModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    HealthResolver,
    {
      provide: APP_GUARD,
      useClass: ClerkAuthGuard,
    },
  ],
})
export class AppModule {}
