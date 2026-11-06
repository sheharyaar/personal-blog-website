import type { ImageMetadata } from "astro"
import { tagSlug } from "@lib/content"

// A book's cover is library/covers/<same name as its note>; without one it gets a plain tile.
const coverFiles = import.meta.glob<{ default: ImageMetadata }>("/src/content/library/covers/*.{jpg,jpeg,png,webp}", { eager: true })

export const covers = new Map(
  Object.entries(coverFiles).map(([path, file]) => [tagSlug(path.split("/").pop()!.replace(/\.\w+$/, "")), file.default]),
)
