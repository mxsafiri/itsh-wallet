/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#00A86B',
        'primary-dark': '#008F5B',
        'primary-light': '#4CD194',
        secondary: '#333333',
        accent: '#FFC107',
        background: '#F8F9FA',
        'card-background': '#FFFFFF',
        'text-color': '#333333',
        'text-light': '#6C757D',
        'border-color': '#E0E0E0',
        error: '#DC3545',
        success: '#28A745',
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'custom': '0 4px 12px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        'custom': '8px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease forwards',
        'slide-in': 'slideIn 0.5s ease forwards',
        'pulse': 'pulse 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        pulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
      },
    },
  },
  plugins: [],
}
