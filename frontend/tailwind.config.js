/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          0: '#000000',
          1: '#080808',
          2: '#111111',
          3: '#1a1a1a',
          4: '#242424',
          5: '#2e2e2e',
          6: '#383838',
        },
        wire: '#00FF87',
        dim: {
          1: '#aaaaaa',
          2: '#777777',
          3: '#444444',
          4: '#2a2a2a',
          5: '#1e1e1e',
        },
        neg: '#ff4444',
        pos: '#00FF87',
        warn: '#ffaa00',
        info: '#4d9eff',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'Fira Code', 'monospace'],
        display: ['var(--font-display)', 'var(--font-sans)', 'system-ui'],
      },
      fontSize: {
        'display': ['clamp(3.5rem, 9vw, 8rem)', { lineHeight: '0.88', letterSpacing: '-0.05em', fontWeight: '900' }],
        'headline': ['clamp(2rem, 5vw, 4rem)', { lineHeight: '0.95', letterSpacing: '-0.04em', fontWeight: '800' }],
        'title': ['1.125rem', { lineHeight: '1.25', letterSpacing: '-0.02em', fontWeight: '700' }],
        'label': ['0.6875rem', { lineHeight: '1.4', letterSpacing: '0.1em', fontWeight: '500' }],
        'micro': ['0.5625rem', { lineHeight: '1.4', letterSpacing: '0.1em', fontWeight: '600' }],
      },
      animation: {
        'ticker': 'ticker 40s linear infinite',
        'blink': 'blink 1s step-end infinite',
        'pulse-dim': 'pulse-dim 2s ease-in-out infinite',
        'count': 'count 1.5s ease-out forwards',
        'slide-up': 'slide-up 0.4s ease-out forwards',
      },
      keyframes: {
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        'pulse-dim': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 0 0 rgba(0, 255, 135, 0.4)' },
          '50%': { opacity: '0.7', boxShadow: '0 0 0 6px rgba(0, 255, 135, 0)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
