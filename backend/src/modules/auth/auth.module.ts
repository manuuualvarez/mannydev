import { Module } from '@nestjs/common';
import { AuthResolver } from './auth.resolver.js';

@Module({
  providers: [AuthResolver],
  exports: [AuthResolver],
})
export class AuthModule {}
