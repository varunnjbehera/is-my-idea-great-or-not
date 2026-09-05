import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#FAF7F2",
        ink: "#141210",
        muted: "#6B6259",
        line: "#E5DDD2",
        accent: "#C2410C",
        verdict: {
          terrible: "#B91C1C",
          weak: "#C2410C",
          middling: "#A16207",
          decent: "#15803D",
          great: "#0F766E",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
