import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { TenantResolverMiddleware } from '../../common/middleware/tenant-resolver.middleware';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // ----------------------------------------------------
  // BRAND ADMIN METRICS & DASHBOARD
  // ----------------------------------------------------
  async getDashboardMetrics(tenantId: string) {
    const totalOrders = await this.prisma.order.count({
      where: { tenant_id: tenantId },
    });

    const paidOrders = await this.prisma.order.findMany({
      where: { tenant_id: tenantId, payment_status: 'PAID' },
      select: { total_amount: true },
    });

    const totalRevenue = paidOrders.reduce((acc, o) => acc + o.total_amount, 0);

    const totalCustomers = await this.prisma.customer.count({
      where: { tenant_id: tenantId },
    });

    const totalProducts = await this.prisma.product.count({
      where: { tenant_id: tenantId, status: 'ACTIVE' },
    });

    const lowStockVariants = await this.prisma.productVariant.findMany({
      where: { tenant_id: tenantId, inventory_count: { lte: 5 } },
      include: { product: true },
    });

    const recentOrders = await this.prisma.order.findMany({
      where: { tenant_id: tenantId },
      orderBy: { created_at: 'desc' },
      take: 5,
      include: { items: true },
    });

    return {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalOrders,
      totalCustomers,
      totalProducts,
      lowStockAlerts: lowStockVariants.map(v => ({
        variantId: v.id,
        productTitle: v.product.title,
        variantTitle: v.title,
        sku: v.sku,
        stock: v.inventory_count,
      })),
      recentOrders,
    };
  }

  // ----------------------------------------------------
  // COUPON MANAGEMENT
  // ----------------------------------------------------
  async getCoupons(tenantId: string) {
    return this.prisma.coupon.findMany({
      where: { tenant_id: tenantId },
      orderBy: { created_at: 'desc' },
    });
  }

  async createCoupon(tenantId: string, dto: any) {
    return this.prisma.coupon.create({
      data: {
        tenant_id: tenantId,
        code: dto.code.toUpperCase().trim(),
        discount_type: dto.discount_type || 'PERCENTAGE',
        discount_value: Number(dto.discount_value),
        min_order_value: Number(dto.min_order_value || 0),
        max_discount_amount: dto.max_discount_amount ? Number(dto.max_discount_amount) : null,
        usage_limit: dto.usage_limit ? Number(dto.usage_limit) : null,
        expires_at: dto.expires_at ? new Date(dto.expires_at) : null,
        is_active: dto.is_active !== undefined ? dto.is_active : true,
      },
    });
  }

  // ----------------------------------------------------
  // SUPER ADMIN TENANT MANAGEMENT
  // ----------------------------------------------------
  getArchetypeDefaults(archetype?: string) {
    switch (archetype) {
      case 'ORGANIC_GHARSOAPS':
        return {
          primary_color: '#D97706',
          secondary_color: '#059669',
          accent_color: '#F59E0B',
          background_color: '#0F141C',
          text_color: '#FFFBEB',
          heading_font: 'Cinzel',
          body_font: 'Outfit',
          card_style: 'artisanal_organic',
        };
      case 'FASHION_PREMIUM':
        return {
          primary_color: '#E2E8F0',
          secondary_color: '#C5A880',
          accent_color: '#38BDF8',
          background_color: '#05070B',
          text_color: '#FFFFFF',
          heading_font: 'Outfit',
          body_font: 'Inter',
          card_style: 'minimalist_fashion',
        };
      case 'JEWELLERY_KALYAN':
        return {
          primary_color: '#F59E0B',
          secondary_color: '#047857',
          accent_color: '#EAB308',
          background_color: '#080B11',
          text_color: '#FEF9C3',
          heading_font: 'Cinzel',
          body_font: 'Playfair Display',
          card_style: 'gold_hallmark',
        };
      case 'MULTISTORE_NYKAA':
        return {
          primary_color: '#E11D48',
          secondary_color: '#2563EB',
          accent_color: '#10B981',
          background_color: '#090D16',
          text_color: '#FFFFFF',
          heading_font: 'Plus Jakarta Sans',
          body_font: 'Inter',
          card_style: 'marketplace_grid',
        };
      case 'BEAUTY_FOXTALE':
      default:
        return {
          primary_color: '#7C3AED',
          secondary_color: '#EC4899',
          accent_color: '#10B981',
          background_color: '#0B0F19',
          text_color: '#F8FAFC',
          heading_font: 'Playfair Display',
          body_font: 'Plus Jakarta Sans',
          card_style: 'glassmorphism',
        };
    }
  }

  async createTenantBrand(dto: {
    name: string;
    slug: string;
    plan?: 'STARTER' | 'PRO' | 'BUSINESS';
    archetype?: string;
    customDomain?: string;
    ownerEmail: string;
    ownerName: string;
    ownerPassword: string;
  }) {
    const tenant = await this.prisma.tenant.create({
      data: {
        name: dto.name,
        slug: dto.slug.toLowerCase(),
        plan: dto.plan || 'PRO',
        status: 'ACTIVE',
        owner_email: dto.ownerEmail.toLowerCase(),
      },
    });

    // Create default platform domain
    await this.prisma.domain.create({
      data: {
        tenant_id: tenant.id,
        domain: `${dto.slug.toLowerCase()}.srijanplatform.com`,
        is_primary: !dto.customDomain,
        ssl_status: 'ACTIVE',
      },
    });

    // If custom domain provided, assign it directly
    if (dto.customDomain) {
      await this.prisma.domain.create({
        data: {
          tenant_id: tenant.id,
          domain: dto.customDomain.toLowerCase().trim(),
          is_primary: true,
          ssl_status: 'ACTIVE',
        },
      });
      TenantResolverMiddleware.registerTenant(dto.customDomain, tenant);
    }

    // Get preset styles for chosen archetype
    const themePreset = this.getArchetypeDefaults(dto.archetype);

    await this.prisma.tenantTheme.create({
      data: {
        tenant_id: tenant.id,
        brand_name: dto.name,
        ...themePreset,
      },
    });

    // Create owner staff account
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash(dto.ownerPassword || 'BrandAdmin123!', 10);
    const owner = await this.prisma.user.create({
      data: {
        tenant_id: tenant.id,
        name: dto.ownerName,
        email: dto.ownerEmail.toLowerCase(),
        password_hash: hash,
        role: 'OWNER',
      },
    });

    // Register in resolver memory cache
    TenantResolverMiddleware.registerTenant(dto.slug, tenant);
    TenantResolverMiddleware.registerTenant(`${dto.slug}.srijanplatform.com`, tenant);

    return { tenant, owner };
  }

  async updateTenantBrand(tenantId: string, dto: {
    name?: string;
    plan?: 'STARTER' | 'PRO' | 'BUSINESS';
    status?: 'ACTIVE' | 'TRIAL' | 'SUSPENDED';
    archetype?: string;
    customDomain?: string;
    theme?: any;
  }) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new NotFoundException('Brand not found');

    const updateData: any = {};
    if (dto.name) updateData.name = dto.name;
    if (dto.plan) updateData.plan = dto.plan;
    if (dto.status) updateData.status = dto.status;

    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: updateData,
    });

    // Update custom domain if provided
    if (dto.customDomain) {
      const cleanDomain = dto.customDomain.toLowerCase().trim();
      const existing = await this.prisma.domain.findFirst({
        where: { tenant_id: tenantId, domain: cleanDomain },
      });
      if (!existing) {
        await this.prisma.domain.updateMany({
          where: { tenant_id: tenantId },
          data: { is_primary: false },
        });
        await this.prisma.domain.create({
          data: {
            tenant_id: tenantId,
            domain: cleanDomain,
            is_primary: true,
            ssl_status: 'ACTIVE',
          },
        });
      }
      TenantResolverMiddleware.registerTenant(cleanDomain, tenant);
    }

    // Update theme & archetype
    if (dto.archetype || dto.theme) {
      const archetypePreset = dto.archetype ? this.getArchetypeDefaults(dto.archetype) : {};
      const themeData = {
        ...archetypePreset,
        ...(dto.theme || {}),
      };

      await this.prisma.tenantTheme.upsert({
        where: { tenant_id: tenantId },
        update: themeData,
        create: {
          tenant_id: tenantId,
          brand_name: dto.name || tenant.name,
          ...themeData,
        },
      });
    }

    return this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { domains: true, theme: true },
    });
  }

  async getAllTenants() {
    return this.prisma.tenant.findMany({
      include: {
        domains: true,
        theme: true,
        _count: { select: { products: true, orders: true, users: true } },
      },
    });
  }
}
