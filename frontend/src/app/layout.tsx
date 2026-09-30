import './globals.css';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import { getTenantTheme } from '@/lib/api';
import { generateThemeCssVariables } from '@/lib/theme';

export async function generateMetadata(): Promise<Metadata> {
  const headersList = headers();
  const host = headersList.get('host') || 'aurabeauty.srijanplatform.com';
  const tenantSlug = headersList.get('x-tenant-slug') || host.split('.')[0] || 'aura-beauty';

  try {
    const theme = await getTenantTheme(tenantSlug);
    return {
      title: `${theme.brand_name} | Official Store`,
      description: `Welcome to ${theme.brand_name}. Shop premium products online.`,
      icons: {
        icon: theme.favicon_url || '/favicon.ico',
      },
    };
  } catch (err) {
    return {
      title: 'Srijan D2C Store',
      description: 'White-Label Multi-Tenant D2C Platform',
    };
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = headers();
  const host = headersList.get('host') || 'aurabeauty.srijanplatform.com';
  const tenantSlug = headersList.get('x-tenant-slug') || host.split('.')[0] || 'aura-beauty';

  let theme = null;
  try {
    theme = await getTenantTheme(tenantSlug);
  } catch (err) {
    // Fallback theme
    theme = {
      tenant_id: 'aura-beauty-tenant-uuid-001',
      brand_name: 'Aura Beauty',
      primary_color: '#7C3AED',
      secondary_color: '#EC4899',
      accent_color: '#10B981',
      background_color: '#0F172A',
      text_color: '#F8FAFC',
      heading_font: 'Playfair Display',
      body_font: 'Plus Jakarta Sans',
      border_radius: '12px',
      card_style: 'glassmorphism',
      header_style: 'sticky',
    };
  }

  const cssVariables = generateThemeCssVariables(theme);

  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{ __html: cssVariables }} />
      </head>
      <body className="min-h-screen bg-[var(--background-color)] text-[var(--text-color)] antialiased selection:bg-purple-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
