import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

export interface TenantContext {
  tenantId: string;
  tenantSlug: string;
  domain: string;
}

@Injectable()
export class TenantContextService {
  private static asyncLocalStorage = new AsyncLocalStorage<TenantContext>();

  static run(context: TenantContext, callback: () => void) {
    this.asyncLocalStorage.run(context, callback);
  }

  static getTenantId(): string | null {
    const store = this.asyncLocalStorage.getStore();
    return store ? store.tenantId : null;
  }

  static getTenantSlug(): string | null {
    const store = this.asyncLocalStorage.getStore();
    return store ? store.tenantSlug : null;
  }

  static getDomain(): string | null {
    const store = this.asyncLocalStorage.getStore();
    return store ? store.domain : null;
  }

  getTenantId(): string | null {
    return TenantContextService.getTenantId();
  }

  getTenantSlug(): string | null {
    return TenantContextService.getTenantSlug();
  }
}
