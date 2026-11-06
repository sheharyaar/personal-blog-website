import rss from "@astrojs/rss"
import { getCollection } from "astro:content"
import { SITE } from "@consts"

type Context = {
  site: string
}

export async function GET(context: Context) {
	const posts = await getCollection("blog", (entry) => !entry.data.draft)
  const projects = await getCollection("projects", (entry) => !entry.data.draft)

  const items = [...posts, ...projects]

  items.sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime())

  return rss({
    title: SITE.TITLE,
    description: SITE.DESCRIPTION,
    site: context.site,
    items: items.map((item) => ({
      title: item.data.title,
      description: item.data.summary,
      pubDate: item.data.date,
      // Absolute, because rss() puts a trailing slash on relative links, even after a #fragment.
      link: item.collection === "projects" ? new URL(`/projects/#${item.id}`, context.site).href : `/blog/${item.id}/`,
    })),
  })
}
