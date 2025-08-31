/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './public/**/*.html',
    './src/views/**/*.{js,jsx,ts,tsx,ejs,pug}', // For server-side rendered views
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        'primary': {
          light: '#3B82F6',
          DEFAULT: '#1D4ED8',
          dark: '#1E40AF',
        },
        'secondary': {
          light: '#FBBF24',
          DEFAULT: '#F59E0B',
          dark: '#D97706',
        },
        'accent': {
          light: '#F472B6',
          DEFAULT: '#EC4899',
          dark: '#DB2777',
        },
        'neutral': '#1F2937',
        'base-100': '#F9FAFB',
        'base-content': '#111827',
      },
    },
  },
  plugins: [],
}
