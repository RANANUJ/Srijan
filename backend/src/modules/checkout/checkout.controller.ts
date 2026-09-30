import { Controller, Post, Get, Body, Query, Req } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { TenantRequest } from '../../common/middleware/tenant-resolver.middleware';

@Controller('api/v1/checkout')
export class CheckoutController {
  constructor(private checkoutService: CheckoutService) {}

  @Post('cart/calculate')
  async calculateCart(
    @Req() req: TenantRequest,
    @Body() body: { items: any[]; couponCode?: string },
  ) {
    return this.checkoutService.calculateCart(req.tenant.id, body.items, body.couponCode);
  }

  @Post('coupon/validate')
  async validateCoupon(
    @Req() req: TenantRequest,
    @Body() body: { code: string; subtotal: number },
  ) {
    return this.checkoutService.validateCoupon(req.tenant.id, body.code, body.subtotal);
  }

  @Post('initiate')
  async initiateCheckout(@Req() req: TenantRequest, @Body() body: any) {
    return this.checkoutService.initiateCheckout(req.tenant.id, body);
  }

  @Post('verify-payment')
  async verifyPayment(@Req() req: TenantRequest, @Body() body: any) {
    return this.checkoutService.verifyPayment(req.tenant.id, body);
  }
}
