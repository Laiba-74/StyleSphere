// tailwind.config.js
module.exports = {
  darkMode: 'class', // Make sure this is set
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        customTeal: {
          600: '#006D77',
        },
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide'),
  ],
}
