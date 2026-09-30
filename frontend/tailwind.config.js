/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: 'var(--primary-color, #7C3AED)',
          secondary: 'var(--secondary-color, #EC4899)',
          accent: 'var(--accent-color, #10B981)',
          bg: 'var(--background-color, #F8FAFC)',
          text: 'var(--text-color, #0F172A)',
        },
      },
      borderRadius: {
        brand: 'var(--border-radius, 8px)',
      },
      fontFamily: {
        heading: ['var(--heading-font)', 'serif'],
        body: ['var(--body-font)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
