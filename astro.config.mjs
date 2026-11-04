import { defineConfig } from "astro/config";
import { unified } from "@astrojs/markdown-remark";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import expressiveCode from "astro-expressive-code";
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkCallouts from './src/lib/markdown/remark-callouts.mjs';
import remarkFigures from './src/lib/markdown/remark-figures.mjs';
import remarkContentLinks from './src/lib/markdown/remark-content-links.mjs';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss({ applyBaseStyles: false })],
  },
  site: "https://sheharyaar.in",
  // Snippets became the Cheatsheets notebook; keep old links working.
  redirects: {
    "/snippets": "/notes/cheatsheets/",
    "/snippets/dtschema/dtschema": "/notes/cheatsheets/dtschema/",
    "/snippets/netfilter-madness/netfilter-madness": "/notes/cheatsheets/netfilter-madness/",
    "/snippets/network-namespace/network-ns": "/notes/cheatsheets/network-namespace/",
    "/snippets/qemu/qemu": "/notes/cheatsheets/qemu/",
    // Work became the timeline on About.
    "/work": "/about/#work",
  },
  // Astro 7 defaults to JSX whitespace rules; keep the HTML-aware behaviour the templates were written for.
  compressHTML: true,
  markdown: {
    // Astro 7 defaults to the Sätteri processor, which doesn't run remark/rehype plugins.
    // Stay on unified() so remark-math and rehype-katex keep working.
    processor: unified({
      remarkPlugins: [remarkMath, remarkCallouts, remarkFigures, remarkContentLinks],
      rehypePlugins: [rehypeKatex],
      gfm: true,
      smartypants: true,
    }),
  },
  integrations: [
    // Code blocks. Has to come before mdx(); it joins the end of the pipeline above, after math.
    expressiveCode({
      themes: ["ayu-dark", "ayu-light"],
      // The site's theme is the .dark class on <html>, not the system setting.
      useDarkModeMediaQuery: false,
      themeCssSelector: (theme) => (theme.type === "dark" ? ".dark" : ":root:not(.dark)"),
      // Keep a first-line comment like "// main.c" in the code; titles are set with title="main.c".
      frames: { extractFileNameFromCode: false },
      styleOverrides: {
        borderRadius: "6px",
        borderColor: ({ theme }) => (theme.type === "dark" ? "#efe8da29" : "#0b0b0c24"),
        codeBackground: ({ theme }) => (theme.type === "dark" ? "#131315" : "#f6f1e6"),
        codeFontFamily: "var(--font-mono)",
        codeFontSize: "0.85rem",
        codeLineHeight: "1.6",
        uiFontFamily: "var(--font-mono)",
        uiFontSize: "0.75rem",
        frames: {
          frameBoxShadowCssValue: "none",
          editorActiveTabIndicatorTopColor: ({ theme }) => (theme.type === "dark" ? "#c9a24a" : "#7d5c16"),
          editorActiveTabIndicatorBottomColor: "transparent",
          editorActiveTabForeground: ({ theme }) => (theme.type === "dark" ? "#efe8da" : "#0b0b0c"),
          editorActiveTabBackground: ({ theme }) => (theme.type === "dark" ? "#131315" : "#f6f1e6"),
          editorTabBarBackground: ({ theme }) => (theme.type === "dark" ? "#0f0f11" : "#efe8da"),
          terminalBackground: ({ theme }) => (theme.type === "dark" ? "#131315" : "#f6f1e6"),
          terminalTitlebarBackground: ({ theme }) => (theme.type === "dark" ? "#0f0f11" : "#efe8da"),
        },
        textMarkers: {
          markBackground: ({ theme }) => (theme.type === "dark" ? "#c9a24a2b" : "#b08a3533"),
          markBorderColor: ({ theme }) => (theme.type === "dark" ? "#c9a24a" : "#7d5c16"),
        },
      },
    }),
    // Inherits the markdown config above.
    mdx(),
    sitemap(),
  ],
});