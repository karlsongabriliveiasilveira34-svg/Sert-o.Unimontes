/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Neulis Alt"', 'Syne', 'Inter', 'sans-serif'],
        sans: ['"DM Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      colors: {
        veredas: {
          dark: '#0d0a07',
          card: '#16110c',
          elevated: '#1f1812',
          sand: '#e4ceaa',
          'sand-muted': '#a89279',
          terracotta: '#c4602c',
          'terracotta-glow': '#e06e36',
          green: '#526644',
          'green-light': '#728c60',
          sertao: '#e67e22',
          border: '#2d2218',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'signal-wave': 'signalWave 2.8s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        'float-gentle': 'floatGentle 5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        signalWave: {
          '0%': { transform: 'scale(0.85)', opacity: '0.9' },
          '50%': { transform: 'scale(1.15)', opacity: '0.4' },
          '100%': { transform: 'scale(0.85)', opacity: '0.9' },
        },
        floatGentle: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
}
