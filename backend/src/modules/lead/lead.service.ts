import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';

@Injectable()
export class LeadService {
  constructor(private prisma: PrismaService) {}

  // -----------------------------------------------------
  // CAPTURE SALES LEAD (from public landing page form)
  // Creates a pending lead record. Human (or automation)
  // picks this up to provision a real tenant.
  // -----------------------------------------------------
  async captureLead(dto: CreateLeadDto) {
    // Generate a URL-safe slug from the brand name
    const slug = dto.brand_name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .slice(0, 40);

    // Create the Tenant record immediately (status = TRIAL)
    const existing = await this.prisma.tenant.findFirst({
      where: { OR: [{ slug }, { owner_email: dto.email }] },
    });

    if (existing) {
      throw new ConflictException(`A store with this brand name or email already exists.`);
    }

    const tenant = await this.prisma.tenant.create({
      data: {
        slug,
        owner_email: dto.email,
        owner_phone: dto.phone,
        plan: dto.plan || 'Starter',
        status: 'TRIAL',
        theme: {
          create: {
            brand_name: dto.brand_name,
            primary_color: this.nicheColor(dto.niche).primary,
            secondary_color: this.nicheColor(dto.niche).secondary,
            accent_color: '#10B981',
            background_color: '#FFFFFF',
            heading_font: 'Plus Jakarta Sans',
            body_font: 'Inter',
            border_radius: '12px',
          },
        },
      },
      include: { theme: true },
    });

    console.log(`
🆕 NEW LEAD CAPTURED
   Brand: ${dto.brand_name} (${slug})
   Email: ${dto.email}
   Phone: +91 ${dto.phone}
   Niche: ${dto.niche}
   Plan:  ${dto.plan || 'Starter'}
   Tenant ID: ${tenant.id}
─────────────────────────────────`);

    return {
      success: true,
      message: `${dto.brand_name} is queued for provisioning. You'll hear from us within 24 hours.`,
      slug,
      tenantId: tenant.id,
    };
  }

  async getAllLeads() {
    return this.prisma.tenant.findMany({
      where: { status: 'TRIAL' },
      include: { theme: true },
      orderBy: { created_at: 'desc' },
    });
  }

  // Default theme colors per niche
  private nicheColor(niche: string): { primary: string; secondary: string } {
    const map: Record<string, { primary: string; secondary: string }> = {
      beauty:    { primary: '#7C3AED', secondary: '#EC4899' },
      ayurveda:  { primary: '#059669', secondary: '#D97706' },
      haircare:  { primary: '#0EA5E9', secondary: '#7C3AED' },
      nutrition: { primary: '#16A34A', secondary: '#15803D' },
      fashion:   { primary: '#DC2626', secondary: '#9333EA' },
      other:     { primary: '#334155', secondary: '#64748B' },
    };
    return map[niche] || map.beauty;
  }
}
