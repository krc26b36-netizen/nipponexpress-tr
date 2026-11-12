/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: 'var(--bg)',
        surface: 'var(--surface)',
        surface2: 'var(--surface-2)',
        edge: 'var(--border)',
        shu: {
          DEFAULT: 'rgb(var(--accent-rgb) / <alpha-value>)',
          hover: 'rgb(var(--accent-hover-rgb) / <alpha-value>)',
          grad: 'rgb(var(--accent-grad-rgb) / <alpha-value>)',
        },
        gold: 'rgb(var(--gold-rgb) / <alpha-value>)',
        matcha: 'rgb(var(--success-rgb) / <alpha-value>)',
        indigo2: 'rgb(var(--info-rgb) / <alpha-value>)',
        warm: 'var(--text)',
        muted: 'var(--text-muted)',
        faint: 'var(--text-faint)',
        sakura: '#F7C6D0',
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', '"Noto Sans JP"', 'sans-serif'],
        sans: ['Inter', '"Noto Sans JP"', 'sans-serif'],
        jp: ['"Noto Sans JP"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        glow: '0 0 0 1px var(--border), 0 8px 30px rgba(0,0,0,0.35)',
        'shu-glow': '0 0 18px rgba(232,69,44,0.35)',
        'gold-glow': '0 0 18px rgba(224,176,74,0.3)',
        'matcha-glow': '0 0 18px rgba(127,176,105,0.3)',
        'indigo-glow': '0 0 18px rgba(108,142,245,0.3)',
      },
      keyframes: {
        floaty: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        floaty: 'floaty 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
