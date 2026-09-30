import { Controller, Post, Get, Body, Param, Query, Req } from '@nestjs/common';
import { ShippingService } from './shipping.service';
import { TenantRequest } from '../../common/middleware/tenant-resolver.middleware';

@Controller('api/v1/shipping')
export class ShippingController {
  constructor(private shippingService: ShippingService) {}

  @Get('config')
  async getConfig(@Req() req: TenantRequest) {
    return this.shippingService.getShippingConfig(req.tenant.id);
  }

  @Post('config')
  async saveConfig(
    @Req() req: TenantRequest,
    @Body() body: {
      email: string;
      api_token?: string;
      pickup_pincode: string;
      pickup_location: string;
      is_enabled: boolean;
      auto_generate_awb?: boolean;
    },
  ) {
    return this.shippingService.saveShippingConfig(req.tenant.id, body);
  }

  @Post('rates')
  async calculateRates(
    @Req() req: TenantRequest,
    @Body() body: {
      pickupPincode?: string;
      deliveryPincode: string;
      weightKg?: number;
      isCod?: boolean;
    },
  ) {
    return this.shippingService.calculateShippingRates(
      req.tenant.id,
      body.pickupPincode || '400001',
      body.deliveryPincode,
      body.weightKg || 0.5,
      body.isCod || false,
    );
  }

  @Post('dispatch')
  async dispatchOrder(
    @Req() req: TenantRequest,
    @Body() body: {
      orderId: string;
      courierName?: string;
      length?: number;
      breadth?: number;
      height?: number;
      weightKg?: number;
    },
  ) {
    return this.shippingService.generateAwbAndDispatch(req.tenant.id, body);
  }

  @Get('track/:awb')
  async trackAwb(@Req() req: TenantRequest, @Param('awb') awb: string) {
    return this.shippingService.trackShipment(req.tenant.id, awb);
  }
}
