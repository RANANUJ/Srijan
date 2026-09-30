import { Injectable, NestMiddleware, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantContextService } from '../tenant/tenant-context.service';

export interface TenantRequest extends Request {
  tenant?: {
    id: string;
    name: string;
    slug: string;
    plan: string;
    status: string;
  };
}

@Injectable()
export class TenantResolverMiddleware implements NestMiddleware {
  // In-memory tenant lookup cache for sub-millisecond resolution
  private static tenantCache = new Map<string, any>();

  static registerTenant(domainOrSlug: string, tenantData: any) {
    this.tenantCache.set(domainOrSlug.toLowerCase(), tenantData);
  }

  static getTenant(key: string): any {
    return this.tenantCache.get(key.toLowerCase());
  }

  use(req: TenantRequest, res: Response, next: NextFunction) {
    const rawHost = req.headers['x-forwarded-host'] || req.headers.host || '';
    const host = (Array.isArray(rawHost) ? rawHost[0] : rawHost).split(':')[0].toLowerCase();
    
    // Header overrides for testing/API clients
    const customTenantId = req.headers['x-tenant-id'] as string;
    const customTenantSlug = req.headers['x-tenant-slug'] as string;

    let tenant: any = null;

    if (customTenantId) {
      tenant = Array.from(TenantResolverMiddleware.tenantCache.values()).find(t => t.id === customTenantId);
    } else if (customTenantSlug) {
      tenant = TenantResolverMiddleware.getTenant(customTenantSlug);
    } else if (host) {
      // Check exact domain match first
      tenant = TenantResolverMiddleware.getTenant(host);
      if (!tenant && host.includes('.')) {
        const subdomain = host.split('.')[0];
        tenant = TenantResolverMiddleware.getTenant(subdomain);
      }
    }

    // Fallback to default demo tenant if running locally on localhost without headers
    if (!tenant && (host === 'localhost' || host === '127.0.0.1')) {
      tenant = Array.from(TenantResolverMiddleware.tenantCache.values())[0] || {
        id: 'aura-beauty-tenant-uuid-001',
        name: 'Aura Beauty',
        slug: 'aura-beauty',
        plan: 'PRO',
        status: 'ACTIVE'
      };
    }

    // ── PLATFORM OPERATOR bypass ───────────────────────────────────────────
    // When the frontend calls with X-Tenant-Slug: platform, it's the super-admin
    // console. We attach a synthetic platform tenant and let it through.
    if (customTenantSlug === 'platform' || customTenantId === 'platform') {
      req.tenant = {
        id: '__platform__',
        name: 'Platform Operator',
        slug: 'platform',
        plan: 'BUSINESS',
        status: 'ACTIVE',
      };
      TenantContextService.run(
        { tenantId: '__platform__', tenantSlug: 'platform', domain: host },
        () => next(),
      );
      return;
    }

    if (!tenant) {
      throw new NotFoundException('Storefront not found');
    }

    if (tenant.status === 'SUSPENDED') {
      throw new ForbiddenException('This store is currently unavailable');
    }

    req.tenant = tenant;


    TenantContextService.run(
      {
        tenantId: tenant.id,
        tenantSlug: tenant.slug,
        domain: host,
      },
      () => {
        next();
      },
    );
  }
}
