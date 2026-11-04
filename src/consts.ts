import type { Site, Page, Links, Socials } from "@types";

// Global
export const SITE: Site = {
  TITLE: "Sheharyaar",
  DESCRIPTION:
    "Welcome to my personal space for blogs, documentations and projects.",
  AUTHOR: "Mohammad Shehar Yaar Tausif",
};

// About Page
export const ABOUT: Page = {
  TITLE: "About",
  DESCRIPTION: "Who I am and the places I have worked.",
};

// Library Page
export const LIBRARY: Page = {
  TITLE: "Library",
  DESCRIPTION: "The books on my shelves.",
};

// Blog Page
export const BLOG: Page = {
  TITLE: "Blog",
  DESCRIPTION: "Writing on topics I am passionate about.",
};

// Projects Page
export const PROJECTS: Page = {
  TITLE: "Projects",
  DESCRIPTION: "Recent projects I have worked on.",
};

// Search Page
export const SEARCH: Page = {
  TITLE: "Search",
  DESCRIPTION: "Full-text search across the whole site.",
};

// Tags Page
export const TAGS: Page = {
  TITLE: "Tags",
  DESCRIPTION: "Everything I have written, grouped by topic.",
};

// Links
export const LINKS: Links = [
  {
    TEXT: "Blog",
    HREF: "/blog",
  },
  {
    TEXT: "Notes",
    HREF: "/notes",
  },
  {
    TEXT: "Projects",
    HREF: "/projects",
  },
  {
    TEXT: "Library",
    HREF: "/library",
  },
  {
    TEXT: "About",
    HREF: "/about",
  },
];

// Socials
export const SOCIALS: Socials = [
  {
    NAME: "Email",
    ICON: "email",
    TEXT: "sheharyaar48@gmail.com",
    HREF: "mailto:sheharyaar48@gmail.com",
  },
  {
    NAME: "Github",
    ICON: "github",
    TEXT: "sheharyaar",
    HREF: "https://github.com/sheharyaar",
  },
  {
    NAME: "LinkedIn",
    ICON: "linkedin",
    TEXT: "lagnos",
    HREF: "https://www.linkedin.com/in/lagnos/",
  },
];
