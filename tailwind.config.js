/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        asu: {
          maroon: '#8C1D40',
          gold: '#FFC627',
          dark: '#1A1A1A',
          darker: '#121212',
        }
      }
    },
  },
  plugins: [
    require('tailwind-scrollbar')
  ],
}