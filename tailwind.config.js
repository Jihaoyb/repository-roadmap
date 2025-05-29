/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FFF5E6',  // Lightest cream
          100: '#FFE4C4', // Light cream
          200: '#FFDAB9', // Soft cream
          300: '#FFC0CB', // Pink cream
          400: '#DEB887', // Medium cream
          500: '#D2B48C', // Tan
          600: '#BC8F8F', // Rosy brown
          700: '#A0522D', // Sienna
          800: '#8B4513', // Saddle brown
          900: '#654321', // Dark brown
        },
      },
    },
  },
  plugins: [],
}