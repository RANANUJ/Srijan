import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class CustomerService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // Shopper OTP / Quick Login
  async shopperLogin(tenantId: string, phone: string, email?: string, name?: string) {
    if (!phone && !email) {
      throw new BadRequestException('Phone number or email is required');
    }

    let customer = await this.prisma.customer.findFirst({
      where: {
        tenant_id: tenantId,
        OR: [
          ...(phone ? [{ phone }] : []),
          ...(email ? [{ email }] : []),
        ],
      },
      include: { addresses: true },
    });

    if (!customer) {
      customer = await this.prisma.customer.create({
        data: {
          tenant_id: tenantId,
          phone: phone || null,
          email: email || null,
          name: name || (phone ? `Customer ${phone.slice(-4)}` : 'Customer'),
        },
        include: { addresses: true },
      });
    }

    const payload = {
      sub: customer.id,
      phone: customer.phone,
      email: customer.email,
      role: 'CUSTOMER',
      tid: tenantId,
    };

    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        total_orders: customer.total_orders,
        total_spent: customer.total_spent,
      },
    };
  }

  // Get Customer Profile with Addresses & Stats
  async getProfile(tenantId: string, customerId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: customerId, tenant_id: tenantId },
      include: {
        addresses: { orderBy: { is_default: 'desc' } },
      },
    });

    if (!customer) throw new NotFoundException('Customer not found');

    const ordersCount = await this.prisma.order.count({
      where: { tenant_id: tenantId, customer_id: customerId },
    });

    const ordersAggregate = await this.prisma.order.aggregate({
      where: {
        tenant_id: tenantId,
        customer_id: customerId,
        payment_status: { in: ['PAID', 'PENDING'] },
      },
      _sum: { total_amount: true },
    });

    return {
      ...customer,
      total_orders: ordersCount,
      total_spent: ordersAggregate._sum.total_amount || 0,
    };
  }

  // Update Customer Profile
  async updateProfile(tenantId: string, customerId: string, dto: { name?: string; email?: string }) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: customerId, tenant_id: tenantId },
    });

    if (!customer) throw new NotFoundException('Customer not found');

    return this.prisma.customer.update({
      where: { id: customerId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.email && { email: dto.email }),
      },
    });
  }

  // Get Customer Orders
  async getOrders(tenantId: string, customerId: string) {
    return this.prisma.order.findMany({
      where: {
        tenant_id: tenantId,
        customer_id: customerId,
      },
      include: {
        items: true,
        events: { orderBy: { created_at: 'desc' } },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  // Add Customer Address
  async addAddress(tenantId: string, customerId: string, dto: {
    name: string;
    phone: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    pincode: string;
    is_default?: boolean;
  }) {
    if (dto.is_default) {
      await this.prisma.customerAddress.updateMany({
        where: { tenant_id: tenantId, customer_id: customerId },
        data: { is_default: false },
      });
    }

    return this.prisma.customerAddress.create({
      data: {
        tenant_id: tenantId,
        customer_id: customerId,
        name: dto.name,
        phone: dto.phone,
        address_line1: dto.address_line1,
        address_line2: dto.address_line2 || null,
        city: dto.city,
        state: dto.state,
        pincode: dto.pincode,
        is_default: dto.is_default ?? false,
      },
    });
  }

  // Delete Address
  async deleteAddress(tenantId: string, customerId: string, addressId: string) {
    const address = await this.prisma.customerAddress.findFirst({
      where: { id: addressId, tenant_id: tenantId, customer_id: customerId },
    });

    if (!address) throw new NotFoundException('Address not found');

    await this.prisma.customerAddress.delete({ where: { id: addressId } });
    return { success: true };
  }
}
