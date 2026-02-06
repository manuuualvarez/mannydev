import { Module } from '@nestjs/common';
import { LeadsService } from './leads.service.js';
import { LeadsResolver } from './leads.resolver.js';

@Module({
  providers: [LeadsService, LeadsResolver],
  exports: [LeadsService],
})
export class LeadsModule {}
