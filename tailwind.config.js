/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#D97706', // Warm Amber (Amber-600)
        secondary: '#FFB703', // Warm Yellow
        accent: '#F59E0B', // Bright Amber (Amber-500)
        premium: {
          50: '#FFFBEB',   // Lightest gold
          100: '#FEF3C7',  // Very light gold
          200: '#FDE68A',  // Light gold
          300: '#FCD34D',  // Medium light gold
          400: '#FBBF24',  // Medium gold
          500: '#F59E0B',  // Base gold
          600: '#D97706',  // Dark gold
          700: '#B45309',  // Darker gold
          800: '#92400E',  // Very dark gold
          900: '#78350F',  // Darkest gold
        },
        gold: {
          light: '#FFD700',
          DEFAULT: '#FFC107',
          dark: '#FF9800',
        },
        amber: {
          light: '#FFF8E1',
          DEFAULT: '#FFC107',
          dark: '#FF6F00',
        },
        neutral: {
          50: '#F7FAFC', // Soft White
          900: '#1A202C', // Dark Charcoal
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
      }
    },
  },
  plugins: [],
};