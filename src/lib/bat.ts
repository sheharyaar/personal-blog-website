// Hand-drawn bat mark. Coordinates live in a 200x100 box; the bat itself
// spans x 1–199 and y 22–90, so crop with viewBox="0 18 200 76" for a tight fit.
// Copies of this path also live in public/favicon.svg, public/js/theme.js and
// the hr ornament in src/styles/global.css; keep them in sync if it changes.
export const BAT_PATH =
  "M100,40 L103.5,40 L107,23 L111,42 Q118,47 128,43 C150,34 172,22 199,24 Q186,36 182,62 Q169,43 153,61 Q140,46 126,65 C113,64 104,73 100,90 C96,73 87,64 74,65 Q60,46 47,61 Q31,43 18,62 Q14,36 1,24 C28,22 50,34 72,43 Q82,47 89,42 L93,23 L96.5,40 L100,40 Z"

export const BAT_VIEWBOX = "0 18 200 76"
