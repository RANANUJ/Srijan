import { Controller, Get, Post, Put, Body, Req } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { TenantRequest } from '../../common/middleware/tenant-resolver.middleware';

@Controller('api/v1/tenant')
export class TenantController {
  constructor(private tenantService: TenantService) {}

  @Get('theme')
  async getTheme(@Req() req: TenantRequest) {
    return this.tenantService.getTenantTheme(req.tenant.id);
  }

  @Put('theme')
  async updateTheme(@Req() req: TenantRequest, @Body() body: any) {
    return this.tenantService.updateTenantTheme(req.tenant.id, body);
  }

  @Get('info')
  async getInfo(@Req() req: TenantRequest) {
    return this.tenantService.getTenantDetails(req.tenant.id);
  }

  @Get('domains')
  async getDomains(@Req() req: TenantRequest) {
    return this.tenantService.getDomains(req.tenant.id);
  }

  @Post('domains')
  async addCustomDomain(@Req() req: TenantRequest, @Body() body: { domain: string }) {
    return this.tenantService.addCustomDomain(req.tenant.id, body.domain);
  }

  @Post('domains/verify')
  async verifyCustomDomain(@Req() req: TenantRequest, @Body() body: { domain: string }) {
    return this.tenantService.verifyCustomDomain(req.tenant.id, body.domain);
  }
}
