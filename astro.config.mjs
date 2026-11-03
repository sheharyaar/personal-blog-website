import { defineConfig } from "astro/config";
import { unified } from "@astrojs/markdown-remark";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import solidJs from "@astrojs/solid-js";
import rehypePrettyCode from "rehype-pretty-code";
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

import starlight from "@astrojs/starlight";

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss({ applyBaseStyles: false })],
  },
  site: "https://sheharyaar.in",
  // Astro 7 defaults to JSX whitespace rules; keep the HTML-aware behaviour the templates were written for.
  compressHTML: true,
  markdown: {
    // Astro 7 defaults to the Sätteri processor, which doesn't run remark/rehype plugins.
    // Stay on unified() so remark-math, rehype-katex and rehype-pretty-code keep working.
    processor: unified({
      remarkPlugins: [remarkMath],
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
    solidJs(),
    starlight({title: "Sheharyaar's Notes", expressiveCode: false, customCss: ['./src/styles/starlight.css',],
      favicon: '/favicon.svg',
      head: [
        {
          tag: 'script',
          content: `window.addEventListener('load', () => document.querySelector('.site-title').href += 'notes/')`,
        },
        {
          tag: 'meta',
          attrs: {property: 'og:image', content: 'https://sheharyaar.in/open-graph.jpeg'},
        }
      ],
      sidebar: [{
        label: 'Notes Homepage',
        link: '/notes',
      }, {
        label: 'Linux Containers',
        collapsed: true,
        items: [{autogenerate: {directory: 'notes/linux-containers', collapsed: true}}],
      }, {
        label: 'Assembly Language',
        collapsed: true,
        items: [{autogenerate: {directory: 'notes/assembly', collapsed: true}}],
      }, {
        label: 'System V ABI, ELF and Shared Libraries',
        collapsed: true,
        items: [{autogenerate: {directory: 'notes/sysv-elf-dso', collapsed: true}}],
      },],
      disable404Route: true,
    }),
  ],
});