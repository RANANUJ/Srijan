import { Module } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { CheckoutController } from './checkout.controller';
import { PrismaService } from '../../database/prisma.service';
import { EncryptionService } from '../../common/encryption/encryption.service';

@Module({
  controllers: [CheckoutController],
  providers: [CheckoutService, PrismaService, EncryptionService],
  exports: [CheckoutService],
})
export class CheckoutModule {}
