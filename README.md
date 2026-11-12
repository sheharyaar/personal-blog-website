My Personal Blog Website - Powered by Astro Sphere

## Commands

All commands are run from the root of the project, from a terminal:

Replace npm with your package manager of choice. `npm`, `pnpm`, `yarn`, `bun`, etc

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run dev:network`     | Starts dev server on local network               |
| `npm run sync`            | Generates TypeScript types for all Astro modules.|
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run preview:network` | Starts preview server on local network           |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |
| `npm run lint`            | Run ESLint                                       |
| `npm run lint:fix`        | Auto-fix ESLint issues                           |

## Library

Every book on `/library/` is one note in `src/content/library/`. The home page's "On the shelf" is built from the same notes, so there is nothing else to update.

### Add a book

1. Create a note named after the book, in lowercase with dashes, such as `src/content/library/deep-work.md`. In Obsidian, create it in the `library` folder and run **Templates: Insert template → Book**.
2. Fill in the properties:

   ```yaml
   ---
   title: "Deep Work"
   author: "Cal Newport"
   subject: "Focus & self-improvement"
   status:
   ---
   ```

   - `subject` is the group the book is listed under. A new value creates a new group.
   - `status` is `reading` while you're reading the book, otherwise empty. Anything else stops the build, so typos get caught.
3. Add the cover as `src/content/library/covers/deep-work.jpg`, with the same name as the note. About 400px wide is plenty. Open Library (`https://covers.openlibrary.org/b/isbn/<ISBN>-L.jpg`) or the book's Amazon page are good sources. Without a cover, the book shows as a plain tile.
4. Optionally, write a short note below the properties. It shows when someone clicks the cover.

Everything in these notes is public, so keep shelf locations and reading plans out of them. To hide a book, add `draft: true` or delete the note.

### Currently reading

- **Start a book:** set `status: reading`. The book gets a gold card and a "reading" label on `/library/`, and appears in "On the shelf" on the home page.
- **Finish or drop a book:** empty `status`. The gold card, the label and its place on the home page go away.

"On the shelf" shows up to eight books that have a cover, grouped by subject. If no book is set to `reading`, the section is hidden.

### Check and publish

Run `npm run dev` and open `localhost:4321/library/` and `localhost:4321/`. When it looks right, commit and push to `main`, and Vercel deploys the site.

For everything else (posts, notes, projects, figures, callouts), see `src/content/_guide/Writing guide.md`.
