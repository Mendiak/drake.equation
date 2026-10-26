# Scientific changelog

Every change to a value, a justification or a scientific claim. Newest first.
The same version is shown on `/methodology/` and in the footer of the registry.

## 1.0.0 — 2026-10-26

First documented release. Values moved into `src/js/core/science.js`, the
published methodology page was generated from that registry, and the following
corrections were made.

### Data

- **Fixed the habitable-zone query.** `pl_radj` (Jupiter radii) → `pl_rade`
  (Earth radii). A limit of 1.6 on the wrong column admitted gas giants up to
  ~18 R⊕ and reported 60 candidates instead of 36.
- **Refreshed the exoplanet counters.** 5,800 → 6,451 confirmed planets
  (NASA Exoplanet Archive, 2026-10-15).
- **Removed the "live data / real-time" claim.** The counters are a build-time
  snapshot; the page now shows its capture date.
- **Renamed `pl_radj` → `pl_rade` in the featured-planet card** and marked
  radii and masses that are model estimates (`≈`) for non-transiting planets.
- **Relabelled "Temp" as "Teq"** and explained that it is an equilibrium
  temperature.

### Defaults and presets

- **The default state is now the modern estimate (N ≈ 0.3)**, not Sagan's
  historical 10⁶. "Reset to defaults" resets to the same values.
- **`n_e` default 2 → 0.2** (occurrence of habitable-zone rocky planets).
- **`f_p` default 0.8 → 1.0** (planetary systems are the rule).
- **Presets that are not historical no longer lower `f_p`** below the measured
  range: Rare Earth and Pessimistic now keep `f_p = 1`, because the Rare Earth
  hypothesis is about biology, not about the abundance of planets.
- **"Modern Consensus" → "Modern Estimate"** in both languages. There is no
  consensus on the biological terms.
- **Sagan and Drake presets are marked historical** and exempt from the
  plausible-range check; their `R* = 10` is a 1960s value.

### Method

- **The "confidence range" is now the "plausibility envelope"** and clamps
  fractions to `[0, 1]`. It no longer produces `f_p = 1.2` or `f_c = 10`.
- **Nearest-neighbour distance** uses `0.5·√(A/N)` with `R = 50,000 ly`
  (≈ 44,000/√N) instead of `100,000/√N`, which overestimated by ~2.3×.
- **The funnel starts at `R*·L`** (stars formed during the detectability
  window) instead of 200 billion stars, so the last bar is exactly N and the
  chart is monotonic apart from the `n_e` step. Percentages above 100% are
  shown as multipliers.
- **The galaxy visualisation no longer double-transforms `f_l` and `f_i`**
  (the sliders are linear) and no longer divides `n_e` by an arbitrary 10.
  The legend now says "Communicative (potential)".
- **The "sensitivity" claim was corrected**: N is linear in all seven factors
  (elasticity = 1), so no factor is more sensitive than another. Only the
  ranges differ.
- **Slider behaviour now matches the documentation**: f_p and f_c snap to
  0.1–1.0 (they could not reach 1.0 before), n_e snaps in 0.1 steps, and the
  f_l/f_i tooltips no longer claim a logarithmic scale.

### Claims

- The habitable zone is necessary but not sufficient for surface liquid water;
  subsurface oceans exist outside it.
- `L` is the widest-ranging factor, not "the most critical".
- `N = 1` does not mean "we are alone".
- "Ten orders of magnitude" → "many orders of magnitude" (the envelope spans
  about sixteen).
- The confidence indicators' accessible labels were inverted (the best-measured
  terms were announced as "low confidence").
- The scarcity of life's origin is stated as unresolved, not as evidence that
  abiogenesis is inevitable.
