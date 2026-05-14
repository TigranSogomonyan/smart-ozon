/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0A0F1E',
          800: '#0D1426',
          700: '#141929',
          600: '#1A2035',
          500: '#222940',
        },
        coral: {
          400: '#FF8555',
          500: '#FF6B35',
          600: '#E85A25',
        },
        violet: {
          400: '#8B84FF',
          500: '#6C63FF',
        },
      },
      fontFamily: {
        heading: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
