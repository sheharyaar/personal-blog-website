import { defineConfig } from "astro/config";
import { unified } from "@astrojs/markdown-remark";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import rehypePrettyCode from "rehype-pretty-code";
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
  },
  // Astro 7 defaults to JSX whitespace rules; keep the HTML-aware behaviour the templates were written for.
  compressHTML: true,
  markdown: {
    // Astro 7 defaults to the Sätteri processor, which doesn't run remark/rehype plugins.
    // Stay on unified() so remark-math, rehype-katex and rehype-pretty-code keep working.
    processor: unified({
      remarkPlugins: [remarkMath, remarkCallouts, remarkFigures, remarkContentLinks],
      rehypePlugins: [rehypePrettyCode, rehypeKatex],
      gfm: true,
      smartypants: true,
    }),
    syntaxHighlight: "shiki",
    shikiConfig: {
      theme: "ayu-dark",
    },
  },
  integrations: [
    // Inherits the markdown config above.
    mdx(),
    sitemap(),
  ],
});