/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      width: {
        '70': '17.5rem', // 280px for expanded sidebar
      },
      margin: {
        '70': '17.5rem', // 280px for expanded sidebar
      },
    },
  },
  plugins: [],
}
