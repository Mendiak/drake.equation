# Drake Equation Interactive Dashboard

A professional, interactive tool for estimating the number of active, communicative extraterrestrial civilizations in the Milky Way galaxy using the Drake Equation framework.

[Live Demo](https://mendiak.github.io/drake.equation/)

## Technical Overview

This project is a client-side web application designed to provide real-time probabilistic modeling of the Drake Equation. It prioritizes performance, responsive data visualization, and a clean, functional user interface.

### Core Functionalities
- **Real-time Mathematical Modeling:** Instant recalculation of the N variable using high-precision JavaScript logic.
- **Dynamic Data Visualization:** 
    - **Sensitivity Analysis:** Live Chart.js implementation that visualizes the impact of the currently selected parameter on the final result.
    - **Galaxy Simulation:** An incremental particle system that represents the estimated number of civilizations (N) through dynamic DOM elements with opacity transitions.
- **State Management:** URL-based state persistence allows users to share specific configurations via unique query parameters.
- **Scenario Presets:** Pre-configured data sets for Optimistic, Scientific, and Pessimistic models.

### Responsive Implementation
- **Adaptive Layout:** Dynamic grid system that reorders components (Results, Parameters, Charts) based on viewport width to optimize user workflow.
- **Context-Aware Inputs:** The interface switches between range sliders (Desktop) and numeric inputs (Mobile) to ensure input precision across different devices.
- **Asynchronous UI Updates:** Use of requestAnimationFrame for smooth numerical transitions and setTimeout for non-blocking particle management.

## Tech Stack
- **JavaScript (ES6+):** Vanilla implementation for the calculation engine and DOM orchestration.
- **CSS3:** Advanced layouts using Grid and Flexbox, with backdrop-filter for glassmorphism effects and hardware-accelerated transitions.
- **Chart.js:** Utilized for rendering the sensitivity analysis graph with logarithmic scale support.
- **HTML5:** Semantic structure for improved accessibility and SEO.

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
- script.js: Contains the calculation logic, animation engines, and chart configurations.
- styles.css: Centralized styling with a mobile-first approach.
- index.html: The structural backbone of the application.

---

*Website by [Mikel Aramendia](https://mendiak.github.io/portfolio/)*
