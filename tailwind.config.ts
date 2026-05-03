import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#17201b",
        leaf: "#2f7d57",
        mint: "#e7f5ed",
        clay: "#d96f4c",
        skysoft: "#e7f0ff"
      },
      boxShadow: {
        soft: "0 12px 32px rgba(23, 32, 27, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
