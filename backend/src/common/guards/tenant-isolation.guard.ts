import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { TenantRequest } from '../middleware/tenant-resolver.middleware';

@Injectable()
export class TenantIsolationGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<TenantRequest>();
    const resolvedTenant = request.tenant;
    const user = (request as any).user;

    if (!resolvedTenant) {
      throw new ForbiddenException('Tenant context missing from request');
    }

    // If endpoint requires authenticated user, check JWT tid matches request tenant.id
    if (user && user.tenant_id) {
      if (user.tenant_id !== resolvedTenant.id) {
        throw new ForbiddenException('Cross-tenant request denied: Token tenant mismatch');
      }
    }

    return true;
  }
}
