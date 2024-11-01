import defaultTheme from "tailwindcss/defaultTheme"

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      fontFamily: {
        "sans": ["Atkinson", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        codeLight: '#dd5073', // Orange for light mode
        codeDark: '#63eb90',  // Light green for dark mode
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "full",
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
          },
        },
      },
      rotate: {
        "45": "45deg",
        "135": "135deg",
        "225": "225deg",
        "315": "315deg",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
}
