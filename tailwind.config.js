/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#00D4FF',
        'secondary': '#1A1B23',
        'dark': '#0A0B0F',
        'success': '#00FF88',
        'danger': '#FF3366',
        'warning': '#FFB800'
      },
      fontFamily: {
        'mono': ['SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}