// Same path as src/lib/bat.ts (this file is served as-is, so it can't import it).
const BAT_PATH =
  "M100,40 L103.5,40 L107,23 L111,42 Q118,47 128,43 C150,34 172,22 199,24 Q186,36 182,62 Q169,43 153,61 Q140,46 126,65 C113,64 104,73 100,90 C96,73 87,64 74,65 Q60,46 47,61 Q31,43 18,62 Q14,36 1,24 C28,22 50,34 72,43 Q82,47 89,42 L93,23 L96.5,40 L100,40 Z"

function applyTheme(theme) {
  const element = document.documentElement

  const css = document.createElement("style")

  css.appendChild(
    document.createTextNode(
      `* {
           -webkit-transition: none !important;
           -moz-transition: none !important;
           -o-transition: none !important;
           -ms-transition: none !important;
           transition: none !important;
        }`,
    ),
  )
  document.head.appendChild(css)

  if (theme === "dark") {
    element.classList.add("dark")
  } else {
    element.classList.remove("dark")
  }

  window.getComputedStyle(css).opacity
  document.head.removeChild(css)
  localStorage.theme = theme
}

// Light the bat-signal over the page. `atPeak` runs while the overlay fully
// covers the page, which is when the theme switches.
function summonSignal(atPeak) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  if (reduceMotion || document.getElementById("signal-overlay")) {
    atPeak?.()
    return
  }

  const overlay = document.createElement("div")
  overlay.id = "signal-overlay"
  overlay.setAttribute("aria-hidden", "true")
  overlay.innerHTML = `
    <div class="so-beam"><div></div></div>
    <svg class="so-signal" viewBox="0 0 200 100">
      <defs>
        <radialGradient id="so-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stop-color="#fff4cf" stop-opacity="0.97"/>
          <stop offset="0.6" stop-color="#f0d68c" stop-opacity="0.82"/>
          <stop offset="0.86" stop-color="#e0bd67" stop-opacity="0.28"/>
          <stop offset="1" stop-color="#e0bd67" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <ellipse cx="100" cy="50" rx="100" ry="50" fill="url(#so-glow)"/>
      <path d="${BAT_PATH}" transform="translate(38 15.3) scale(0.62)" fill="#0d1422" fill-opacity="0.92"/>
    </svg>`
  document.body.appendChild(overlay)

  // Force a style flush so the transitions run from their start state.
  overlay.getBoundingClientRect()
  overlay.classList.add("on")

  setTimeout(() => atPeak?.(), 550)
  setTimeout(() => overlay.classList.add("off"), 1150)
  setTimeout(() => overlay.remove(), 1800)
}

function changeTheme() {
  const goingDark = !document.documentElement.classList.contains("dark")
  if (goingDark) {
    summonSignal(() => applyTheme("dark"))
  } else {
    applyTheme("light")
  }
}

function preloadTheme() {
  const theme = (() => {
    const userTheme = localStorage.theme

    if (userTheme === "light" || userTheme === "dark") {
      return userTheme
    } else {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    }
  })()

  const element = document.documentElement

  if (theme === "dark") {
    element.classList.add("dark")
  } else {
    element.classList.remove("dark")
  }

  localStorage.theme = theme
}

// Easter egg: type "batman" anywhere outside a text field.
let typed = ""
document.addEventListener("keydown", (event) => {
  if (event.metaKey || event.ctrlKey || event.altKey || event.key.length !== 1) return
  const target = event.target
  if (target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return

  typed = (typed + event.key.toLowerCase()).slice(-6)
  if (typed !== "batman") return
  typed = ""
  if (document.documentElement.classList.contains("dark")) {
    summonSignal()
  } else {
    changeTheme()
  }
})

window.onload = () => {
  function initializeThemeButtons() {
    const headerThemeButton = document.getElementById("header-theme-button")
    const drawerThemeButton = document.getElementById("drawer-theme-button")
    headerThemeButton?.addEventListener("click", changeTheme)
    drawerThemeButton?.addEventListener("click", changeTheme)
  }

  document.addEventListener("astro:after-swap", initializeThemeButtons)
  initializeThemeButtons()
}

document.addEventListener("astro:after-swap", preloadTheme)

preloadTheme()
