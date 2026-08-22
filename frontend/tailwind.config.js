/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Light mode – warm parchment
        parchment: {
          50: '#fdfaf5',
          100: '#f8f1e3',
          200: '#f0e4c9',
          300: '#e6d4a8',
          400: '#d4b87a',
          500: '#c19a4a',
        },
        // Shared warm brown scale (mostly for light mode)
        ink: {
          50: '#f5f0eb',
          100: '#e8ddd0',
          200: '#d1bba6',
          300: '#b8967a',
          400: '#9c7356',
          500: '#825c45',
          600: '#6b4a38',
          700: '#573c2e',
          800: '#483228',
          900: '#3d2b23',
          950: '#2c1810',
        },
        leather: {
          400: '#c4784a',
          500: '#a65d2e',
          600: '#8b4513',
          700: '#6b3410',
        },
        // Dark mode – soft night charcoal (not muddy brown)
        night: {
          50: '#f4f1ec',
          100: '#e8e2d9',
          200: '#cfc5b6',
          300: '#a89a88',
          400: '#8a7b6a',
          500: '#6e6154',
          600: '#564c42',
          700: '#3f3832',
          800: '#2a2622',
          850: '#221f1c',
          900: '#1a1816',
          950: '#121110',
        },
        // Soft cream text for dark mode
        cream: {
          50: '#faf8f5',
          100: '#f5f0e8',
          200: '#ebe3d6',
          300: '#ddd2c0',
          400: '#c9bba5',
        },
      },
      fontFamily: {
        serif: ['Libre Baskerville', 'Georgia', 'serif'],
        'serif-alt': ['Merriweather', 'Georgia', 'serif'],
        'serif-classic': ['EB Garamond', 'Garamond', 'serif'],
        'serif-modern': ['Lora', 'Georgia', 'serif'],
        'serif-elegant': ['Playfair Display', 'Georgia', 'serif'],
        'serif-book': ['Crimson Text', 'Georgia', 'serif'],
        'serif-old': ['Cormorant Garamond', 'Garamond', 'serif'],
        'serif-clean': ['Source Serif 4', 'Georgia', 'serif'],
        'serif-soft': ['Literata', 'Georgia', 'serif'],
        'serif-strong': ['Libre Caslon Text', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        book: '0 10px 40px -10px rgba(44, 24, 16, 0.35), 0 4px 12px -2px rgba(44, 24, 16, 0.15)',
        'book-dark': '0 10px 40px -10px rgba(0, 0, 0, 0.5), 0 4px 12px -2px rgba(0, 0, 0, 0.3)',
        page: '0 2px 8px rgba(44, 24, 16, 0.08)',
        'page-dark': '0 2px 12px rgba(0, 0, 0, 0.25)',
      },
      backgroundImage: {
        'paper-texture':
          "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};
