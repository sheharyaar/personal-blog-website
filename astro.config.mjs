import { defineConfig } from "astro/config";
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
  markdown: {
    syntaxHighlight: "shiki",
    gfm: true,
    smartypants: true,
    shikiConfig: {
      theme: "ayu-dark",
    },
    rehypePlugins: [rehypePrettyCode, rehypeKatex],
    remarkPlugins: [remarkMath],
  },
  integrations: [
    mdx({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypePrettyCode, rehypeKatex],
      syntaxHighlight: "shiki",
      gfm: true,
      smartypants: true,
      shikiConfig: {
        theme: "ayu-dark",
      },
    }),
    sitemap(),
    solidJs(),
    starlight({title: "Sheharyaar's Notes", expressiveCode: false, customCss: ['./src/styles/starlight.css',],
      favicon: '/brand.png',
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
        autogenerate: {directory: 'notes/linux-containers'},
      }, {
        label: 'Assembly Language',
        collapsed: true,
        autogenerate: {directory: 'notes/assembly'},
      }, {
        label: 'System V ABI, ELF and Shared Libraries',
        collapsed: true,
        autogenerate: {directory: 'notes/sysv-elf-dso'},
      },],
      disable404Route: true,
    }),
  ],
});