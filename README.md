# Drake Equation Interactive Dashboard

An interactive tool to explore the [Drake Equation](https://en.wikipedia.org/wiki/Drake_equation), estimate the number of communicative extraterrestrial civilizations in the Milky Way, and understand the factors that shape this famous probabilistic framework.

[**Live Demo**](https://mendiak.github.io/drake.equation/)

## Features

- **Real-time calculation** — N updates instantly as you adjust 7 parameters (R*, fp, ne, fl, fi, fc, L)
- **6 preset scenarios** — Optimistic, Sagan, Drake, Modern Consensus, Rare Earth, Pessimistic
- **Sensitivity analysis** — Chart showing how varying a single parameter affects the result (log/linear toggle)
- **Cosmic Filter Funnel** — Bar chart tracing the cumulative filtering from 200B stars to detectable civilizations
- **3D galactic simulation** — Three.js Milky Way model (15K–50K stars based on device performance) with real-time color mapping by Drake filter stage, orbit controls, and fullscreen mode
- **NASA Exoplanet data** — Live counts from NASA Exoplanet Archive (with fallback) plus a curated notable exoplanet explorer
- **Bilingual EN/ES** — each language has its own static URL (`/` and `/es/`) with translated HTML, canonical and `hreflang` tags
- **Four long-form guides** — static EN/ES articles on the Drake Equation, the Fermi Paradox, the habitable zone and SETI, cross-linked with the calculator
- **Shareable URLs** — All parameters are encoded in the URL query string; copy link button included
- **Export charts** — Sensitivity and funnel charts exportable as PNG

## Tech Stack

Zero runtime dependencies. All code is vanilla ES6+.

- **JavaScript (ES6+)** — Modular global-scope architecture
- **CSS3** — Custom properties, Grid/Flexbox, mobile-first responsive design
- **Three.js** — WebGL galaxy rendering (loaded from CDN)
- **Chart.js** — Sensitivity and funnel chart rendering (loaded from CDN)
- **Lucide** — SVG icon library (loaded from CDN)

### Dev Dependencies

- ESLint + `@eslint/js` — JavaScript linting (flat config)
- Stylelint + `stylelint-config-standard` — CSS linting

## Project Structure

```
drake.equation/
├── src/                          # Source files that ship (no generated output)
│   ├── index.html                # Calculator (EN) — semantic markup, SEO, Schema.org, GA
│   ├── robots.txt
│   ├── css/
│   │   ├── index.css             # Entry point — imports the partials below
│   │   ├── variables.css         # Design tokens (colors, spacing, typography)
│   │   ├── base.css              # Reset and base elements
│   │   ├── typography.css        # Font and text styling
│   │   ├── layout.css            # Grid/flexbox layout system
│   │   ├── components.css        # Reusable UI components
│   │   └── sections/             # chart, content, disclaimer, galaxy, nasa, ...
│   ├── js/
│   │   ├── app.js                # App controller: events, i18n, URL state, init
│   │   ├── core/                 # config.js, calculations.js
│   │   ├── ui/                   # dom-updates, chart-utils, slider-utils, disclaimer, a11y
│   │   ├── features/             # nasa-exoplanets.js, galaxy/{state,scene,interaction,simulation}
│   │   └── i18n/                 # i18n.js, translations.js (EN/ES dictionaries)
│   └── assets/images/            # favicon, Open Graph image
├── content/
│   └── articles.mjs              # Long-form guide copy (EN/ES) — source for the eight pages
├── scripts/
│   ├── build.mjs                 # Copies src/ → dist/ and runs the generators
│   ├── serve.mjs                 # Zero-dependency static server for dist/
│   ├── generate-es.mjs           # Writes dist/es/index.html from src/index.html
│   └── generate-content.mjs      # Writes dist/<slug>/ + dist/es/<slug>/ + sitemap.xml
├── dist/                         # Build output (gitignored) — the deployable site
├── .github/workflows/deploy.yml  # Builds and publishes dist/ to GitHub Pages
├── eslint.config.js              # ESLint flat config
├── .stylelintrc.json             # Stylelint config
├── .gitignore
├── package.json
└── LICENSE                       # CC0 1.0 Universal (Public Domain)
```

## Getting Started

```
git clone https://github.com/Mendiak/drake.equation
cd drake.equation
npm install
npm run serve   # builds dist/ and serves it at http://localhost:8080
```

`dist/` is the complete static site (calculator + Spanish page + guide pages + sitemap). Once built, you can serve it again without rebuilding:

```bash
npm run preview
```

> Serve the site over HTTP (`npm run serve` / `npm run preview`). Opening the HTML files directly from disk (`file://`) won't work: ES modules are blocked by CORS, and the guide pages only exist in `dist/`.

To run linters:

```bash
npm run check  # lint JS + CSS
```

## Deployment

The site is published to GitHub Pages by `.github/workflows/deploy.yml`: on every push to `main` it runs `npm run build` and uploads `dist/`. In the repository settings, set **Pages → Source** to **GitHub Actions**.

All generated pages are written into `dist/` only, so the repository root stays free of build artifacts:

```bash
npm run build:es        # regenerate the Spanish page after editing src/index.html or translations
npm run build:content   # regenerate the eight guide pages and sitemap.xml
npm run build           # rebuild dist/ completely (source + all generated pages)
```

`?lang=es` / `?lang=en` links are redirected client-side to the matching static page.

## License

[CC0 1.0 Universal](LICENSE) — Public domain.

---

*Website by [Mikel Aramendia](https://mendiak.github.io/portfolio/)*
