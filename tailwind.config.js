/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        mt5: {
          bg: "#12161c",
          card: "#1a212b",
          border: "#263140",
          blue: "#2979ff",
          red: "#ff3b30",
          green: "#00c853",
          text: "#f1f5f9",
          muted: "#8899a6",
          dark: "#0b0e14",
          highlight: "#1e293b",
        }
      }
    },
  },
  plugins: [],
}
