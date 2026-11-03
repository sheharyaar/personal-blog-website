---
title: Writing guide
---

This folder is not published. It's a cheat sheet for writing on the site from Obsidian.

## Where things go

| What | Where | Published at |
|---|---|---|
| Blog post | `blog/<post-name>/index.md` (+ its images in the same folder) | `/blog/<post-name>/` |
| Notebook | `notes/<notebook>/index.md` | `/notes/<notebook>/` |
| Chapter | `notes/<notebook>/<NN-chapter>.md` (`00-`, `01-`… sets the order) | `/notes/<notebook>/<NN-chapter>/` |
| Project | `projects/<name>/index.md` | `/projects/<name>/` |

New post: create the folder, create a note called `index` inside it, then run **Templates: Insert template → Blog post** from the command palette (Ctrl+P). The title, summary, date and tags appear as Properties at the top. Fill them in there.

Files and folders starting with `_` are never published.

## Callouts

```
> [!note] Optional title
> Text inside the box.
```

Types: `note`, `tip`, `warning` / `caution`, `danger`, `quote`, `example`, plus custom ones that work the same way: `definition`, `source`, `deep-dive`.

Add `-` after the type to make it collapsed by default (`> [!deep-dive]- Title`), or `+` for collapsible but open.

## Images and figures

Paste or drag an image in: it is saved next to the note. Then:

```
![Stack frame layout|500](stack-frame.png)
*Fig 2.1 - Stack frame on x86-64*
```

- `|500` sets the width (Obsidian shows it the same way).
- An italic line directly under the image (no blank line between) becomes its caption.
- Put `diagram-dark.png` and `diagram-light.png` on consecutive lines and the site shows whichever matches the reader's theme.

## Math, code, footnotes, links

- Math: `$inline$` and `$$ display $$` (rendered with KaTeX).
- Code: fenced blocks with a language: ` ```c `.
- Footnotes: `text[^1]` and `[^1]: the note` at the bottom.
- Links to other notes: drag the note in or use Obsidian's link picker. The `.md` links are turned into site URLs automatically.
- Tags: add them in the `tags` property. Each tag gets a page at `/tags/<tag>/`.

## Publishing

Commit and push (the Obsidian Git plugin can do this from inside Obsidian). Drafts (`draft: true`) are never published.
