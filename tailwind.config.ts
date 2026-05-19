import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
    "./types/**/*.{js,ts}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      colors: {
        brand: {
          red: "#e8002d",
          dark: "#0a0a0a",
          gray: "#1a1a1a",
        },
        sport: {
          football:   "#d4380d",
          basketball: "#fa6400",
          baseball:   "#1677ff",
          soccer:     "#389e0d",
          wrestling:  "#722ed1",
          volleyball: "#eb2f96",
          track:      "#d4b106",
          tennis:     "#13c2c2",
          golf:       "#52c41a",
          gymnastics: "#c41d7f",
          hockey:     "#096dd9",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(12px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "none",
            color: "#1a1a1a",
            a: { color: "#e8002d", textDecoration: "none", "&:hover": { textDecoration: "underline" } },
            "h1,h2,h3,h4": { fontWeight: "900", letterSpacing: "-0.02em" },
          },
        },
      },
    },
  },
  plugins: [typography],
};

export default config;
