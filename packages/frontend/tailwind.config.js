/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "gray-drk": "#BDC4C7",
        "gray-drkr": "#83B5A6",
        "green-drk": "#1d2321",
        "green-lghtr": "#494f4d",
        "lime": "#d1ee8d"
      },
      fontFamily: {
        sans: ['DM Sans', 'sans'],
      },
    },
  },
  plugins: []
}
