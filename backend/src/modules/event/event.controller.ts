import { Controller, Post, Get, Body, Req } from '@nestjs/common';
import { EventService } from './event.service';
import { TenantRequest } from '../../common/middleware/tenant-resolver.middleware';

@Controller('api/v1/events')
export class EventController {
  constructor(private eventService: EventService) {}

  @Post('track')
  async trackEvent(@Req() req: TenantRequest, @Body() body: any) {
    return this.eventService.trackEvent(req.tenant.id, body);
  }

  @Get('summary')
  async getSummary(@Req() req: TenantRequest) {
    return this.eventService.getEventsSummary(req.tenant.id);
  }
}
