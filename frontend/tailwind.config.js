/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark theme palette
        dark: {
          950: '#030610',
          900: '#060b14',
          800: '#0a1020',
          700: '#0f172a',
          600: '#1e293b',
          500: '#334155',
        },
        // Brand colors
        brand: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Cascadia Code', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'glow-sm':  '0 0 15px -3px rgba(99, 102, 241, 0.4)',
        'glow':     '0 0 30px -5px rgba(99, 102, 241, 0.5)',
        'glow-lg':  '0 0 50px -8px rgba(99, 102, 241, 0.6)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.1)',
        'card':     '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
        'premium':  '0 20px 60px -15px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255,255,255,0.05)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'spin-slow':     'spin 8s linear infinite',
        'pulse-slow':    'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounce 2s infinite',
        'gradient':      'gradientShift 4s ease infinite',
        'shimmer':       'shimmer 1.8s infinite',
        'fade-in':       'fadeIn 0.4s ease-out',
        'fade-in-up':    'fadeInUp 0.5s ease-out',
        'slide-left':    'slideInLeft 0.4s ease-out',
        'float':         'float 3s ease-in-out infinite',
        'orb':           'orbFloat 8s ease-in-out infinite',
        'pulse-glow':    'pulseGlow 2s ease-in-out infinite',
        'number':        'numberCount 0.6s ease-out both',
      },
      keyframes: {
        fadeInUp:     { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        fadeIn:       { from: { opacity: '0' }, to: { opacity: '1' } },
        slideInLeft:  { from: { opacity: '0', transform: 'translateX(-20px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        shimmer:      { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        orbFloat:     { '0%,100%': { transform: 'translate(0, 0) scale(1)' }, '33%': { transform: 'translate(30px, -30px) scale(1.05)' }, '66%': { transform: 'translate(-20px, 20px) scale(0.98)' } },
        pulseGlow:    { '0%,100%': { boxShadow: '0 0 10px rgba(99,102,241,0.3)' }, '50%': { boxShadow: '0 0 30px rgba(99,102,241,0.7),0 0 60px rgba(99,102,241,0.3)' } },
        float:        { '0%,100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-6px)' } },
        gradientShift:{ '0%': { backgroundPosition: '0% 50%' }, '50%': { backgroundPosition: '100% 50%' }, '100%': { backgroundPosition: '0% 50%' } },
        numberCount:  { from: { opacity: '0', transform: 'translateY(10px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'grid-pattern':    'linear-gradient(rgba(99,102,241,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.05) 1px, transparent 1px)',
        'dot-pattern':     'radial-gradient(rgba(99,102,241,0.15) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid':    '40px 40px',
        'dot-sm':  '20px 20px',
        'dot-md':  '30px 30px',
      },
    },
  },
  plugins: [],
}
