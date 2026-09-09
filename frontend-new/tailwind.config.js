/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#070a0f',
          900: '#0b0f17',
          850: '#111723',
          800: '#172030',
          700: '#233047',
          600: '#334461',
        },
        accent: {
          emerald: '#10b981',
          amber: '#f59e0b',
          indigo: '#6366f1',
          cyan: '#06b6d4',
          rose: '#f43f5e',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      }
    },
  },
  plugins: [],
}
