/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: '#04070d',
        base2: '#070c16',
        panel: '#0b1220',
        panel2: '#0e1729',
        line: '#1b2740',
        ink: '#e6edf3',
        muted: '#8b98a9',
        dim: '#5b6b7f',
        // Academy accent — driven by --acc-rgb so each academy can re-theme it.
        acid: 'rgb(var(--acc-rgb) / <alpha-value>)',
        cyan: '#38bdf8',
        blue: '#4f7cff',
        violet: '#a78bfa',
        warn: '#fbbf24',
        danger: '#f87171'
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Cascadia Code', 'Consolas', 'ui-monospace', 'monospace']
      },
      boxShadow: {
        glow: '0 0 24px rgb(var(--acc-rgb) / 0.14)',
        'glow-cyan': '0 0 24px rgba(56, 189, 248, 0.14)',
        panel: '0 8px 30px rgba(0,0,0,0.35)'
      },
      animation: {
        'fade-up': 'fadeUp 0.45s ease both',
        'fade-in': 'fadeIn 0.3s ease both',
        'pulse-soft': 'pulseSoft 2.4s ease-in-out infinite',
        blink: 'blink 1.1s step-end infinite'
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.55' }
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' }
        }
      }
    }
  },
  plugins: []
};
