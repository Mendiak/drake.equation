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
- **Bilingual EN/ES** — Full Spanish translation with persistent language preference
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
├── index.html              # Main HTML — semantic markup, SEO, Schema.org, GA
├── styles.css              # Main stylesheet (imports modular CSS)
├── css/
│   ├── variables.css       # Design tokens (colors, spacing, typography)
│   ├── base.css            # Reset and base elements
│   ├── typography.css      # Font and text styling
│   ├── layout.css          # Grid/flexbox layout system
│   ├── components.css      # Reusable UI components
│   └── sections/           # Section-specific styles
│       ├── chart.css
│       ├── galaxy.css
│       ├── nasa.css
│       ├── performance.css
│       ├── result-card.css
│       └── sidebar.css
├── script.js               # App controller: events, i18n, URL state, init
├── calculations.js          # Pure functions: calculateN, formatResult, getScenario
├── chart-utils.js           # Chart.js init, update, and custom plugins
├── dom-updates.js           # DOM rendering helpers: timeline, magnitude, results
├── galaxy-simulation.js     # Three.js engine: Milky Way generation, controls
├── nasa-exoplanets.js       # NASA API integration, featured exoplanets
├── translations.js          # EN/ES dictionaries (720+ lines)
├── config.js                # Default values, presets, constants
├── eslint.config.js         # ESLint flat config
├── .stylelintrc.json        # Stylelint config
├── .gitignore
├── package.json
└── LICENSE                  # CC0 1.0 Universal (Public Domain)
```

## Getting Started

```
git clone https://github.com/Mendiak/drake.equation
cd drake.equation
```

Open `index.html` in a browser — no build step required.

To run linters:

```bash
npm install    # install dev dependencies
npm run check  # lint JS + CSS
```

## Deployment

Ready for any static host (GitHub Pages, Vercel, Netlify, Firebase Hosting).

## License

[CC0 1.0 Universal](LICENSE) — Public domain.

---

*Website by [Mikel Aramendia](https://mendiak.github.io/portfolio/)*
