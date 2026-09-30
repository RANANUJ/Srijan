import { Controller, Post, Get, Body, Req } from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { TenantRequest } from '../../common/middleware/tenant-resolver.middleware';

@Controller('api/v1/messaging')
export class MessagingController {
  constructor(private messagingService: MessagingService) {}

  @Post('whatsapp/config')
  async configWhatsApp(@Req() req: TenantRequest, @Body() body: any) {
    return this.messagingService.configureWhatsAppIntegration(req.tenant.id, body);
  }

  @Post('whatsapp/send-test')
  async sendTestMessage(@Req() req: TenantRequest, @Body() body: { phone: string; template: string }) {
    return this.messagingService.sendWhatsAppMessage(req.tenant.id, body.phone, body.template || 'order_confirmation', {
      order_number: 'TEST-1001',
      total_amount: '₹1,299',
    });
  }

  @Get('whatsapp/logs')
  async getLogs(@Req() req: TenantRequest) {
    return this.messagingService.getWhatsAppLogs(req.tenant.id);
  }
}
