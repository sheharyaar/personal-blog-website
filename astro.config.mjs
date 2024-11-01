import { defineConfig } from "astro/config"
import mdx from "@astrojs/mdx"
import sitemap from "@astrojs/sitemap"
import tailwind from "@astrojs/tailwind"
import solidJs from "@astrojs/solid-js"
import rehypePrettyCode from "rehype-pretty-code"

// https://astro.build/config
export default defineConfig({
  site: "https://sheharyaar.in",
  markdown: {
    syntaxHighlight: 'shiki',
    gfm: true,
    smartypants: true,
    shikiConfig: {
      theme: 'aurora-x'
    }, 
    rehypePlugins: [rehypePrettyCode],
  },
  integrations: [mdx({
    rehypePlugins: [rehypePrettyCode],
    syntaxHighlight: 'shiki',
    gfm: true,
    smartypants: true,
    shikiConfig: {
      theme: 'aurora-x',
    },
  }), sitemap(), solidJs(), tailwind({ applyBaseStyles: false })],
})