import { type CollectionEntry, getCollection } from "astro:content"

export type Note = CollectionEntry<"notes">

/** "Linux Kernel" -> "linux-kernel" */
export const tagSlug = (tag: string) =>
  tag.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")

export const tagHref = (tag: string) => `/tags/${tagSlug(tag)}/`

export const noteHref = (id: string) => (id === "index" ? "/notes/" : `/notes/${id}/`)

/** A project has no page of its own: it is a row on /projects, linking to whichever of these it has. */
export const projectLinks = ({ data }: CollectionEntry<"projects">) =>
  [
    { label: "Write-up", url: data.blogUrl },
    { label: "Notes", url: data.notesUrl },
    { label: "Demo", url: data.demoUrl },
    { label: "Repository", url: data.repoUrl },
  ].filter((link): link is { label: string; url: string } => Boolean(link.url))

/** Where a project's title goes: its first link, or its row if it has none. */
export const projectHref = (project: CollectionEntry<"projects">) =>
  projectLinks(project)[0]?.url ?? `/projects/#${project.id}`

/** The tags on a set of entries and how often each is used, most used first. */
export function countTags(entries: { data: { tags: string[] } }[]) {
  const counts = new Map<string, number>()
  for (const tag of entries.flatMap((entry) => entry.data.tags)) counts.set(tag, (counts.get(tag) ?? 0) + 1)
  return [...counts].map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
}

export type NotebookChapter = { entry: Note; href: string }
export type Notebook = { id: string; entry: Note; href: string; chapters: NotebookChapter[] }

/**
 * notes/index.md            -> root (/notes)
 * notes/<book>/index.md     -> notebook landing page
 * notes/<book>/<chapter>.md -> chapters, ordered by file name (00-, 01-, …)
 * Notebooks are ordered by their landing page's `order`, then title.
 */
export async function getNotesTree() {
  // Drafts show up in `astro dev` only.
  const notes = (await getCollection("notes")).filter((n) => import.meta.env.DEV || !n.data.draft)
  const root = notes.find((n) => n.id === "index")
  const books = new Map<string, Notebook>()

  for (const entry of notes) {
    if (entry.id === "index" || entry.id.includes("/")) continue
    books.set(entry.id, { id: entry.id, entry, href: noteHref(entry.id), chapters: [] })
  }
  for (const entry of notes) {
    const [book, ...rest] = entry.id.split("/")
    if (!rest.length) continue
    const notebook = books.get(book)
    if (!notebook) throw new Error(`Note "${entry.id}" has no notebook landing page (notes/${book}/index.md)`)
    notebook.chapters.push({ entry, href: noteHref(entry.id) })
  }

  const notebooks = [...books.values()].sort(
    (a, b) => (a.entry.data.order ?? 99) - (b.entry.data.order ?? 99) || a.entry.data.title.localeCompare(b.entry.data.title),
  )
  for (const book of notebooks) book.chapters.sort((a, b) => a.entry.id.localeCompare(b.entry.id))

  // Reading order for prev/next: each notebook's landing page, then its chapters.
  const flat = notebooks.flatMap((b) => [{ entry: b.entry, href: b.href }, ...b.chapters])
  return { root, notebooks, flat, all: notes }
}
