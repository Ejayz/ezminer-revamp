import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  }, daisyui: {
    themes: ["light",{
      custom1: {
      
"primary": "#009fe0",
      
"secondary": "#ee9500",
      
"accent": "#d90000",
      
"neutral": "#071117",
      
"base-100": "#fff9fc",
      
"info": "#00bcdc",
      
"success": "#25b244",
      
"warning": "#ff6f00",
      
"error": "#ce0032",
      },
    }],
  },
  plugins: [require("daisyui")],
};
export default config;
