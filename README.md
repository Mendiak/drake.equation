# Drake Equation Interactive Dashboard

A professional, interactive tool for estimating the number of active, communicative extraterrestrial civilizations in the Milky Way galaxy using the Drake Equation framework.

[Live Demo](https://mendiak.github.io/drake.equation/)

## Technical Overview

This project is a client-side web application designed to provide real-time probabilistic modeling of the Drake Equation. It prioritizes performance, responsive data visualization, and a clean, functional user interface.

### Core Functionalities
- **Real-time Mathematical Modeling:** Instant recalculation of the N variable using high-precision JavaScript logic with logarithmic scaling support for parameters spanning multiple orders of magnitude.
- **Dynamic Data Visualization:**
    - **Sensitivity Analysis:** Live Chart.js implementation that visualizes the impact of the currently selected parameter on the final result, with logarithmic scale toggle.
    - **Cosmic Filter Funnel:** A funnel chart showing how each factor filters down potential civilizations from billions of stars to detectable communicative societies.
    - **3D Galactic Simulation:** Three.js-powered visualization of a Milky Way-like barred spiral galaxy with 80,000+ stars, globular clusters, and open clusters. Stars change color in real-time to reflect each Drake Equation filter stage.
- **State Management:** URL-based state persistence allows users to share specific configurations via unique query parameters.
- **Scenario Presets:** Six pre-configured data sets (Optimistic, Sagan, Drake, Modern Consensus, Rare Earth, Pessimistic) with tooltip explanations.
- **Bilingual Support:** Full English/Spanish localization with persistent language preference via localStorage.
- **Interactive Tooltips:** Detailed parameter information including scientific basis, current estimates, uncertainty levels, and why each factor matters.
- **Smart Input Handling:** Slider values snap to scientifically meaningful detents with logarithmic scaling for biological parameters (f<sub>l</sub>, f<sub>i</sub>).
- **Scientific Confidence Indicators:** Visual color-coded system showing the confidence level for each parameter (Well-observed, Theoretical, Speculative).

### Responsive Implementation
- **Adaptive Layout:** Dynamic grid system that reorders components (Results, Parameters, Charts) based on viewport width to optimize user workflow.
- **Context-Aware Inputs:** The interface switches between range sliders (Desktop) and numeric inputs (Mobile) to ensure input precision across different devices.
- **Asynchronous UI Updates:** Use of requestAnimationFrame for smooth numerical transitions and setTimeout for non-blocking particle management.

### Galaxy Simulation Features
- **Barred Spiral Galaxy Model:** Realistic Milky Way simulation with 4 spiral arms, central bar structure, and natural stellar distribution.
- **Stellar Populations:** Stars are colored based on their galactic location (core, bar, thick disk, spiral arms) reflecting real stellar population differences.
- **Star Clusters:** 12 globular clusters (old, metal-poor stars in galactic halo) and 18 open clusters (young, hot stars in spiral arms).
- **Interactive Controls:** Adjustable rotation speed, view tilt, zoom level, and star size with fullscreen mode support.
- **Real-time Color Mapping:** Each star's color dynamically updates to show which Drake Equation filters it passes (planets → habitable → life → intelligence → technology).

## Tech Stack
- **JavaScript (ES6+):** Vanilla implementation for the calculation engine, DOM orchestration, and Three.js galaxy simulation.
- **CSS3:** Modular architecture with CSS custom properties (variables), Grid and Flexbox layouts, backdrop-filter for glassmorphism effects, and hardware-accelerated transitions.
- **Three.js:** WebGL-based 3D rendering for the galactic simulation with additive blending and vertex-colored point clouds.
- **Chart.js:** Utilized for rendering the sensitivity analysis and funnel charts with logarithmic scale support.
- **HTML5:** Semantic structure for improved accessibility and SEO, with Google Analytics integration.

## Project Structure
```
drake.equation/
├── index.html              # Main HTML structure with semantic markup
├── script.js               # Main application logic, UI updates, chart handling
├── calculations.js         # Pure calculation functions (formatResult, calculateN, getScenario)
├── galaxy-simulation.js    # Three.js galactic visualization engine
├── nasa-exoplanets.js      # NASA exoplanet data integration and fetching
├── chart-utils.js          # Chart.js initialization and update utilities
├── dom-updates.js          # DOM manipulation helpers
├── config.js               # Default values, presets, and configuration constants
├── translations.js         # Bilingual (EN/ES) translation strings
├── styles.css              # Main stylesheet importing modular CSS
├── css/
│   ├── variables.css       # CSS custom properties (colors, spacing, typography)
│   ├── base.css            # Reset and base element styles
│   ├── typography.css      # Font and text styling
│   ├── layout.css          # Grid and flexbox layout system
│   ├── components.css      # Reusable UI components (buttons, cards, modals)
│   └── sections.css        # Section-specific styles (charts, galaxy, funnels)
└── assets/
    └── images/             # Favicon and other static assets
```

## Installation and Deployment

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Mendiak/drake.equation
   ```
2. **Local Development:**
   Simply open index.html in a modern web browser. No dependencies or build steps are required.
3. **Deployment:**
   The project is ready for static hosting (GitHub Pages, Vercel, Netlify).

## Development
The codebase is structured to be modular and easy to extend:
- **script.js:** Main application logic, event handlers, chart configurations, and UI state management.
- **calculations.js:** Pure functions for Drake Equation calculation and scenario detection.
- **galaxy-simulation.js:** Three.js-based 3D galaxy visualization with real-time color updates.
- **styles.css + css/:** Modular CSS architecture with mobile-first approach and CSS custom properties.
- **translations.js:** Centralized internationalization (i18n) with English and Spanish support.
- **config.js:** Configuration constants, default values, and preset scenarios.

## Key Features

### Scientific Accuracy
- Logarithmic slider scaling for parameters spanning multiple orders of magnitude (f<sub>l</sub>, f<sub>i</sub>)
- Smart value snapping to scientifically meaningful detents
- Uncertainty level indicators based on current astrobiological research
- Confidence level color coding (green = well-observed, red = highly speculative)

### Educational Value
- Interactive tooltips explaining each parameter's scientific basis
- Funnel visualization showing the cumulative filtering effect
- Timeline of SETI history from Project Ozma (1960) to James Webb (2021)
- Key concepts section explaining Habitable Zone, Technosignatures, Great Filter, and Cosmic Perspective

### User Experience
- Shareable URLs with preserved parameter states
- Export charts as PNG images
- Fullscreen galaxy visualization mode
- Responsive design optimized for desktop, tablet, and mobile
- Smooth animations using requestAnimationFrame

---

*Website by [Mikel Aramendia](https://mendiak.github.io/portfolio/)*
