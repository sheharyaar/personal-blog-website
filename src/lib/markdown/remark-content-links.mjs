// Obsidian writes links between notes as relative file paths: [cgroups](02-cgroups.md),
// [post](../other-post/index.md). Rewrite those to the URL the page is published at.
//
//   src/content/blog/<slug>/index.md -> /blog/<slug>/
//   src/content/notes/<book>/<ch>.md -> /notes/<book>/<ch>/
//   src/content/notes/<book>/index.md -> /notes/<book>/
import path from "node:path"
import { fileURLToPath } from "node:url"

const CONTENT_DIR = path.resolve("src/content")

function walk(node, fn) {
  fn(node)
  if (node.children) for (const child of node.children) walk(child, fn)
}

function sourcePath(file) {
  const p = file.path ?? file.history?.[0]
  if (!p) return undefined
  return String(p).startsWith("file:") ? fileURLToPath(p) : String(p)
}

export function contentUrl(absPath) {
  const rel = path.relative(CONTENT_DIR, absPath).split(path.sep).join("/")
  if (rel.startsWith("..")) return undefined
  const [collection, ...rest] = rel.replace(/\.(md|mdx)$/, "").split("/")
  let id = rest.join("/").replace(/(^|\/)index$/, "")
  if (collection === "notes" && id === "") return "/notes/"
  if (!["blog", "notes", "projects"].includes(collection)) return undefined
  return `/${collection}/${id}/`
}

export default function remarkContentLinks() {
  return (tree, file) => {
    const from = sourcePath(file)
    if (!from) return
    walk(tree, (node) => {
      if (node.type !== "link" || !node.url) return
      const match = /^(?!\w+:|\/|#)([^?#]+\.mdx?)(#.*)?$/.exec(node.url)
      if (!match) return
      const target = path.resolve(path.dirname(from), decodeURIComponent(match[1]))
      const url = contentUrl(target)
      if (url) node.url = url + (match[2] ?? "")
    })
  }
}
