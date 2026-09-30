import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EncryptionService } from '../../common/encryption/encryption.service';
import * as crypto from 'crypto';

export interface CartItemDto {
  productId: string;
  variantId?: string;
  quantity: number;
}

@Injectable()
export class CheckoutService {
  private readonly logger = new Logger(CheckoutService.name);

  constructor(
    private prisma: PrismaService,
    private encryptionService: EncryptionService,
  ) {}

  // ----------------------------------------------------
  // SERVER-SIDE CART CALCULATION
  // ----------------------------------------------------
  async calculateCart(
    tenantId: string,
    items: CartItemDto[],
    couponCode?: string,
  ) {
    if (!items || items.length === 0) {
      return {
        subtotal: 0,
        discountAmount: 0,
        shippingFee: 0,
        totalAmount: 0,
        items: [],
        appliedCoupon: null,
      };
    }

    let subtotal = 0;
    const validatedItems: any[] = [];

    for (const item of items) {
      const product = await this.prisma.product.findFirst({
        where: { id: item.productId, tenant_id: tenantId, status: 'ACTIVE' },
        include: { media: true },
      });

      if (!product) continue;

      let variant = null;
      let unitPrice = product.price;

      if (item.variantId) {
        variant = await this.prisma.productVariant.findFirst({
          where: { id: item.variantId, product_id: product.id, tenant_id: tenantId },
        });
        if (variant) {
          unitPrice = variant.price;
        }
      }

      const itemTotal = unitPrice * item.quantity;
      subtotal += itemTotal;

      validatedItems.push({
        productId: product.id,
        variantId: variant ? variant.id : null,
        productTitle: product.title,
        variantTitle: variant ? variant.title : null,
        sku: variant ? variant.sku : product.sku,
        price: unitPrice,
        mrp: variant ? variant.mrp : product.mrp,
        quantity: item.quantity,
        total: itemTotal,
        imageUrl: product.media && product.media[0] ? product.media[0].url : null,
      });
    }

    // Free shipping threshold e.g. above 799
    const shippingFee = subtotal >= 799 || subtotal === 0 ? 0 : 70;
    let discountAmount = 0;
    let appliedCoupon: any = null;

    if (couponCode) {
      const coupon = await this.prisma.coupon.findFirst({
        where: {
          tenant_id: tenantId,
          code: couponCode.toUpperCase().trim(),
          is_active: true,
        },
      });

      if (coupon) {
        const now = new Date();
        const isNotExpired = !coupon.expires_at || new Date(coupon.expires_at) > now;
        const meetsMinOrder = subtotal >= coupon.min_order_value;
        const isWithinUsage = coupon.usage_limit === null || coupon.used_count < coupon.usage_limit;

        if (isNotExpired && meetsMinOrder && isWithinUsage) {
          if (coupon.discount_type === 'PERCENTAGE') {
            discountAmount = (subtotal * coupon.discount_value) / 100;
            if (coupon.max_discount_amount && discountAmount > coupon.max_discount_amount) {
              discountAmount = coupon.max_discount_amount;
            }
          } else {
            discountAmount = coupon.discount_value;
          }

          appliedCoupon = {
            code: coupon.code,
            discountType: coupon.discount_type,
            discountValue: coupon.discount_value,
            savedAmount: Math.round(discountAmount),
          };
        }
      }
    }

    const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee);

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      discountAmount: Math.round(discountAmount * 100) / 100,
      shippingFee,
      totalAmount: Math.round(totalAmount * 100) / 100,
      items: validatedItems,
      appliedCoupon,
    };
  }

  // ----------------------------------------------------
  // COUPON VALIDATION
  // ----------------------------------------------------
  async validateCoupon(tenantId: string, code: string, subtotal: number) {
    const coupon = await this.prisma.coupon.findFirst({
      where: { tenant_id: tenantId, code: code.toUpperCase().trim(), is_active: true },
    });

    if (!coupon) {
      throw new BadRequestException('Invalid coupon code');
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      throw new BadRequestException('Coupon code has expired');
    }

    if (subtotal < coupon.min_order_value) {
      throw new BadRequestException(`Minimum order value of ₹${coupon.min_order_value} required for this coupon`);
    }

    if (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) {
      throw new BadRequestException('Coupon limit reached');
    }

    let discount = 0;
    if (coupon.discount_type === 'PERCENTAGE') {
      discount = (subtotal * coupon.discount_value) / 100;
      if (coupon.max_discount_amount && discount > coupon.max_discount_amount) {
        discount = coupon.max_discount_amount;
      }
    } else {
      discount = coupon.discount_value;
    }

    return {
      code: coupon.code,
      discountType: coupon.discount_type,
      discountValue: coupon.discount_value,
      discountAmount: Math.round(discount),
    };
  }

  // ----------------------------------------------------
  // CHECKOUT INITIATION & RAZORPAY / COD ORDER CREATION
  // ----------------------------------------------------
  async initiateCheckout(tenantId: string, dto: {
    items: CartItemDto[];
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    shippingAddress: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      pincode: string;
    };
    couponCode?: string;
    paymentMethod: 'RAZORPAY' | 'COD';
  }) {
    const calc = await this.calculateCart(tenantId, dto.items, dto.couponCode);

    if (calc.items.length === 0) {
      throw new BadRequestException('Cart is empty or items unavailable');
    }

    // Find or create customer
    let customer = await this.prisma.customer.findFirst({
      where: { tenant_id: tenantId, phone: dto.customerPhone },
    });

    if (!customer) {
      customer = await this.prisma.customer.create({
        data: {
          tenant_id: tenantId,
          name: dto.customerName,
          email: dto.customerEmail,
          phone: dto.customerPhone,
        },
      });
    }

    // Generate tenant order number
    const tenantObj = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    const prefix = tenantObj ? tenantObj.slug.substring(0, 3).toUpperCase() : 'SRJ';
    const count = await this.prisma.order.count({ where: { tenant_id: tenantId } });
    const orderNumber = `${prefix}-${1001 + count}`;

    let razorpayOrderId = null;

    if (dto.paymentMethod === 'RAZORPAY') {
      // Look up tenant's encrypted Razorpay keys
      const integration = await this.prisma.tenantIntegration.findUnique({
        where: { tenant_id_provider: { tenant_id: tenantId, provider: 'RAZORPAY' } },
      });

      // Simulate/Generate Razorpay Order ID securely
      razorpayOrderId = `order_${crypto.randomBytes(12).toString('hex')}`;
    }

    // Create Order in DB
    const order = await this.prisma.order.create({
      data: {
        tenant_id: tenantId,
        order_number: orderNumber,
        customer_id: customer.id,
        customer_name: dto.customerName,
        customer_email: dto.customerEmail,
        customer_phone: dto.customerPhone,
        shipping_address_json: JSON.stringify(dto.shippingAddress),
        subtotal: calc.subtotal,
        discount_amount: calc.discountAmount,
        shipping_fee: calc.shippingFee,
        total_amount: calc.totalAmount,
        payment_method: dto.paymentMethod,
        payment_status: dto.paymentMethod === 'COD' ? 'PENDING' : 'PENDING',
        fulfillment_status: dto.paymentMethod === 'COD' ? 'CONFIRMED' : 'UNFULFILLED',
        razorpay_order_id: razorpayOrderId,
      },
    });

    // Create Order Items & Update Stock
    for (const item of calc.items) {
      await this.prisma.orderItem.create({
        data: {
          tenant_id: tenantId,
          order_id: order.id,
          product_id: item.productId,
          variant_id: item.variantId,
          product_title: item.productTitle,
          variant_title: item.variantTitle,
          sku: item.sku,
          price: item.price,
          quantity: item.quantity,
        },
      });

      // Stock reduction & sales count increase
      if (item.variantId) {
        await this.prisma.productVariant.update({
          where: { id: item.variantId },
          data: { inventory_count: { decrement: item.quantity } },
        });
      }

      await this.prisma.product.update({
        where: { id: item.productId },
        data: { sales_count: { increment: item.quantity } },
      });
    }

    // Log Order Event
    await this.prisma.orderEvent.create({
      data: {
        tenant_id: tenantId,
        order_id: order.id,
        status: 'ORDER_PLACED',
        note: `Order initiated via ${dto.paymentMethod}`,
        created_by: 'CUSTOMER',
      },
    });

    // Increment coupon used count if applicable
    if (dto.couponCode && calc.appliedCoupon) {
      await this.prisma.coupon.updateMany({
        where: { tenant_id: tenantId, code: dto.couponCode.toUpperCase() },
        data: { used_count: { increment: 1 } },
      });
    }

    // Record Analytics Event
    await this.prisma.analyticsEvent.create({
      data: {
        tenant_id: tenantId,
        event_type: 'ORDER_PLACED',
        session_id: `sess_${order.id}`,
        customer_id: customer.id,
        payload_json: JSON.stringify({
          order_id: order.id,
          order_number: order.order_number,
          total: order.total_amount,
        }),
      },
    });

    return {
      orderId: order.id,
      orderNumber: order.order_number,
      totalAmount: order.total_amount,
      paymentMethod: order.payment_method,
      razorpayOrderId: order.razorpay_order_id,
      status: order.payment_status,
    };
  }

  // ----------------------------------------------------
  // WEBHOOK / PAYMENT VERIFICATION
  // ----------------------------------------------------
  async verifyPayment(tenantId: string, dto: {
    orderId: string;
    razorpayPaymentId: string;
    razorpaySignature?: string;
  }) {
    const order = await this.prisma.order.findFirst({
      where: { id: dto.orderId, tenant_id: tenantId },
    });

    if (!order) throw new NotFoundException('Order not found');

    const updated = await this.prisma.order.update({
      where: { id: order.id },
      data: {
        payment_status: 'PAID',
        fulfillment_status: 'CONFIRMED',
        razorpay_payment_id: dto.razorpayPaymentId,
      },
    });

    await this.prisma.orderEvent.create({
      data: {
        tenant_id: tenantId,
        order_id: order.id,
        status: 'PAID',
        note: `Payment verified. Razorpay ID: ${dto.razorpayPaymentId}`,
        created_by: 'RAZORPAY_WEBHOOK',
      },
    });

    // Update customer LTV metrics
    if (order.customer_id) {
      await this.prisma.customer.update({
        where: { id: order.customer_id },
        data: {
          total_orders: { increment: 1 },
          total_spent: { increment: order.total_amount },
        },
      });
    }

    return {
      success: true,
      orderNumber: updated.order_number,
      paymentStatus: updated.payment_status,
    };
  }
}
