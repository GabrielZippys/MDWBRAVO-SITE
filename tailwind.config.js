// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,ts,jsx,tsx,mdx}",
      "./pages/**/*.{js,ts,jsx,tsx,mdx}",
      "./components/**/*.{js,ts,jsx,tsx,mdx}"
    ],
    theme: {
      extend: {
        colors: {
          primary: '#1D4ED8', // azul
          secondary: '#4B5563', // cinza escuro
          background: '#F3F4F6' // cinza claro
        },
        animation: {
          fade: 'fadeIn 0.3s ease-in-out',
          bounce: 'bounce 1s infinite'
        },
        keyframes: {
          fadeIn: {
            '0%': { opacity: 0 },
            '100%': { opacity: 1 },
          },
          bounce: {
            '0%, 100%': { transform: 'translateY(-5%)' },
            '50%': { transform: 'translateY(0)' },
          }
        }
      },
    },
    plugins: [],
  };
  