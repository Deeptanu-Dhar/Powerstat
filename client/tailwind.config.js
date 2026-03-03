/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontSize: {
        sm: '0.750rem',
        base: '1rem',
        xl: '1.333rem',
        '2xl': '1.777rem',
        '3xl': '2.369rem',
        '4xl': '3.158rem',
        '5xl': '4.210rem',
      },
      fontFamily: {
        heading: ['Lilex', 'monospace'],
        body: ['Lilex', 'monospace'],
      },
      fontWeight: {
        normal: '400',
        bold: '700',
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        myTheme: {
          primary: '#c2d88e',
          secondary: '#417b2b',
          accent: '#4cbf47',
          neutral: '#303913',
          'base-100': '#141808',
        },
      },
    ],
  },
};
