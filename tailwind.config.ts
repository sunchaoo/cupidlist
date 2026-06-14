import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm "Tinder-meets-Notion" palette
        cupid: {
          50: "#fff1f5",
          100: "#ffe4ec",
          200: "#fecdd9",
          300: "#fda4bc",
          400: "#fb6f97",
          500: "#f43f73",
          600: "#e11d56",
          700: "#be1248",
          800: "#9f1240",
          900: "#88123c",
        },
        indigoSoft: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 4px 24px -8px rgba(244, 63, 115, 0.18)",
      },
    },
  },
  plugins: [],
};

export default config;
