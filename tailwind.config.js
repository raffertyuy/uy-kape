/** @type {import('tailwindcss').Config} */
export default {
  darkMode: false, // Disable dark mode entirely to enforce light theme only
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        coffee: {
          50: '#f9f7f4',   // Very light cream background - extracted from logo
          100: '#f0ebe3',  // Light cream for cards and subtle backgrounds
          200: '#e1d5c7',  // Soft beige for hover states
          300: '#d0c0a8',  // Medium beige for borders
          400: '#b8a082',  // Warm tan for secondary text
          500: '#9c7c54',  // Medium brown for interactive elements
          600: '#7d5a34',  // Primary brown for buttons and accents
          700: '#654426',  // Dark brown for text
          800: '#4a2c1a',  // Very dark brown for headings - extracted from logo
          900: '#2d1810',  // Deepest brown for high contrast text
          950: '#1a0e08',  // Almost black brown for maximum contrast
        },
        // Add complementary accent colors for UI elements
        accent: {
          orange: '#e67e22',  // Warm orange for warnings and highlights
          green: '#27ae60',   // Fresh green for success states
          red: '#e74c3c',     // Warm red for errors
          blue: '#3498db',    // Soft blue for information
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      // Add brand-specific spacing and sizing
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      // Brand-specific border radius
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
      },
      // Coffee-themed shadows
      boxShadow: {
        'coffee': '0 4px 6px -1px rgba(77, 44, 26, 0.1), 0 2px 4px -1px rgba(77, 44, 26, 0.06)',
        'coffee-lg': '0 10px 15px -3px rgba(77, 44, 26, 0.1), 0 4px 6px -2px rgba(77, 44, 26, 0.05)',
      }
    },
  },
  plugins: [],
}