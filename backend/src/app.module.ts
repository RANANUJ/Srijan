import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { PrismaService } from './database/prisma.service';
import { TenantResolverMiddleware } from './common/middleware/tenant-resolver.middleware';

import { TenantModule } from './modules/tenant/tenant.module';
import { AuthModule } from './modules/auth/auth.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { CheckoutModule } from './modules/checkout/checkout.module';
import { OrderModule } from './modules/order/order.module';
import { EventModule } from './modules/event/event.module';
import { MessagingModule } from './modules/messaging/messaging.module';
import { SeoModule } from './modules/seo/seo.module';
import { AdminModule } from './modules/admin/admin.module';
import { EmailModule } from './modules/email/email.module';
import { LeadModule } from './modules/lead/lead.module';
import { CustomerModule } from './modules/customer/customer.module';
import { ShippingModule } from './modules/shipping/shipping.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    TenantModule,
    AuthModule,
    CatalogModule,
    CheckoutModule,
    OrderModule,
    EventModule,
    MessagingModule,
    SeoModule,
    AdminModule,
    EmailModule,
    LeadModule,
    CustomerModule,
    ShippingModule,
  ],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantResolverMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
