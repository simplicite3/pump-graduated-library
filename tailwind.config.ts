import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0a0a0f",
        card: "#12121a",
        border: "#1e1e2e",
        accent: "#00ff88",
        "tier-1": "#00ff88",
        "tier-2": "#10b981",
        "tier-3": "#fbbf24",
        "tier-4": "#f97316",
        "tier-5": "#ef4444",
        "tier-6": "#ec4899",
        "tier-7": "#8b5cf6",
      },
    },
  },
  plugins: [],
};

export default config;
