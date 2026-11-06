/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#EEF0E7',
        panel: '#F8F9F3',
        panel2: '#F1F3EA',
        ink: '#1D2926',
        mute: '#56655F',
        line: '#D8DCCE',
        track: '#E1E5D8',
        teal: { DEFAULT: '#3A6B63', d: '#2B514B', t: '#DCE8E2' },
        safe: { DEFAULT: '#2F7D4F', t: '#DCEBDD', x: '#1F5A37' },
        warn: { DEFAULT: '#B7791F', t: '#F4E7C8', x: '#7A4E08' },
        bad: { DEFAULT: '#B3382C', t: '#F2D9D4', x: '#8C2A20' },
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        lift: '0 12px 30px rgba(29,41,38,.08)',
      },
      keyframes: {
        scan: { from: { top: '14%' }, to: { top: '80%' } },
        pulseRing: {
          '0%': { transform: 'scale(.9)', opacity: '.55' },
          '70%': { transform: 'scale(1.14)', opacity: '0' },
          '100%': { opacity: '0' },
        },
        dots: { '0%,80%,100%': { opacity: '.25' }, '40%': { opacity: '1' } },
      },
      animation: {
        scan: 'scan 2.2s ease-in-out infinite alternate',
        pulseRing: 'pulseRing 2.4s ease-out infinite',
        dots: 'dots 1.2s infinite',
      },
    },
  },
  plugins: [],
};
