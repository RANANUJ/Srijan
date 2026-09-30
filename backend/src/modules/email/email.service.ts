import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

// Lightweight transactional email service
// Uses provider-agnostic approach (swap Postmark / Resend / SMTP)
@Injectable()
export class EmailService {
  private readonly fromEmail = process.env.FROM_EMAIL || 'noreply@srijanplatform.com';
  private readonly isDev = process.env.NODE_ENV !== 'production';

  constructor(private prisma: PrismaService) {}

  // Log email to console in dev; send via HTTP provider in prod
  private async sendEmail(dto: {
    to: string;
    subject: string;
    html: string;
    brandName: string;
  }) {
    if (this.isDev) {
      console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 [DEV EMAIL LOG] from: ${this.fromEmail}
   to: ${dto.to}
   subject: ${dto.subject}
   brand: ${dto.brandName}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      return { success: true, provider: 'console-dev' };
    }

    // In production — plug in Resend / Postmark / SES here
    return { success: true, provider: 'smtp' };
  }

  // ------------------------------------------------
  // ORDER CONFIRMATION EMAIL
  // ------------------------------------------------
  async sendOrderConfirmation(tenantId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, tenant_id: tenantId },
      include: { items: true },
    });
    if (!order) return;

    const brand = await this.prisma.tenantTheme.findUnique({ where: { tenant_id: tenantId } });
    const brandName = brand?.brand_name || 'Brand Store';
    const logoUrl = brand?.logo_url || '';
    const primaryColor = brand?.primary_color || '#7C3AED';

    const itemsHtml = order.items.map(i =>
      `<tr>
        <td style="padding:8px 0; border-bottom:1px solid #eee;">${i.product_title}${i.variant_title ? ` (${i.variant_title})` : ''}</td>
        <td style="padding:8px 0; border-bottom:1px solid #eee; text-align:center;">${i.quantity}</td>
        <td style="padding:8px 0; border-bottom:1px solid #eee; text-align:right; font-weight:bold;">₹${(i.price * i.quantity).toFixed(0)}</td>
      </tr>`
    ).join('');

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0; padding:0; background:#f4f4f5; font-family:'Plus Jakarta Sans',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,${primaryColor},#EC4899); padding:28px 32px; text-align:center;">
              <h1 style="margin:0; color:#fff; font-size:22px; font-weight:900; letter-spacing:-0.5px;">
                ${brandName}
              </h1>
              <p style="margin:6px 0 0; color:rgba(255,255,255,0.85); font-size:13px;">Order Confirmed ✅</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 20px; font-size:15px; color:#1e293b;">
                Hi <strong>${order.customer_name}</strong>, thank you for your order! We're processing it right now.
              </p>

              <div style="background:#f8fafc; border-radius:12px; padding:20px; margin-bottom:24px;">
                <p style="margin:0 0 4px; font-size:12px; color:#64748b; font-weight:600; text-transform:uppercase; letter-spacing:0.5px;">Order Summary</p>
                <p style="margin:0; font-size:20px; font-weight:900; color:#0f172a;">${order.order_number}</p>
              </div>

              <!-- Items Table -->
              <table width="100%" cellpadding="0" cellspacing="0" style="font-size:13px; color:#334155;">
                <thead>
                  <tr style="border-bottom:2px solid #e2e8f0;">
                    <th style="padding:8px 0; text-align:left; color:#64748b; font-size:11px; text-transform:uppercase;">Product</th>
                    <th style="padding:8px 0; text-align:center; color:#64748b; font-size:11px; text-transform:uppercase;">Qty</th>
                    <th style="padding:8px 0; text-align:right; color:#64748b; font-size:11px; text-transform:uppercase;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="2" style="padding:12px 0 4px; font-size:14px; font-weight:700; color:#0f172a;">Total Amount</td>
                    <td style="padding:12px 0 4px; text-align:right; font-size:16px; font-weight:900; color:${primaryColor};">₹${order.total_amount.toFixed(0)}</td>
                  </tr>
                </tfoot>
              </table>

              <!-- Shipping -->
              <div style="margin-top:24px; background:#f0fdf4; border-radius:10px; padding:16px; border-left:4px solid #10b981;">
                <p style="margin:0; font-size:12px; font-weight:700; color:#065f46;">📦 Shipping Address</p>
                <p style="margin:4px 0 0; font-size:13px; color:#374151;">${order.customer_name} • ${order.customer_phone}</p>
              </div>

              <!-- CTA -->
              <div style="text-align:center; margin-top:32px;">
                <a href="#" style="display:inline-block; background:linear-gradient(135deg,${primaryColor},#EC4899); color:#fff; text-decoration:none; padding:14px 32px; border-radius:50px; font-weight:800; font-size:14px; letter-spacing:0.3px;">
                  Track My Order →
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px; text-align:center; border-top:1px solid #e2e8f0;">
              <p style="margin:0; font-size:11px; color:#94a3b8;">
                Questions? WhatsApp us or reply to this email.<br/>
                © 2026 ${brandName} · GST Invoice included in your shipment.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    return this.sendEmail({
      to: order.customer_email,
      subject: `✅ Order Confirmed — ${order.order_number} | ${brandName}`,
      html,
      brandName,
    });
  }

  // ------------------------------------------------
  // SHIPPING DISPATCH EMAIL
  // ------------------------------------------------
  async sendShippingDispatch(tenantId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, tenant_id: tenantId },
    });
    if (!order || !order.tracking_awb) return;

    const brand = await this.prisma.tenantTheme.findUnique({ where: { tenant_id: tenantId } });
    const brandName = brand?.brand_name || 'Brand Store';
    const primaryColor = brand?.primary_color || '#7C3AED';

    const html = `
<html><body style="font-family:sans-serif; background:#f4f4f5; padding:32px;">
  <div style="max-width:560px; margin:0 auto; background:#fff; border-radius:16px; overflow:hidden;">
    <div style="background:linear-gradient(135deg,${primaryColor},#EC4899); padding:28px; text-align:center;">
      <h1 style="color:#fff; margin:0;">${brandName}</h1>
      <p style="color:rgba(255,255,255,0.9); margin:6px 0 0;">Your Order Has Shipped! 🚚</p>
    </div>
    <div style="padding:32px;">
      <p>Hi <strong>${order.customer_name}</strong>, your order <strong>${order.order_number}</strong> is on its way!</p>
      <div style="background:#f0fdf4; border-radius:12px; padding:20px; border-left:4px solid #10b981; margin:20px 0;">
        <p style="margin:0; font-weight:700; color:#065f46;">📦 Tracking Details</p>
        <p style="margin:8px 0 0; color:#374151;">Courier: <b>${order.tracking_courier || 'Shiprocket Express'}</b></p>
        <p style="margin:4px 0 0; color:#374151;">AWB Number: <b>${order.tracking_awb}</b></p>
      </div>
      <div style="text-align:center; margin-top:24px;">
        <a href="${order.tracking_url || '#'}" style="background:linear-gradient(135deg,${primaryColor},#EC4899); color:#fff; padding:14px 32px; border-radius:50px; text-decoration:none; font-weight:800;">
          Track Live Location →
        </a>
      </div>
    </div>
  </div>
</body></html>`;

    return this.sendEmail({
      to: order.customer_email,
      subject: `🚚 Your Order ${order.order_number} Has Shipped! | ${brandName}`,
      html,
      brandName,
    });
  }
}
