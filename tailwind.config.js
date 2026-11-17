module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#E65100', dark: '#BF4400', light: '#FFF3E8' },
        teal: { DEFAULT: '#00695C', dark: '#004D40', light: '#E0F2F1' },
      },
      fontFamily: { sans: ['var(--font-sans)', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
};
