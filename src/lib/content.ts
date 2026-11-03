import { type CollectionEntry, getCollection } from "astro:content"

export type Note = CollectionEntry<"notes">

/** "Linux Kernel" -> "linux-kernel" */
export const tagSlug = (tag: string) =>
  tag.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")

export const tagHref = (tag: string) => `/tags/${tagSlug(tag)}/`

export const noteHref = (id: string) => (id === "index" ? "/notes/" : `/notes/${id}/`)

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
