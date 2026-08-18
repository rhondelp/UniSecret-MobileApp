// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  // Add the NativeWind preset here
  presets: [require("nativewind/preset")],
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: "#0A0A0C",
        surface: "#16161A",
        gold: "#EAB308",
      },
    },
  },
  plugins: [],
};