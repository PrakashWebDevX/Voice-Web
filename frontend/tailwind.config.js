/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        acid: '#39FF14',
        'acid-dim': '#2BCF10',
        terminal: '#0a0a0a',
        surface: '#111111',
        'surface-2': '#1a1a1a',
        'surface-3': '#222222',
        border: '#2a2a2a',
        'border-bright': '#3a3a3a',
        muted: '#666666',
        subtle: '#444444',
      },
      fontFamily: {
        mono: ['var(--font-mono)', 'JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['var(--font-display)', 'Space Grotesk', 'sans-serif'],
        body: ['var(--font-body)', 'Inter', 'sans-serif'],
      },
      animation: {
        'scan': 'scan 8s linear infinite',
        'flicker': 'flicker 0.15s infinite',
        'pulse-acid': 'pulse-acid 2s ease-in-out infinite',
        'blink': 'blink 1s step-end infinite',
        'slide-up': 'slide-up 0.4s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'typing': 'typing 0.05s steps(1)',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.95' },
        },
        'pulse-acid': {
          '0%, 100%': { boxShadow: '0 0 8px #39FF14, 0 0 20px #39FF1440' },
          '50%': { boxShadow: '0 0 16px #39FF14, 0 0 40px #39FF1460' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      backgroundImage: {
        'grid-pattern': `linear-gradient(rgba(57, 255, 20, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(57, 255, 20, 0.03) 1px, transparent 1px)`,
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
    },
  },
  plugins: [],
};
