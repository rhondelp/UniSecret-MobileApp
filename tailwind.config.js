/** @type {import('tailwindcss').Config} */
module.exports = {
  // Include all files in app, components, src, etc.
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Optional: Define your custom Black/Gold theme colors
        obsidian: "#0A0A0C",
        surface: "#16161A",
        gold: "#EAB308",
      },
    },
  },
  plugins: [],
};