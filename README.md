# Drake Equation Interactive Dashboard

[![XERJ Corpus Hub contributor](https://hub.xerj.org/contributors/Mendiak/badge.svg)](https://hub.xerj.org/contributors/Mendiak)

An interactive tool to explore the [Drake Equation](https://en.wikipedia.org/wiki/Drake_equation), estimate the number of communicative extraterrestrial civilizations in the Milky Way, and understand the factors that shape this famous probabilistic framework.

[**Live Demo**](https://mendiak.github.io/drake.equation/)

## Features

- **Real-time calculation** — N updates instantly as you adjust 7 parameters (R*, fp, ne, fl, fi, fc, L)
- **6 preset scenarios** — Optimistic, Sagan, Drake, Modern Estimate, Rare Earth, Pessimistic
- **Sensitivity analysis** — Chart showing how varying a single parameter affects the result (log/linear toggle)
- **Cosmic Filter Funnel** — Bar chart tracing the cumulative filtering from 200B stars to detectable civilizations
- **3D galactic simulation** — Three.js Milky Way model (15K–50K stars based on device performance) with real-time color mapping by Drake filter stage, orbit controls, and fullscreen mode
- **NASA Exoplanet data** — Exoplanet Archive counts refreshed at build time (with fallback) plus a curated notable exoplanet explorer
- **Bilingual EN/ES** — each language has its own static URL (`/` and `/es/`) with translated HTML, canonical and `hreflang` tags
- **Four long-form guides + methodology** — static EN/ES articles on the Drake Equation, the Fermi Paradox, the habitable zone and SETI, plus a generated methodology page with sources and changelog
- **Shareable URLs** — All parameters are encoded in the URL query string; copy link button included
- **Export charts** — Sensitivity and funnel charts exportable as PNG
- **SEO built in** — per-language canonical/hreflang, Schema.org (WebApplication, FAQPage, Article, BreadcrumbList), visible FAQ, sitemap, custom 404 and an automated SEO check in CI
- **Scientific traceability** — every value traced to a source, date and status (`observed` / `derived` / `assumption`), with `npm run science` enforcing the registry, presets, sliders and data freshness in CI

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
- esbuild — minifies the shipped CSS and JavaScript after each build

## Project Structure

```
drake.equation/
├── src/                          # Source files that ship (no generated output)
│   ├── index.html                # Calculator (EN) — semantic markup, SEO, Schema.org, GA
│   ├── 404.html                  # Custom not-found page (noindex)
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
│   │   ├── core/                 # config.js, calculations.js, science.js, uncertainty.js
│   │   ├── ui/                   # dom-updates, chart-utils, slider-utils, disclaimer, a11y
│   │   ├── features/             # nasa-exoplanets.js, galaxy/{state,scene,interaction,simulation}
│   │   └── i18n/                 # i18n.js, translations.js (EN/ES dictionaries)
│   └── assets/images/            # favicon, apple-touch-icon, Open Graph image
├── content/
│   ├── articles.mjs              # Long-form guide copy (EN/ES) — source for the eight guide pages
│   └── methodology.mjs           # Methodology page copy, generated from the science registry
├── scripts/
│   ├── build.mjs                 # Copies src/ → dist/, runs the generators, minifies CSS/JS
│   ├── serve.mjs                 # Zero-dependency static server for dist/
│   ├── generate-es.mjs           # Writes dist/es/index.html from src/index.html
│   ├── generate-content.mjs      # Writes dist/<slug>/ + dist/es/<slug>/ + sitemap.xml
│   ├── check-seo.mjs             # Validates titles, canonicals, hreflang, links and sitemap
│   └── check-science.mjs         # Validates the science registry, presets, sliders and data
├── docs/science/                 # Parameter provenance, limitations and changelog
├── dist/                         # Build output (gitignored) — the deployable site
├── CITATION.cff                  # Citation metadata for the software
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
npm run check  # lint JS + CSS + scientific registry
```

## Scientific checks

Every value lives in `src/js/core/science.js` with a source, a date and a status (`observed`, `derived` or `assumption`). The calculator, the tooltips and the published [/methodology/](https://mendiak.github.io/drake.equation/methodology/) page are generated from that registry.

```bash
npm run science
```

`scripts/check-science.mjs` fails if the registry, `config.js`, the HTML sliders and the presets disagree, if any fraction leaves the [0, 1] range, if an observed value lacks a reference, if the NASA queries stop using `pl_rade`, if the shipped exoplanet snapshot is older than 200 days, or if a claim that was corrected comes back. It runs inside `npm run check` and again in CI after the build.

The provenance record lives in [`docs/science/`](docs/science/): parameter definitions, data provenance, limitations and a changelog of every scientific change.

## SEO checks

After a build, validate the generated site:

```bash
npm run seo
```

`scripts/check-seo.mjs` walks every URL in `sitemap.xml` and fails the build if a title or description is out of range, the canonical does not match, an `hreflang` alternate is missing or points outside the sitemap, a page has more than one `<h1>`, a JSON-LD block is invalid, or an internal link points to a file that does not exist. It also verifies that the 404 page is `noindex` and that every built page is listed in the sitemap. The same command runs in CI before deployment.

## Accessibility

The site targets **WCAG 2.2 AA** and scores **100 in Lighthouse Accessibility** on the calculator (EN/ES), the guide pages and the 404 page, in both desktop and mobile emulation. It includes:

- A skip link and a single, complete `<main>` landmark
- Visible focus rings, focus trapping and focus restoration for every dialog
- Accessible names on all controls, `aria-pressed` states on the galaxy legend and keyboard support for custom buttons
- Text alternatives for both charts (the sensitivity chart ships an `sr-only` data table) and a live region for the result
- Respect for `prefers-reduced-motion` and AA-compliant contrast in light and dark sections

Run the checks with `npm run check` (JS + CSS lint + scientific registry) and `npm run seo` (build validation). The visual/auditory audit is done with Chrome DevTools Lighthouse and axe-core.

## Deployment

The site is published to GitHub Pages by `.github/workflows/deploy.yml`: on every push to `main` it runs `npm run check`, `npm run build`, `npm run science` and `npm run seo`, then uploads `dist/`. In the repository settings, set **Pages → Source** to **GitHub Actions**.

All generated pages are written into `dist/` only, so the repository root stays free of build artifacts:

```bash
npm run build:es        # regenerate the Spanish page after editing src/index.html or translations
npm run build:content   # regenerate the ten guide and methodology pages and sitemap.xml
npm run build           # rebuild dist/ completely (source + all generated pages)
```

`?lang=es` / `?lang=en` links are redirected client-side to the matching static page.

## License

[CC0 1.0 Universal](LICENSE) — Public domain.

---

*Website by [Mikel Aramendia](https://mendiak.github.io/portfolio/)*
