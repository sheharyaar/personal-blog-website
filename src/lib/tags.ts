import { getCollection } from "astro:content"
import { getNotesTree, noteHref, projectHref, tagSlug } from "@lib/content"

export type TaggedItem = { title: string; href: string; date?: Date; summary?: string; kind: "Posts" | "Notes" | "Projects" }

/** Every tag across posts, notes and projects, with what carries it. */
export async function getTagIndex() {
  const posts = (await getCollection("blog")).filter((p) => !p.data.draft)
  const projects = (await getCollection("projects")).filter((p) => !p.data.draft)
  const { all: notes } = await getNotesTree()

  const items: { tags: string[]; item: TaggedItem }[] = [
    ...posts.map((p) => ({ tags: p.data.tags, item: { kind: "Posts" as const, title: p.data.title, href: `/blog/${p.id}/`, date: p.data.date, summary: p.data.summary } })),
    ...notes.map((n) => ({ tags: n.data.tags ?? [], item: { kind: "Notes" as const, title: n.data.title, href: noteHref(n.id), date: n.data.updated ?? n.data.date, summary: n.data.summary } })),
    ...projects.map((p) => ({ tags: p.data.tags, item: { kind: "Projects" as const, title: p.data.title, href: projectHref(p), date: p.data.date, summary: p.data.summary } })),
  ]

  const index = new Map<string, { tag: string; items: TaggedItem[] }>()
  for (const { tags, item } of items) {
    for (const tag of tags) {
      const slug = tagSlug(tag)
      if (!index.has(slug)) index.set(slug, { tag, items: [] })
      index.get(slug)!.items.push(item)
    }
  }
  for (const entry of index.values()) entry.items.sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0))
  return index
}
