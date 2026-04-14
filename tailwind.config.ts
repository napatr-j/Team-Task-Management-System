import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        bg: "#ECECEC",
        olive: "#84934A",
        oliveDark: "#656D3F",
        contrast: "#492828",
        surface: "#FFFFFF",
        text: "#1A1A1A",
        textMuted: "rgba(26, 26, 26, 0.5)",
        team: {
          bg: "#ECECEC",
          olive: "#84934A",
          oliveDark: "#656D3F",
          contrast: "#492828",
          surface: "#FFFFFF",
          text: "#1A1A1A",
        },
      },
      boxShadow: {
        soft: "0 30px 80px rgba(17, 24, 39, 0.08)",
      },
      borderRadius: {
        xl: "1rem",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
