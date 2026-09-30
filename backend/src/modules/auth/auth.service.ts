import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async loginStaff(tenantId: string, dto: { email: string; password: string }) {
    // Tenant-isolated lookup
    const user = await this.prisma.user.findFirst({
      where: {
        tenant_id: tenantId,
        email: dto.email.toLowerCase(),
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password_hash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tid: user.tenant_id,
    };

    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenant_id: user.tenant_id,
      },
    };
  }

  async loginShopper(tenantId: string, phone: string) {
    let customer = await this.prisma.customer.findFirst({
      where: {
        tenant_id: tenantId,
        phone,
      },
    });

    if (!customer) {
      customer = await this.prisma.customer.create({
        data: {
          tenant_id: tenantId,
          phone,
          name: `Shopper ${phone.slice(-4)}`,
        },
      });
    }

    const payload = {
      sub: customer.id,
      phone: customer.phone,
      role: 'CUSTOMER',
      tid: customer.tenant_id,
    };

    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      customer,
    };
  }

  async getStaffProfile(userId: string, tenantId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        tenant_id: tenantId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        tenant_id: true,
        created_at: true,
      },
    });

    if (!user) throw new UnauthorizedException('User not found');
    return user;
  }
}
