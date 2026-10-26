# Parameters

Authoritative values live in [`src/js/core/science.js`](../../src/js/core/science.js).
This page is a readable mirror. Registry version **1.0.0**, reviewed **2026-10-26**.

| Symbol | Value (default) | Plausible range | Status | Source |
| --- | ---: | --- | --- | --- |
| `R*` | 1.5 stars/yr | 1.0 – 3.0 | derived | Licquia & Newman (2015) |
| `f_p` | 1.0 | 0.8 – 1.0 | observed | Cassan et al. (2012) |
| `n_e` | 0.2 planets/star | 0.05 – 1.0 | derived | Petigura et al. (2013) |
| `f_l` | 0.1 | 0.001 – 1.0 | assumption | — |
| `f_i` | 0.01 | 0.001 – 1.0 | assumption | — |
| `f_c` | 0.1 | 0.01 – 1.0 | assumption | — |
| `L` | 10,000 yr | 100 – 1,000,000 | assumption | — |

The resulting modern estimate is **N ≈ 0.3**.

## Definitions

### R* — star formation rate

Average rate at which the Milky Way forms stars, in stars per year.

The measured quantity is a **mass** rate: 1.65 ± 0.19 M☉/yr
(Licquia & Newman 2015). Converting it to stars per year requires an initial
mass function. That conversion, not the measurement, dominates the uncertainty,
which is why the status is `derived` rather than `observed`.

### f_p — fraction of stars with planets

Microlensing finds one or more bound planets per Milky Way star on average
(Cassan et al. 2012). Kepler and TESS agree: planetary systems are the rule.

### n_e — habitable planets per system

About 6% of Sun-like stars host a 1–2 R⊕ planet in the conservative habitable
zone (Petigura et al. 2013). Broader HZ definitions, super-Earths and M dwarfs
push the estimate towards 0.2–0.5. The calculator uses 0.2 as a deliberately
generous central value.

The habitable zone is defined by Kopparapu et al. (2013). It is necessary for
surface liquid water, not sufficient for life, and it says nothing about
subsurface oceans.

### f_l, f_i, f_c — the biological and technological filters

No measurements exist. The values are assumptions, and the calculator says so
in the UI, in the tooltips and in the confidence indicators.

- `f_l`: life appeared on Earth within roughly a billion years of the planet
  becoming habitable. That is consistent with a fast origin but cannot
  constrain a probability.
- `f_i`: life existed for ~3 Gyr before complex brains, and technological
  intelligence evolved once. Evolution has no direction.
- `f_c`: intelligence does not imply technology. It requires manipulative
  appendages, resources and a path that produces detectable emissions.

### L — detectability lifetime

Unknown. Earth has been detectable by radio for about a century. The plausible
range spans four orders of magnitude, the widest of any term.

`L` is **not** more important than the other factors: N is linear in all seven.
It only has the widest range, which is why it contributes most of the spread in
the plausibility envelope.

## Presets

| Preset | Basis | N |
| --- | --- | ---: |
| optimistic | Every term at the upper end of its range | 600,000 |
| sagan | Historical reconstruction of Sagan's ~10⁶ estimate (`R* = 10` is a 1960s value) | 1,000,000 |
| scientific | Measured astronomy + conservative biology + 10,000 yr | 0.3 |
| drake | Drake's original 1961 values (historical) | 10 |
| rare_earth | Planetary systems common, biology and intelligence rare | 1.5 × 10⁻⁴ |
| pessimistic | Everything unknown assumed hostile; civilisations last a century | 1.5 × 10⁻⁷ |

`npm run science` recomputes these products and fails if the Drake preset stops
giving N = 10 or if the scientific preset diverges from the documented defaults.
