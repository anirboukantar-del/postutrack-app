import colors from 'tailwindcss/colors';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Geist"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        gray: colors.zinc,
      },
      borderRadius: {
        '4xl': '0.625rem',
        '3xl': '0.5rem',
        '2xl': '0.5rem',
        'xl': '0.375rem',
        'lg': '0.375rem',
        'md': '0.25rem',
      },
    },
  },
  plugins: [],
}