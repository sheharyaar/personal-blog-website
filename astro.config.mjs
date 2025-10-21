import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import solidJs from "@astrojs/solid-js";
import rehypePrettyCode from "rehype-pretty-code";
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

import starlight from "@astrojs/starlight";

// https://astro.build/config
export default defineConfig({
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
    tailwind({ applyBaseStyles: false }),
    starlight({title: "Sheharyaar's Notes", expressiveCode: false, customCss: ['./src/styles/starlight.css',],
      favicon: '/brand-light.svg',
      head: [
        {
          tag: 'script',
          content: `window.addEventListener('load', () => document.querySelector('.site-title').href += 'notes/')`,
        },
      ],
      sidebar: [{
        label: 'Notes Homepage',
        link: '/notes',
      }, {
        label: 'Linux Containers',
        autogenerate: {directory: 'notes/linux-containers'},
      }, {
        label: 'Assembly Language',
        autogenerate: {directory: 'notes/assembly'},
      }, {
        label: 'System V ABI, ELF and Shared Libraries',
        autogenerate: {directory: 'notes/sysv-elf-dso'},
      },],
      disable404Route: true,
    }),
  ],
});