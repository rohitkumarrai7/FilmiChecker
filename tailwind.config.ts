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
        navy: {
          950: "#040810",
          900: "#0a0f1e",
          800: "#0d1526",
          700: "#111d35",
          600: "#162244",
        },
        gold: {
          300: "#fde68a",
          400: "#fcd34d",
          500: "#f5c842",
          600: "#d4aa1e",
          700: "#b8920f",
        },
      },
      fontFamily: {
        playfair: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "grain": "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E\")",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        shimmer: "shimmer 2s infinite linear",
      },
      boxShadow: {
        "gold-glow": "0 0 20px rgba(245, 200, 66, 0.3)",
        "gold-glow-lg": "0 0 40px rgba(245, 200, 66, 0.4)",
        "green-glow": "0 0 20px rgba(34, 197, 94, 0.4)",
        "amber-glow": "0 0 20px rgba(245, 158, 11, 0.4)",
        "red-glow": "0 0 20px rgba(239, 68, 68, 0.4)",
      },
    },
  },
  plugins: [],
};

export default config;
