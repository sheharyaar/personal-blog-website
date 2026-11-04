import { defineCollection } from "astro:content"
import { glob } from "astro/loaders"
import { z } from "astro/zod"

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
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()),
    // Posts with the same series name are linked together, in date order. Left empty in Obsidian, this is null.
    series: z.string().nullish(),
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

// Long-form notes, grouped into notebooks: notes/<notebook>/index.md is the notebook's landing page,
// notes/<notebook>/<NN-chapter>.md are its chapters (ordered by file name), notes/index.md is /notes.
const notes = defineCollection({
  loader: entries("notes"),
  schema: z.object({
    title: z.string(),
    summary: z.string().optional(),
    date: z.coerce.date().optional(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).optional(),
    // e.g. "TODO", "In Progress" - shown as a badge in the sidebar
    status: z.string().optional(),
    // notebook landing pages: position in the sidebar
    order: z.number().optional(),
    draft: z.boolean().optional(),
  }),
})

// One file per book; the text under the properties is an optional short note.
// Everything here is public, so no shelf locations or reading plans.
const library = defineCollection({
  loader: entries("library"),
  schema: z.object({
    title: z.string(),
    author: z.string(),
    subject: z.string(),
    // Left empty in Obsidian, this comes through as null and nothing is shown.
    status: z.enum(["read", "reading", "unread"]).nullish(),
    draft: z.boolean().optional(),
  }),
})

export const collections = { work, blog, projects, notes, library }
