import { Controller, Get, Post, Put, Body, Param, Query, Req } from '@nestjs/common';
import { OrderService } from './order.service';
import { TenantRequest } from '../../common/middleware/tenant-resolver.middleware';

@Controller('api/v1/orders')
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Get()
  async getOrders(
    @Req() req: TenantRequest,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.orderService.getOrders(req.tenant.id, { status, search });
  }

  @Get('track')
  async trackOrder(
    @Req() req: TenantRequest,
    @Query('orderNumber') orderNumber: string,
    @Query('phone') phone: string,
  ) {
    return this.orderService.trackOrder(req.tenant.id, orderNumber, phone);
  }

  @Get(':id')
  async getOrderById(@Req() req: TenantRequest, @Param('id') id: string) {
    return this.orderService.getOrderById(req.tenant.id, id);
  }

  @Put(':id/fulfillment')
  async updateFulfillmentStatus(
    @Req() req: TenantRequest,
    @Param('id') id: string,
    @Body() body: { status: any; tracking?: any },
  ) {
    return this.orderService.updateFulfillmentStatus(
      req.tenant.id,
      id,
      body.status,
      body.tracking,
    );
  }

  @Get(':id/invoice')
  async getInvoice(@Req() req: TenantRequest, @Param('id') id: string) {
    return this.orderService.generateGSTInvoice(req.tenant.id, id);
  }
}
