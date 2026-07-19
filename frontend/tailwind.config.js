/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Cormorant Garamond"', "serif"],
        mono: ['"DM Mono"', "monospace"],
      },
      colors: {
        surface: {
          DEFAULT: "#111118",
          light: "#1a1a24",
          lighter: "#22223a",
          border: "#1f1f2e",
        },
        accent: {
          blue: "#00d4ff",
          amber: "#f59e0b",
          red: "#ef4444",
          green: "#10b981",
        },
      },
    },
  },
  plugins: [],
};
