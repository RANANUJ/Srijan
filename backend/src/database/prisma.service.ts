import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { TenantContextService } from '../common/tenant/tenant-context.service';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: ['error', 'warn'],
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Prisma connected to database successfully.');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // Get current context tenant ID safely
  getCurrentTenantId(): string {
    const tenantId = TenantContextService.getTenantId();
    if (!tenantId) {
      throw new Error('Database query attempted without active tenant context!');
    }
    return tenantId;
  }
}
