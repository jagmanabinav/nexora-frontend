/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './packages/shared/src/**/*.{js,ts,jsx,tsx}',
    './packages/admin/app/**/*.{js,ts,jsx,tsx}',
    './packages/admin/src/**/*.{js,ts,jsx,tsx}',
    './packages/fabwash/app/**/*.{js,ts,jsx,tsx}',
    './packages/fabwash/src/**/*.{js,ts,jsx,tsx}',
    './packages/retail/app/**/*.{js,ts,jsx,tsx}',
    './packages/retail/src/**/*.{js,ts,jsx,tsx}',
    './packages/medical/app/**/*.{js,ts,jsx,tsx}',
    './packages/medical/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c3d66',
        },
        secondary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        },
      },
      spacing: {
        safe: 'max(var(--spacing), env(safe-area-inset-bottom))',
      },
    },
  },
  plugins: [],
}
