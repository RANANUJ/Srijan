import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { TenantResolverMiddleware } from '../../common/middleware/tenant-resolver.middleware';
import * as crypto from 'crypto';

@Injectable()
export class TenantService {
  constructor(private prisma: PrismaService) {}

  async getTenantTheme(tenantId: string) {
    const theme = await this.prisma.tenantTheme.findUnique({
      where: { tenant_id: tenantId },
    });

    if (!theme) {
      return {
        tenant_id: tenantId,
        brand_name: 'Brand Store',
        logo_url: '/placeholder-logo.svg',
        favicon_url: '/favicon.ico',
        primary_color: '#7C3AED',
        secondary_color: '#EC4899',
        accent_color: '#10B981',
        background_color: '#F8FAFC',
        text_color: '#0F172A',
        heading_font: 'Playfair Display',
        body_font: 'Plus Jakarta Sans',
        border_radius: '8px',
        card_style: 'glassmorphism',
        header_style: 'sticky',
      };
    }

    return theme;
  }

  async updateTenantTheme(tenantId: string, data: any) {
    const updated = await this.prisma.tenantTheme.upsert({
      where: { tenant_id: tenantId },
      update: {
        brand_name: data.brand_name,
        logo_url: data.logo_url,
        favicon_url: data.favicon_url,
        primary_color: data.primary_color,
        secondary_color: data.secondary_color,
        accent_color: data.accent_color,
        background_color: data.background_color,
        text_color: data.text_color,
        heading_font: data.heading_font,
        body_font: data.body_font,
        border_radius: data.border_radius,
        card_style: data.card_style,
        header_style: data.header_style,
        custom_css: data.custom_css,
      },
      create: {
        tenant_id: tenantId,
        brand_name: data.brand_name || 'Brand Store',
        logo_url: data.logo_url,
        favicon_url: data.favicon_url,
        primary_color: data.primary_color || '#7C3AED',
        secondary_color: data.secondary_color || '#EC4899',
        accent_color: data.accent_color || '#10B981',
        background_color: data.background_color || '#F8FAFC',
        text_color: data.text_color || '#0F172A',
        heading_font: data.heading_font || 'Playfair Display',
        body_font: data.body_font || 'Plus Jakarta Sans',
        border_radius: data.border_radius || '8px',
        card_style: data.card_style || 'glassmorphism',
        header_style: data.header_style || 'sticky',
        custom_css: data.custom_css,
      },
    });

    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (tenant) {
      TenantResolverMiddleware.registerTenant(tenant.slug, tenant);
    }

    return updated;
  }

  async getTenantDetails(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        domains: true,
        theme: true,
      },
    });

    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }

  // ----------------------------------------------------
  // CUSTOM DOMAIN & WHITE-LABEL DNS VERIFICATION
  // ----------------------------------------------------
  async addCustomDomain(tenantId: string, domainName: string) {
    const cleanDomain = domainName.toLowerCase().trim();

    // Check if domain is already claimed globally
    const existing = await this.prisma.domain.findUnique({
      where: { domain: cleanDomain },
    });

    if (existing) {
      throw new BadRequestException('This domain is already registered on the platform');
    }

    const verificationToken = `srijan-verify-${crypto.randomBytes(16).toString('hex')}`;

    const domain = await this.prisma.domain.create({
      data: {
        tenant_id: tenantId,
        domain: cleanDomain,
        is_primary: false,
        verification_token: verificationToken,
        ssl_status: 'PENDING',
      },
    });

    return {
      domain: domain.domain,
      verificationToken: domain.verification_token,
      instructions: `Add a DNS TXT record for @ or ${cleanDomain} with value "${domain.verification_token}". Also point a CNAME record to "cname.srijanplatform.com".`,
      sslStatus: domain.ssl_status,
    };
  }

  async verifyCustomDomain(tenantId: string, domainName: string) {
    const cleanDomain = domainName.toLowerCase().trim();
    const domainObj = await this.prisma.domain.findFirst({
      where: { tenant_id: tenantId, domain: cleanDomain },
    });

    if (!domainObj) throw new NotFoundException('Domain mapping not found');

    // Simulate DNS check success
    const updated = await this.prisma.domain.update({
      where: { id: domainObj.id },
      data: {
        verified_at: new Date(),
        ssl_status: 'ACTIVE',
        is_primary: true,
      },
    });

    // Register domain in active resolver cache so incoming traffic resolves instantly!
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (tenant) {
      TenantResolverMiddleware.registerTenant(cleanDomain, tenant);
    }

    return {
      success: true,
      domain: updated.domain,
      verifiedAt: updated.verified_at,
      sslStatus: updated.ssl_status,
    };
  }

  async getDomains(tenantId: string) {
    return this.prisma.domain.findMany({
      where: { tenant_id: tenantId },
      orderBy: { created_at: 'desc' },
    });
  }
}
