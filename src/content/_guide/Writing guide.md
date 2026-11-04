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
| Book | `library/<book-name>.md` | listed on `/library/` |
| Job | `work/<name>.md` | timeline on `/about/` |
| About text | `about.md` | `/about/` and the home page |

New post: create the folder, create a note called `index` inside it, then run **Templates: Insert template → Blog post** from the command palette (Ctrl+P). The title, summary, date and tags appear as Properties at the top. Fill them in there.

Files and folders starting with `_` are never published.

## Library

Each book is one note in `library/`. To add a book, create a note there and insert the **Book** template.

- `status`: `read`, `reading` or `unread`, in lowercase. Leave it empty to show no status. Anything else stops the build, so typos get caught.
- `subject`: the group the book appears under. A new value creates a new group and filter.
- A short note: write it below the properties. It shows when someone clicks the cover, and a gold dot on the cover marks books that have one.
- Cover: put an image in `library/covers/` with the same name as the note (`deep-work.jpg` for `deep-work.md`). About 400px wide is plenty. Without one, the book shows a plain tile with its title.
- To hide a book, add `draft: true` or delete its note.

Everything in these notes is public, so keep shelf locations and reading plans out of them.

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
- Code: fenced blocks with a language: ` ```c `. Add options after the language: ` ```c title="main.c" {2,4-6} ` gives the block a file title and highlights those lines. `ins={3}` and `del={4}` mark lines as added or removed, and `wrap` wraps long lines. Every block gets a copy button.
- Footnotes: `text[^1]` and `[^1]: the note` at the bottom.
- Links to other notes: drag the note in or use Obsidian's link picker. The `.md` links are turned into site URLs automatically.
- Tags: add them in the `tags` property. Each tag gets a page at `/tags/<tag>/`.

## Publishing

Commit and push (the Obsidian Git plugin can do this from inside Obsidian). Drafts (`draft: true`) are never published.
