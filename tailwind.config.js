/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        coffee: {
          50: '#fdf7f0',
          100: '#faebd7',
          200: '#f4d5ae',
          300: '#ecb97d',
          400: '#e39849',
          500: '#d87c30',
          600: '#c96725',
          700: '#a75421',
          800: '#874420',
          900: '#6e3a1c',
          950: '#3b1d0e',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}