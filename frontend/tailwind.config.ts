import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Palette vive : bleu #0062C9, doré #FFC533, fond hero #001B4D */
        primary: {
          DEFAULT: "#0062C9",
          dark: "#004a9e",
          light: "#E8F2FC",
        },
        gold: {
          DEFAULT: "#FFC533",
          dark: "#e6b02d",
          light: "#FFF9E6",
        },
        "hero-dark": "#001B4D",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
