// Figures from plain Markdown, written the way Obsidian displays them:
//
//   ![Alt text|500](./diagram.png)      <- "|500" is Obsidian's width syntax; Astro resizes to it
//   *Fig 2 - What the diagram shows*    <- an italic line right under the image becomes the caption
//
// A paragraph holding only images (+ an optional italic caption) becomes <figure>.
// Images named *-dark.* / *-light.* get classes so only the one matching the theme shows.

function walk(node, fn) {
  fn(node)
  if (node.children) for (const child of node.children) walk(child, fn)
}

const isBlank = (n) => n.type === "break" || (n.type === "text" && !n.value.trim())

function addProps(img, props) {
  img.data = { ...img.data, hProperties: { ...img.data?.hProperties, ...props } }
}

export default function remarkFigures() {
  return (tree) =>
    walk(tree, (node) => {
      if (node.type !== "paragraph") return
      const kids = node.children.filter((n) => !isBlank(n))
      const images = kids.filter((n) => n.type === "image")
      if (!images.length) return
      const last = kids.at(-1)
      const hasCaption = last.type === "emphasis" && kids.length === images.length + 1
      if (!hasCaption && kids.length !== images.length) return // image inside running text: leave it

      for (const img of images) {
        const sized = /^(.*?)\|(\d+)(?:x\d+)?$/.exec(img.alt ?? "")
        if (sized) {
          img.alt = sized[1].trim()
          addProps(img, { width: Number(sized[2]) })
        }
        const theme = /-(dark|light)\.\w+$/.exec(img.url)?.[1]
        if (theme) addProps(img, { className: [`figure-${theme}`] })
      }

      node.data = { hName: "figure" }
      node.children = [...images, ...(hasCaption ? [{ ...last, data: { hName: "figcaption" } }] : [])]
    })
}
