/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#7C3AED',
        primaryDark: '#6D28D9',
        accent: '#0891B2',
        fondo: '#F1F5F9',
        exito: '#16A34A',
        alerta: '#DC2626',
      },
      minHeight: {
        touch: '3rem',
      },
    },
  },
  plugins: [],
};
