/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#F3F0EA',
        surface: '#FBFAF7',
        elevated: '#FFFFFF',
        border: '#DDD6CB',
        'border-hot': '#CFC6B8',
        text: '#171615',
        dim: '#726D66',
        muted: '#A09A90',
        accent: '#7A1028',
        'accent-dark': '#4A0B1A',
        wine: '#7A1028',
        brand: '#7A1028',
        gold: '#B89A62',
        green: '#657B5F',
        blue: '#5A6578',
        warn: '#B58A3A',
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        panel: '6px',
        btn: '4px',
      },
      letterSpacing: {
        luxury: '0.14em',
      },
      maxWidth: {
        editorial: '40rem',
        content: '52rem',
        wide: '68rem',
      },
      screens: {
        xs: '400px',
      },
    },
  },
  plugins: [],
}
