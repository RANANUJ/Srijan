import { Module } from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { MessagingController } from './messaging.controller';
import { PrismaService } from '../../database/prisma.service';
import { EncryptionService } from '../../common/encryption/encryption.service';

@Module({
  controllers: [MessagingController],
  providers: [MessagingService, PrismaService, EncryptionService],
  exports: [MessagingService],
})
export class MessagingModule {}
