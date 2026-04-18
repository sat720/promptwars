/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'stadium-dark': '#0f172a',
        'stadium-card': '#1e293b',
        'neon-green': '#22c55e',
        'neon-red': '#ef4444',
        'neon-yellow': '#eab308'
      }
    },
  },
  plugins: [],
}
