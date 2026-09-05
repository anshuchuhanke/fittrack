/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        graphite: "#1C1B1A",
        surface: "#262422",
        surface2: "#302D2A",
        chalk: "#F2EFE9",
        muted: "#948E85",
        ember: "#FF6B35",
        emberDim: "#B24A22",
        sprout: "#8BC53F",
        sproutDim: "#5F8A29",
        danger: "#E5484D",
      },
      fontFamily: {
        display: ["'Barlow Condensed'", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
