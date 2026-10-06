/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // THREAD flat design system — one accent (deep green), no gradients
        accent: "#006C49",
        accentDark: "#00422B",
        page: "#FBF9F6",
        surface: "#FFFFFF",
        surfaceAlt: "#F5F3F0",
        borderc: "#D8E0DA",
        textmain: "#1B1C1A",
        textsub: "#3C4A42",
        textmuted: "#6C7A71",
        success: "#10B981",
        warning: "#B4740B",
        danger: "#BA1A1A",
      },
      fontFamily: {
        // One real font, used everywhere
        sans: ["\"Plus Jakarta Sans\"", "system-ui", "sans-serif"],
      },
      lineHeight: {
        body: "1.6",
      },
    },
  },
  plugins: [],
};
