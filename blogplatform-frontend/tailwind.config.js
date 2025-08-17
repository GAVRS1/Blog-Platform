/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#7c3aed',   // фиолетовый-600
        secondary: '#a855f7', // фиолетовый-500
        accent: '#c084fc',    // фиолетовый-400
      },
      animation: {
        'fade-in': 'fadeIn .4s ease-out',
        'scale-in': 'scaleIn .2s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        scaleIn: { '0%': { scale: 0.95 }, '100%': { scale: 1 } },
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        light: {
          primary: '#7c3aed',
          secondary: '#a855f7',
          accent: '#c084fc',
          neutral: '#f5f3ff',
          'base-100': '#ffffff',
          info: '#a78bfa',
          success: '#34d399',
          warning: '#fbbf24',
          error: '#f87171',
        },
      },
      {
        dark: {
          primary: '#7c3aed',
          secondary: '#a855f7',
          accent: '#c084fc',
          neutral: '#2e1065',
          'base-100': '#181818',
          info: '#a78bfa',
          success: '#34d399',
          warning: '#fbbf24',
          error: '#f87171',
        },
      },
    ],
  },
};