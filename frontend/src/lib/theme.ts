export interface ThemeConfig {
  tenant_id: string;
  brand_name: string;
  logo_url?: string;
  favicon_url?: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  heading_font: string;
  body_font: string;
  border_radius: string;
  card_style: 'glassmorphism' | 'bordered' | 'minimal' | 'shadow';
  header_style: 'sticky' | 'centered' | 'minimal';
  custom_css?: string;
}

export function generateThemeCssVariables(theme: ThemeConfig): string {
  return `
    :root {
      --primary-color: ${theme.primary_color || '#7C3AED'};
      --secondary-color: ${theme.secondary_color || '#EC4899'};
      --accent-color: ${theme.accent_color || '#10B981'};
      --background-color: ${theme.background_color || '#F8FAFC'};
      --text-color: ${theme.text_color || '#0F172A'};
      --heading-font: '${theme.heading_font || 'Playfair Display'}', serif;
      --body-font: '${theme.body_font || 'Plus Jakarta Sans'}', sans-serif;
      --border-radius: ${theme.border_radius || '8px'};
    }
  `;
}
