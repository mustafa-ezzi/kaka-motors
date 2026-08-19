/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#050b14',
        fog: '#f5f5f5',
        scarlet: {
          DEFAULT: '#f23848',
          soft: '#ff6b73',
          pale: '#ffb1aa',
          hover: '#ff5662',
        },
        panel: '#0a1420',
        plum: '#0c121c',
        glow: '#1a4a6e',
        ice: '#7ee7f5',
        gold: '#ffbd69',
        crimson: '#b3122f',
        oxblood: '#7a0f22',
        bronze: '#a8741c',
        brass: '#c99a3c',
        forest: '#14503c',
        pine: '#0d3b2c',
        petrol: '#0e4650',
        graphite: '#1b2230',
        steel: '#2b3546',
        sand: '#f2f1ed',
        navy: '#16305e',
        rust: '#b8460f',
        moss: '#3f6212',
        signal: '#e11d38',
        ember: '#e85d04',
        amber: '#f0b429',
        copper: '#c45c26',
        jade: '#1f8a5b',
        carbon: '#0f1318',
        gunmetal: '#232a33',
        alloy: '#9aa2ab',
        silver: '#c9ced5',
        chrome: '#e9ecef',
      },
      fontFamily: {
        display: ['Sora', '"Space Grotesk"', 'sans-serif'],
        sans: ['Manrope', 'sans-serif'],
        mono: ['"DM Mono"', 'ui-monospace', 'monospace'],
      },
      maxWidth: {
        shell: '1240px',
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.scrollbar-none': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        },
      })
    },
  ],
}
