/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#F6F4EF',
        surface: '#FDFCFA',
        elevated: '#F0EDE6',
        border: '#E5E1D8',
        'border-hot': '#D4CFC4',
        text: '#1C1B19',
        dim: '#5C5752',
        muted: '#9A948C',
        accent: '#6E0D25',
        'accent-dark': '#4A0B1A',
        wine: '#6E0D25',
        brand: '#6E0D25',
        green: '#4A6B5A',
        blue: '#5A6578',
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      borderRadius: {
        panel: '2px',
        btn: '2px',
      },
      letterSpacing: {
        luxury: '0.22em',
      },
      spacing: {
        'screen-x': '2.5rem',
        'section': '4rem',
      },
      maxWidth: {
        editorial: '42rem',
        content: '56rem',
        wide: '72rem',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 500ms ease-out forwards',
      },
    },
  },
  plugins: [],
}
