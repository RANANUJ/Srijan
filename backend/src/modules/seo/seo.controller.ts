import { Controller, Get, Param, Req, Res, Header } from '@nestjs/common';
import { SeoService } from './seo.service';
import { TenantRequest } from '../../common/middleware/tenant-resolver.middleware';
import { Response } from 'express';

@Controller()
export class SeoController {
  constructor(private seoService: SeoService) {}

  @Get('sitemap.xml')
  @Header('Content-Type', 'application/xml')
  async getSitemap(@Req() req: TenantRequest) {
    return this.seoService.generateSitemapXml(req.tenant.id, req.headers.host || 'srijan.com');
  }

  @Get('robots.txt')
  @Header('Content-Type', 'text/plain')
  async getRobots(@Req() req: TenantRequest) {
    return this.seoService.generateRobotsTxt(req.headers.host || 'srijan.com');
  }

  @Get('api/v1/seo/json-ld/:slug')
  async getJsonLd(@Req() req: TenantRequest, @Param('slug') slug: string) {
    return this.seoService.generateProductJsonLd(req.tenant.id, slug, req.headers.host || 'srijan.com');
  }

  @Get('api/v1/seo/merchant-feed')
  async getMerchantFeed(@Req() req: TenantRequest) {
    return this.seoService.generateGoogleMerchantFeed(req.tenant.id, req.headers.host || 'srijan.com');
  }
}
