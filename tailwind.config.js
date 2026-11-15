/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        bankers: {
          sage: '#738F6D',
          sageDark: '#5E7858',
          sageLight: '#E8EFE6',
          sageSoft: '#F3F7F2',
          darkBg: '#1C2822',
          darkCard: '#26352D',
          darkCardHover: '#2E4037',
          darkBorder: '#35493E',
          mint: '#4ADE80',
          emerald: '#2D6A4F',
          accentGreen: '#52B788',
        }
      }
    },
  },
  plugins: [],
}
