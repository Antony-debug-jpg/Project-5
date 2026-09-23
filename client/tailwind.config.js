/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ChatFlow brand colors
        primary: '#00A86B',
        'primary-dark': '#007A52',
        'primary-light': '#00D084',
      },
    },
  },
  plugins: [],
}
