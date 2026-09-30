import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class EventService {
  constructor(private prisma: PrismaService) {}

  async trackEvent(
    tenantId: string,
    dto: {
      eventType: 'PRODUCT_VIEW' | 'ADD_TO_CART' | 'INITIATE_CHECKOUT' | 'ORDER_PLACED' | 'ABANDONED_CART';
      sessionId: string;
      customerId?: string;
      payload?: any;
    },
  ) {
    return this.prisma.analyticsEvent.create({
      data: {
        tenant_id: tenantId,
        event_type: dto.eventType,
        session_id: dto.sessionId || 'sess_anonymous',
        customer_id: dto.customerId || null,
        payload_json: JSON.stringify(dto.payload || {}),
      },
    });
  }

  async getEventsSummary(tenantId: string) {
    const events = await this.prisma.analyticsEvent.findMany({
      where: { tenant_id: tenantId },
      orderBy: { created_at: 'desc' },
      take: 100,
    });

    const counts = {
      PRODUCT_VIEW: 0,
      ADD_TO_CART: 0,
      INITIATE_CHECKOUT: 0,
      ORDER_PLACED: 0,
      ABANDONED_CART: 0,
    };

    events.forEach(e => {
      if (counts[e.event_type] !== undefined) {
        counts[e.event_type]++;
      }
    });

    return {
      counts,
      recentEvents: events.slice(0, 10).map(e => ({
        id: e.id,
        eventType: e.event_type,
        sessionId: e.session_id,
        payload: JSON.parse(e.payload_json || '{}'),
        timestamp: e.created_at,
      })),
    };
  }
}
