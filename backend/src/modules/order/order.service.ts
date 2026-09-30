import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async getOrders(tenantId: string, query: { status?: string; search?: string; page?: number }) {
    const where: any = { tenant_id: tenantId };

    if (query.status) {
      where.fulfillment_status = query.status;
    }

    if (query.search) {
      where.OR = [
        { order_number: { contains: query.search } },
        { customer_name: { contains: query.search } },
        { customer_phone: { contains: query.search } },
      ];
    }

    const orders = await this.prisma.order.findMany({
      where,
      include: {
        items: true,
        events: { orderBy: { created_at: 'desc' } },
      },
      orderBy: { created_at: 'desc' },
    });

    return orders;
  }

  async getOrderById(tenantId: string, id: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, tenant_id: tenantId },
      include: {
        items: {
          include: { product: true },
        },
        events: { orderBy: { created_at: 'desc' } },
        customer: true,
      },
    });

    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateFulfillmentStatus(
    tenantId: string,
    orderId: string,
    status: 'CONFIRMED' | 'PACKED' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'RTO',
    trackingDetails?: { awb?: string; courier?: string; trackingUrl?: string },
  ) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, tenant_id: tenantId },
    });

    if (!order) throw new NotFoundException('Order not found');

    const updateData: any = { fulfillment_status: status };

    if (trackingDetails) {
      if (trackingDetails.awb) updateData.tracking_awb = trackingDetails.awb;
      if (trackingDetails.courier) updateData.tracking_courier = trackingDetails.courier;
      if (trackingDetails.trackingUrl) updateData.tracking_url = trackingDetails.trackingUrl;
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: updateData,
    });

    // Write immutable OrderEvent audit row
    await this.prisma.orderEvent.create({
      data: {
        tenant_id: tenantId,
        order_id: orderId,
        status,
        note: trackingDetails ? `Status changed to ${status}. Tracking AWB: ${trackingDetails.awb || 'N/A'}` : `Status changed to ${status}`,
        created_by: 'ADMIN',
      },
    });

    return updated;
  }

  // ----------------------------------------------------
  // GST INVOICE GENERATION
  // ----------------------------------------------------
  async generateGSTInvoice(tenantId: string, orderId: string) {
    const order = await this.getOrderById(tenantId, orderId);
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { theme: true },
    });

    const taxRate = 0.18; // 18% GST standard e-commerce rate
    const taxableAmount = Math.round((order.subtotal / (1 + taxRate)) * 100) / 100;
    const cgst = Math.round((taxableAmount * 0.09) * 100) / 100;
    const sgst = Math.round((taxableAmount * 0.09) * 100) / 100;

    return {
      invoiceNumber: `INV-${order.order_number}`,
      invoiceDate: order.created_at,
      brandName: tenant.theme ? tenant.theme.brand_name : tenant.name,
      gstin: '27AAAAA0000A1Z5',
      customer: {
        name: order.customer_name,
        email: order.customer_email,
        phone: order.customer_phone,
        address: JSON.parse(order.shipping_address_json),
      },
      items: order.items.map(i => ({
        description: i.product_title + (i.variant_title ? ` (${i.variant_title})` : ''),
        hsnCode: '33049990',
        qty: i.quantity,
        unitPrice: i.price,
        total: i.price * i.quantity,
      })),
      taxableAmount,
      cgst,
      sgst,
      shippingFee: order.shipping_fee,
      discountAmount: order.discount_amount,
      totalAmount: order.total_amount,
    };
  }

  // ----------------------------------------------------
  // PUBLIC ORDER TRACKING
  // ----------------------------------------------------
  async trackOrder(tenantId: string, orderNumber: string, phone: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        tenant_id: tenantId,
        order_number: orderNumber.toUpperCase(),
        customer_phone: phone,
      },
      include: {
        items: true,
        events: { orderBy: { created_at: 'asc' } },
      },
    });

    if (!order) throw new NotFoundException('No matching order found for given details');

    return {
      orderNumber: order.order_number,
      customerName: order.customer_name,
      fulfillmentStatus: order.fulfillment_status,
      paymentStatus: order.payment_status,
      trackingAwb: order.tracking_awb,
      trackingCourier: order.tracking_courier,
      trackingUrl: order.tracking_url,
      created_at: order.created_at,
      events: order.events,
      items: order.items,
    };
  }
}
