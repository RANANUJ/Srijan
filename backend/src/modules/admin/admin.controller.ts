import { Controller, Get, Post, Put, Body, Param, Req } from '@nestjs/common';
import { AdminService } from './admin.service';
import { TenantRequest } from '../../common/middleware/tenant-resolver.middleware';

@Controller('api/v1/admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard')
  async getDashboard(@Req() req: TenantRequest) {
    return this.adminService.getDashboardMetrics(req.tenant.id);
  }

  @Get('coupons')
  async getCoupons(@Req() req: TenantRequest) {
    return this.adminService.getCoupons(req.tenant.id);
  }

  @Post('coupons')
  async createCoupon(@Req() req: TenantRequest, @Body() body: any) {
    return this.adminService.createCoupon(req.tenant.id, body);
  }

  // ── Super Admin / Operator Endpoints ─────────────────────────────────────
  // Available without tenant context (called with tenantSlug='platform')

  @Post('tenants')
  async createBrand(@Body() body: any) {
    return this.adminService.createTenantBrand(body);
  }

  @Get('tenants')
  async getAllTenants() {
    return this.adminService.getAllTenants();
  }

  @Put('tenants/:id')
  async updateBrand(@Param('id') id: string, @Body() body: any) {
    return this.adminService.updateTenantBrand(id, body);
  }

  // Legacy aliases
  @Post('super/tenants')
  async createBrandLegacy(@Body() body: any) {
    return this.adminService.createTenantBrand(body);
  }

  @Get('super/tenants')
  async getAllTenantsLegacy() {
    return this.adminService.getAllTenants();
  }
}

