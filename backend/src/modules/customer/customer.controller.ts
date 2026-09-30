import { Controller, Post, Get, Put, Delete, Body, Param, Req, Headers, UnauthorizedException } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { TenantRequest } from '../../common/middleware/tenant-resolver.middleware';
import { JwtService } from '@nestjs/jwt';

@Controller('api/v1/customer')
export class CustomerController {
  constructor(
    private customerService: CustomerService,
    private jwtService: JwtService,
  ) {}

  private extractCustomerId(req: any, headers: any): string {
    const authHeader = headers['authorization'] || headers['Authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = this.jwtService.verify(token);
        if (decoded && decoded.sub) return decoded.sub;
      } catch (e) {
        // Fallback or throw
      }
    }
    const customerIdHeader = headers['x-customer-id'];
    if (customerIdHeader) return customerIdHeader;

    throw new UnauthorizedException('Customer authentication required');
  }

  @Post('auth/login')
  async login(
    @Req() req: TenantRequest,
    @Body() body: { phone: string; email?: string; name?: string },
  ) {
    return this.customerService.shopperLogin(req.tenant.id, body.phone, body.email, body.name);
  }

  @Get('profile')
  async getProfile(@Req() req: TenantRequest, @Headers() headers: any) {
    const customerId = this.extractCustomerId(req, headers);
    return this.customerService.getProfile(req.tenant.id, customerId);
  }

  @Put('profile')
  async updateProfile(
    @Req() req: TenantRequest,
    @Headers() headers: any,
    @Body() body: { name?: string; email?: string },
  ) {
    const customerId = this.extractCustomerId(req, headers);
    return this.customerService.updateProfile(req.tenant.id, customerId, body);
  }

  @Get('orders')
  async getOrders(@Req() req: TenantRequest, @Headers() headers: any) {
    const customerId = this.extractCustomerId(req, headers);
    return this.customerService.getOrders(req.tenant.id, customerId);
  }

  @Post('addresses')
  async addAddress(
    @Req() req: TenantRequest,
    @Headers() headers: any,
    @Body() body: any,
  ) {
    const customerId = this.extractCustomerId(req, headers);
    return this.customerService.addAddress(req.tenant.id, customerId, body);
  }

  @Delete('addresses/:id')
  async deleteAddress(
    @Req() req: TenantRequest,
    @Headers() headers: any,
    @Param('id') id: string,
  ) {
    const customerId = this.extractCustomerId(req, headers);
    return this.customerService.deleteAddress(req.tenant.id, customerId, id);
  }
}
