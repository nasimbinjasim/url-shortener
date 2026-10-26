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
        cream: "#F8F5F0",
        paper: "#FDFBF7",
        ink: "#111111",
        muted: "#6B6B6B",
        border: "#E5E0D8",
      },
    },
  },
  plugins: [],
};
export default config;