/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: { DEFAULT: '#0f0f13', secondary: '#13131a', card: '#1a1a24', border: '#2a2a3a' },
        accent: { DEFAULT: '#6366f1', hover: '#5254cc', light: 'rgba(99,102,241,0.15)' },
        text: { primary: '#f1f1f5', secondary: '#a0a0b8', muted: '#6b6b84' },
      },
    },
  },
  plugins: [],
}
