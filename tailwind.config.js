/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Manrope"', 'sans-serif']
      },
      colors: {
        ink: {
          DEFAULT: '#0F3D3E',
          light: '#175C5D',
          dark: '#0A2C2D'
        },
        paper: '#FAF6EE',
        amber: {
          DEFAULT: '#F2A93B',
          dark: '#D98F1F'
        },
        coral: {
          DEFAULT: '#E8604C',
          light: '#F2836F'
        },
        line: '#E4DFD0'
      },
      borderRadius: {
        xl2: '1.25rem'
      }
    }
  },
  plugins: []
}
