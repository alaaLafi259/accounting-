/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#F3F5F6',
        surface: '#FFFFFF',
        'surface-alt': '#F8F9FA',
        border: '#E2E6E8',
        ink: '#1E2A32',
        'ink-soft': '#5B6B74',
        'ink-faint': '#8B979E',
        primary: {
          DEFAULT: '#17394A',
          dark: '#0F2833',
          soft: '#E8EEF0',
        },
        accent: {
          DEFAULT: '#A9843C',
          dark: '#8A6B2F',
          soft: '#F3ECDD',
        },
        success: { DEFAULT: '#2E6F4E', soft: '#E4F0E9' },
        danger: { DEFAULT: '#A23B2A', soft: '#F7E7E3' },
        warning: { DEFAULT: '#B4801F', soft: '#FBF0DC' },
      },
      fontFamily: {
        display: ['"Almarai"', 'system-ui', 'sans-serif'],
        body: ['"IBM Plex Sans Arabic"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(20, 35, 45, 0.06), 0 1px 1px rgba(20, 35, 45, 0.04)',
        popover: '0 12px 32px rgba(15, 40, 51, 0.16)',
      },
      borderRadius: {
        xl: '14px',
      },
    },
  },
  plugins: [],
}
