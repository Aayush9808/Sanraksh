/** @type {import('tailwindcss').Config} */
const { fontFamily } = require('tailwindcss/defaultTheme')
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: { 0:'#060402', 1:'#0A0806', 2:'#14100A', 3:'#1E1810', 4:'#2A2218', 5:'#36301E', 6:'#443B25' },
        amber:   { DEFAULT:'#F59E0B', bright:'#FCD34D', dim:'#D97706', deep:'#92400E', muted:'#78350F', fg:'#0A0806' },
        signal:  { live:'#10B981', warn:'#F59E0B', neg:'#EF4444', info:'#60A5FA' },
        ink:     { 1:'#F5F0E8', 2:'#C8BAA0', 3:'#9A8A72', 4:'#6B5C44', 5:'#4A3E2A', 6:'#2C2418' },
      },
      fontFamily: {
        sans: ['var(--font-sans)', ...fontFamily.sans],
        mono: ['var(--font-mono)', 'Fira Code', 'monospace'],
      },
      fontSize: {
        display:  ['clamp(4rem,10vw,9rem)',    { lineHeight:'0.86', letterSpacing:'-0.04em',  fontWeight:'800' }],
        headline: ['clamp(2.25rem,5vw,4.5rem)',{ lineHeight:'0.9',  letterSpacing:'-0.035em', fontWeight:'800' }],
        title:    ['1.125rem',  { lineHeight:'1.3',  letterSpacing:'-0.02em',  fontWeight:'700' }],
        'num-xl': ['clamp(3rem,7vw,6.5rem)', { lineHeight:'0.85', letterSpacing:'-0.05em',  fontWeight:'800' }],
        'num-lg': ['2.5rem',   { lineHeight:'0.9',  letterSpacing:'-0.04em',  fontWeight:'700' }],
        'num-md': ['1.75rem',  { lineHeight:'0.95', letterSpacing:'-0.03em',  fontWeight:'700' }],
        label: ['0.6875rem', { lineHeight:'1.4', letterSpacing:'0.09em', fontWeight:'500' }],
        micro: ['0.5625rem', { lineHeight:'1.4', letterSpacing:'0.1em',  fontWeight:'600' }],
      },
      animation: {
        'pulse-amber':'pulse-amber 2.5s ease-in-out infinite',
        'pulse-live': 'pulse-live 2s ease-in-out infinite',
        'fade-up':    'fade-up 0.5s cubic-bezier(0.16,1,0.3,1) forwards',
        'slide-in':   'slide-in 0.35s cubic-bezier(0.16,1,0.3,1) forwards',
        'slide-up':   'slide-up 0.3s cubic-bezier(0.16,1,0.3,1) forwards',
        'float':      'float 6s ease-in-out infinite',
        'blink':      'blink 1.2s step-end infinite',
        'bar':        'bar 1s cubic-bezier(0.16,1,0.3,1) forwards',
      },
      keyframes: {
        'pulse-amber': {'0%,100%':{boxShadow:'0 0 0 0 rgba(245,158,11,0.3)',opacity:'1'},'50%':{boxShadow:'0 0 0 8px rgba(245,158,11,0)',opacity:'.8'}},
        'pulse-live':  {'0%,100%':{boxShadow:'0 0 0 0 rgba(16,185,129,0.4)',opacity:'1'},'50%':{boxShadow:'0 0 0 6px rgba(16,185,129,0)',opacity:'.7'}},
        'fade-up':  {'0%':{transform:'translateY(20px)',opacity:'0'},'100%':{transform:'translateY(0)',opacity:'1'}},
        'slide-in': {'0%':{transform:'translateX(100%)'},'100%':{transform:'translateX(0)'}},
        'slide-up': {'0%':{transform:'translateY(12px)',opacity:'0'},'100%':{transform:'translateY(0)',opacity:'1'}},
        'float':    {'0%,100%':{transform:'translateY(0)'},'50%':{transform:'translateY(-10px)'}},
        'blink':    {'0%,100%':{opacity:'1'},'50%':{opacity:'0'}},
        'bar':      {'0%':{transform:'scaleX(0)'},'100%':{transform:'scaleX(1)'}},
      },
      borderRadius: { sm:'3px', DEFAULT:'6px', md:'8px', lg:'12px', xl:'16px', '2xl':'20px' },
    },
  },
  plugins: [],
}
