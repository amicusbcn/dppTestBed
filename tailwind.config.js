/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        baidata: {
          purple: '#6847A8',
          purpleDark: '#513587',
          lavender: '#C4B3E2',
          lavenderSoft: '#EFEAF8',
          idsaBlue: '#4BA3C7',
          redAccent: '#E63946',
          ink: '#1A1A1E',
          bg: '#F4F4F6',
        },
      },
    },
  },
  plugins: [],
};