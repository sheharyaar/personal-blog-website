// Obsidian / GitHub style callouts:
//
//   > [!note] Optional title        -> <aside class="callout callout-note">
//   > [!deep-dive]- Collapsed       -> <details class="callout …">   (+ = open by default)
//
// The type picks a colour family; unknown types fall back to "note" but keep their own name
// as the default title, so custom types like [!definition] or [!source] just work.

const CALLOUT_RE = /^\[!([\w-]+)\]([+-]?)[ \t]*(.*)$/

const FAMILIES = {
  note: ["note", "info", "todo", "abstract", "summary", "tldr", "definition", "source"],
  tip: ["tip", "hint", "important", "success", "check", "done", "example"],
  warning: ["warning", "caution", "attention", "question", "help", "faq", "deep-dive"],
  danger: ["danger", "error", "bug", "failure", "fail", "missing"],
  quote: ["quote", "cite"],
}
const familyOf = (type) => Object.keys(FAMILIES).find((f) => FAMILIES[f].includes(type)) ?? "note"
const defaultTitle = (type) => (type.charAt(0).toUpperCase() + type.slice(1)).replace(/-/g, " ")

function walk(node, fn) {
  fn(node)
  if (node.children) for (const child of node.children) walk(child, fn)
}

// Split a paragraph's inline children at the first line break: [first line, the rest].
function splitFirstLine(children) {
  const title = []
  for (let i = 0; i < children.length; i++) {
    const n = children[i]
    if (n.type === "break") return [title, children.slice(i + 1)]
    if (n.type === "text" && n.value.includes("\n")) {
      const k = n.value.indexOf("\n")
      if (k > 0) title.push({ type: "text", value: n.value.slice(0, k) })
      const after = n.value.slice(k + 1)
      return [title, [...(after ? [{ type: "text", value: after }] : []), ...children.slice(i + 1)]]
    }
    title.push(n)
  }
  return [title, []]
}

export default function remarkCallouts() {
  return (tree) =>
    walk(tree, (node) => {
      if (node.type !== "blockquote") return
      const first = node.children[0]
      if (first?.type !== "paragraph" || first.children[0]?.type !== "text") return
      const head = first.children[0]
      const marker = CALLOUT_RE.exec(head.value.split("\n")[0])
      if (!marker) return

      const type = marker[1].toLowerCase()
      const foldable = marker[2] !== ""
      const rest = { ...head, value: head.value.slice(head.value.indexOf("]") + 1 + marker[2].length).replace(/^[ \t]+/, "") }
      const [titleNodes, bodyInline] = splitFirstLine([rest, ...first.children.slice(1)])
      const title = titleNodes.filter((n) => !(n.type === "text" && !n.value.trim()))
      if (title.at(-1)?.type === "text") title[title.length - 1] = { type: "text", value: title.at(-1).value.trimEnd() }

      const body = [...(bodyInline.length ? [{ ...first, children: bodyInline }] : []), ...node.children.slice(1)]
      node.data = {
        hName: foldable ? "details" : "aside",
        hProperties: {
          className: ["callout", `callout-${familyOf(type)}`],
          dataCallout: type,
          ...(marker[2] === "+" ? { open: true } : {}),
        },
      }
      node.children = [
        {
          type: "paragraph",
          data: { hName: foldable ? "summary" : "p", hProperties: { className: ["callout-title"] } },
          children: title.length ? title : [{ type: "text", value: defaultTitle(type) }],
        },
        ...(body.length ? [{ type: "calloutBody", data: { hName: "div", hProperties: { className: ["callout-body"] } }, children: body }] : []),
      ]
    })
}
