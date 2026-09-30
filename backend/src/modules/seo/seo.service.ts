import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class SeoService {
  constructor(private prisma: PrismaService) {}

  // Generate XML Sitemap dynamically per tenant
  async generateSitemapXml(tenantId: string, host: string): Promise<string> {
    const products = await this.prisma.product.findMany({
      where: { tenant_id: tenantId, status: 'ACTIVE' },
      select: { slug: true, updated_at: true },
    });

    const categories = await this.prisma.category.findMany({
      where: { tenant_id: tenantId },
      select: { slug: true },
    });

    const baseUrl = `https://${host}`;

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Homepage
    xml += `  <url>\n    <loc>${baseUrl}/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;

    // Categories
    for (const cat of categories) {
      xml += `  <url>\n    <loc>${baseUrl}/collections/${cat.slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    }

    // Products
    for (const p of products) {
      xml += `  <url>\n    <loc>${baseUrl}/products/${p.slug}</loc>\n    <lastmod>${p.updated_at.toISOString().split('T')[0]}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
    }

    xml += `</urlset>`;
    return xml;
  }

  // Generate robots.txt
  async generateRobotsTxt(host: string): Promise<string> {
    return `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /checkout\nDisallow: /api/\n\nSitemap: https://${host}/sitemap.xml`;
  }

  // Schema.org Product & Offer JSON-LD schema builder
  async generateProductJsonLd(tenantId: string, slug: string, host: string) {
    const product = await this.prisma.product.findFirst({
      where: { tenant_id: tenantId, slug, status: 'ACTIVE' },
      include: { media: true, variants: true, category: true },
    });

    if (!product) return null;

    const brand = await this.prisma.tenantTheme.findUnique({
      where: { tenant_id: tenantId },
    });

    const images = product.media.map(m => m.url);
    const lowPrice = Math.min(...product.variants.map(v => v.price), product.price);
    const highPrice = Math.max(...product.variants.map(v => v.price), product.price);

    return {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name: product.title,
      image: images.length > 0 ? images : [`https://${host}/placeholder.jpg`],
      description: product.seo_description || product.description,
      sku: product.sku,
      brand: {
        '@type': 'Brand',
        name: brand ? brand.brand_name : 'Brand Store',
      },
      offers: {
        '@type': 'AggregateOffer',
        url: `https://${host}/products/${product.slug}`,
        priceCurrency: 'INR',
        lowPrice,
        highPrice,
        offerCount: product.variants.length,
        availability: 'https://schema.org/InStock',
      },
    };
  }

  // Google Merchant Center Feed (JSON format)
  async generateGoogleMerchantFeed(tenantId: string, host: string) {
    const products = await this.prisma.product.findMany({
      where: { tenant_id: tenantId, status: 'ACTIVE' },
      include: { media: true, variants: true, category: true },
    });

    return products.map(p => ({
      id: p.id,
      title: p.title,
      description: p.description,
      link: `https://${host}/products/${p.slug}`,
      image_link: p.media[0] ? p.media[0].url : '',
      availability: p.variants.some(v => v.inventory_count > 0) ? 'in stock' : 'out of stock',
      price: `${p.price} INR`,
      brand: host,
      condition: 'new',
    }));
  }
}
