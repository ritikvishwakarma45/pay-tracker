/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Core branding palette
        primary: '#151c27',      // Deep Charcoal
        secondary: '#006c49',    // Muted Emerald Green
        accent: '#10B981',       // Vibrant Emerald Green
        surface: '#F8F9FA',      // Light Gray Card Background
        background: '#FFFFFF',   // Pure White Base
        
        // Semantic variables matching DESIGN.md
        'on-background': '#151c27',
        'on-surface-variant': '#46474a',
        'surface-container-high': '#e2e8f8',
        'surface-container-highest': '#dce2f3',
        'error': '#ba1a1a',
        'error-container': '#ffdad6',
        
        // Dark Mode support
        dark: {
          bg: '#0F172A',
          card: '#1E293B',
          text: '#F8FAFC',
          border: '#334155'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'scan': 'scan-vertical 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite',
      },
    },
  },
  plugins: [],
}
