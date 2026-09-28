import colors from 'tailwindcss/colors';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gray: colors.zinc,
      },
      borderRadius: {
        '4xl': '0.75rem',
        '3xl': '0.625rem',
        '2xl': '0.5rem',
        'xl': '0.375rem',
        'lg': '0.25rem',
      },
    },
  },
  plugins: [],
}