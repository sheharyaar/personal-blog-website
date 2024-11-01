import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import solidJs from "@astrojs/solid-js";
import rehypePrettyCode from "rehype-pretty-code";

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
    rehypePlugins: [rehypePrettyCode],
  },
  integrations: [
    mdx({
      rehypePlugins: [rehypePrettyCode],
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
    starlight({title: "CS Notes", expressiveCode: false, customCss: ['./src/styles/starlight.css',],}),
  ],
});