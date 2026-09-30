import { NextResponse } from 'next/server';

// Dynamic robots.txt — prevents Googlebot from indexing admin/checkout pages,
// allows all product and storefront pages, and points to the sitemap.

export async function GET(request: Request) {
  const { hostname } = new URL(request.url);
  const siteUrl = `https://${hostname}`;

  const robotsTxt = `# Robots.txt auto-generated for ${hostname}
# DO NOT expose the underlying platform — full white-label stealth

User-agent: *
Allow: /
Allow: /products/
Allow: /sitemap.xml

# Block admin panels and internal routes from public indexing
Disallow: /admin/
Disallow: /api/
Disallow: /checkout/
Disallow: /account/
Disallow: /track-order/
Disallow: /?operator=true

# Block noisy URL query params
Disallow: /*?tenant=*
Disallow: /*?debug=*

# Crawl rate (be kind to our servers during peak hours)
Crawl-delay: 2

# Sitemap location for Google Search Console
Sitemap: ${siteUrl}/sitemap.xml
`;

  return new NextResponse(robotsTxt, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
