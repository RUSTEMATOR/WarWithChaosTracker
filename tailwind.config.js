/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Order / Empire palette
        'order-gold':   '#F2C94C',
        'order-light':  '#FFE080',
        'order-dim':    '#B8922A',
        'order-amber':  '#F59E0B',

        // Chaos palette
        'chaos-red':    '#EF4444',
        'chaos-crimson':'#DC2626',
        'chaos-purple': '#A855F7',
        'chaos-dark':   '#7F1D1D',

        // Text hierarchy
        'text-primary':   '#F0E6CC',
        'text-secondary': '#C4A96A',
        'text-muted':     '#7A6848',

        // Surface / background layers
        'surface-base':     '#0E0C08',
        'surface-section':  '#181410',
        'surface-card':     '#201A10',
        'surface-elevated': '#2A2218',
        'surface-done':     '#161D12',

        // Borders
        'border':        '#3A2E1C',
        'border-bright': '#5A4A2C',

        // Column accent colors
        'col-backlog':    '#EF4444',
        'col-progress':   '#F2C94C',
        'col-done':       '#4ADE80',

        // Legacy aliases
        'parchment':       '#0E0C08',
        'parchment-light': '#181410',
        'ink':             '#F0E6CC',
        'ink-dim':         '#C4A96A',
      },
      fontFamily: {
        cinzel: ['Cinzel', 'Georgia', 'serif'],
        body:   ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'card':    '0 2px 12px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.4)',
        'card-lg': '0 8px 32px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)',
        'glow-gold': '0 0 20px rgba(242,201,76,0.25)',
        'glow-red':  '0 0 20px rgba(239,68,68,0.25)',
      },
      animation: {
        'frontline-pulse':   'frontline-pulse 2s ease-in-out infinite',
        'particle-drift':    'particle-drift 3s ease-in-out infinite',
        'victory-glow':      'victory-glow 1.5s ease-in-out infinite',
        'fade-in':           'fade-in 0.2s ease-out',
        'slide-up':          'slide-up 0.25s ease-out',
        'victory-pulse':     'victory-pulse 0.7s ease-out',
        'corruption-pulse':  'corruption-pulse 2s ease-in-out infinite',
      },
      keyframes: {
        'frontline-pulse': {
          '0%, 100%': { boxShadow: '0 0 10px 4px #F2C94C, 0 0 28px 10px #EF4444' },
          '50%':       { boxShadow: '0 0 20px 8px #F2C94C, 0 0 56px 22px #EF4444' },
        },
        'particle-drift': {
          '0%':   { transform: 'translateY(0) translateX(0)', opacity: '0.9' },
          '50%':  { transform: 'translateY(-12px) translateX(4px)', opacity: '0.4' },
          '100%': { transform: 'translateY(-24px) translateX(-2px)', opacity: '0' },
        },
        'victory-glow': {
          '0%, 100%': { textShadow: '0 0 8px currentColor' },
          '50%':      { textShadow: '0 0 24px currentColor, 0 0 48px currentColor' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(12px) scale(0.97)' },
          to:   { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'victory-pulse': {
          '0%':   { boxShadow: '0 0 0 0 rgba(242, 201, 76, 0.7)' },
          '50%':  { boxShadow: '0 0 0 10px rgba(242, 201, 76, 0.2)' },
          '100%': { boxShadow: '0 0 0 0 rgba(242, 201, 76, 0)' },
        },
        'corruption-pulse': {
          '0%, 100%': { borderColor: 'rgba(239, 68, 68, 0.9)' },
          '50%':      { borderColor: 'rgba(239, 68, 68, 0.3)' },
        },
      },
    },
  },
  plugins: [],
}
