/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'stadium-dark': '#020617', // Deeper, more premium slate-black
        'stadium-card': '#0f172a', // Rich navy-slate for contrast
        'stadium-card-hover': '#1e293b',
        'neon-green': '#22c55e',
        'neon-red': '#ef4444',
        'neon-yellow': '#eab308'
      }
    },
  },
  plugins: [
    require('tailwindcss-animate')
  ],
}
