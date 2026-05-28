/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        echo: {
          bg: '#0A0A0B',
          panel: '#0F0F11',
          panel2: '#131316',
          border: '#1C1C20',
          text: '#E6E6E8',
          muted: '#76767C',
          faint: '#4A4A50',
          accent: '#31E0A0',
          neg: '#E2604A',
          warn: '#E0A33A',
        },
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}
