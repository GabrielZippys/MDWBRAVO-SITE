module.exports = {
    content: [
      './pages/**/*.{js,ts,jsx,tsx,mdx}',
      './components/**/*.{js,ts,jsx,tsx,mdx}',
      './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
      extend: {
        animation: {
          'slide-in': 'slideIn 0.5s ease-out',
          'pulse-shadow': 'pulseShadow 2s infinite',
        },
        keyframes: {
          slideIn: {
            '0%': { transform: 'translateY(20px)', opacity: '0' },
            '100%': { transform: 'translateY(0)', opacity: '1' },
          },
          pulseShadow: {
            '0%, 100%': { filter: 'drop-shadow(0 0 10px rgba(99, 179, 237, 0.5))' },
            '50%': { filter: 'drop-shadow(0 0 20px rgba(99, 179, 237, 0.8))' },
          }
        }
      },
    },
    plugins: [],
  }