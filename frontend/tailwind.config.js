/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nhsBlue: '#005EB8',
        compassGreen: '#00AC7B'
      },
    },
  },
  plugins: [],
} 