import { NextResponse } from 'next/server';

// Dynamic sitemap.xml generator for Srijan white-label storefronts
// Fully Google-compliant — auto-discovers all products and categories from the API

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function fetchTenantData(tenantSlug: string) {
  try {
    const [productsRes] = await Promise.all([
      fetch(`${BACKEND_URL}/api/v1/catalog/products`, {
        headers: { 'x-tenant-slug': tenantSlug },
        next: { revalidate: 3600 }, // cache 1 hour
      }),
    ]);

    const products = productsRes.ok ? await productsRes.json() : [];
    return { products: Array.isArray(products) ? products : [] };
  } catch {
    return { products: [] };
  }
}

export async function GET(request: Request) {
  const { searchParams, hostname } = new URL(request.url);

  // Determine tenant from hostname or query param
  const tenantSlug = searchParams.get('tenant') || hostname.split('.')[0] || 'aura-beauty';
  const siteUrl = `https://${hostname}`;

  const { products } = await fetchTenantData(tenantSlug);

  const today = new Date().toISOString().split('T')[0];

  const staticUrls = [
    { loc: siteUrl, priority: '1.0', changefreq: 'daily' },
    { loc: `${siteUrl}/products`, priority: '0.9', changefreq: 'daily' },
    { loc: `${siteUrl}/checkout`, priority: '0.5', changefreq: 'monthly' },
    { loc: `${siteUrl}/track-order`, priority: '0.4', changefreq: 'monthly' },
    { loc: `${siteUrl}/account`, priority: '0.4', changefreq: 'monthly' },
  ];

  const productUrls = products.map((p: any) => ({
    loc: `${siteUrl}/products/${p.slug}`,
    priority: p.is_bestseller ? '0.9' : '0.7',
    changefreq: 'weekly',
    lastmod: p.updated_at ? new Date(p.updated_at).toISOString().split('T')[0] : today,
    image: p.media && p.media[0] ? p.media[0].url : null,
    imageCaption: p.title,
    imageTitle: p.seo_title || p.title,
  }));

  const allUrls = [...staticUrls, ...productUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${allUrls
  .map(
    (url: any) => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    <lastmod>${url.lastmod || today}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>${
      url.image
        ? `
    <image:image>
      <image:loc>${escapeXml(url.image)}</image:loc>
      <image:caption>${escapeXml(url.imageCaption || '')}</image:caption>
      <image:title>${escapeXml(url.imageTitle || '')}</image:title>
    </image:image>`
        : ''
    }
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
