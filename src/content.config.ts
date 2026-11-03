import { defineCollection } from "astro:content"
import { glob } from "astro/loaders"
import { z } from "astro/zod"
import { docsLoader } from "@astrojs/starlight/loaders"
import { docsSchema } from "@astrojs/starlight/schema"

// Same files the legacy collections picked up: every .md/.mdx, skipping _-prefixed ones.
const entries = (dir: string) => glob({ pattern: "**/[^_]*.{md,mdx}", base: `./src/content/${dir}` })

const work = defineCollection({
  loader: entries("work"),
  schema: z.object({
    company: z.string(),
    role: z.string(),
    dateStart: z.coerce.date(),
    dateEnd: z.union([z.coerce.date(), z.string()]),
  }),
})

const blog = defineCollection({
  loader: entries("blog"),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()),
    draft: z.boolean().optional(),
  }),
})

const projects = defineCollection({
  loader: entries("projects"),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()),
    draft: z.boolean().optional(),
    demoUrl: z.string().optional(),
    repoUrl: z.string().optional(),
    blogUrl: z.string().optional(),
  }),
})

const snippets = defineCollection({
  loader: entries("snippets"),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()),
    draft: z.boolean().optional(),
  }),
})

const docs = defineCollection({ loader: docsLoader(), schema: docsSchema() })

export const collections = { work, blog, projects, snippets, docs }
