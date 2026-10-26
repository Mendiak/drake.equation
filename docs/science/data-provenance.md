# Data provenance

## NASA Exoplanet Archive counters

| | |
| --- | --- |
| Source | [NASA Exoplanet Archive](https://exoplanetarchive.ipac.caltech.edu/) — `PSCompPars` |
| Queries | `src/js/core/science.js` → `DATASETS.nasaCounts` |
| Reference snapshot | 2026-10-15: **6,451** confirmed planets, **36** habitable-zone candidates |
| Refresh | Every `npm run build`; the shipped JSON records its own `updated` date |

### Queries

```sql
-- total confirmed planets
SELECT COUNT(*) FROM PSCompPars

-- habitable-zone candidates
SELECT COUNT(*) FROM PSCompPars
WHERE pl_eqt BETWEEN 180 AND 310 AND pl_rade <= 1.6
```

### Why `pl_rade` and not `pl_radj`

`pl_rade` is the planet radius in **Earth radii**. `pl_radj` is the radius in
**Jupiter radii**; a limit of `1.6` on that column selects gas giants up to
~18 R⊕. The original query used `pl_radj` and reported 60 candidates. The
corrected query reports 36 at the reference date.

### What the habitable count means

It is a defined proxy, not a detection of life:

- `pl_eqt BETWEEN 180 AND 310` — equilibrium temperature. It ignores albedo and
  the greenhouse effect, so it is not a surface temperature. Venus has
  T_eq ≈ 227 K and a surface near 737 K.
- `pl_rade <= 1.6` — a rocky-planet cut. It excludes most sub-Neptunes.

The count will change as the archive adds planets and revises parameters. That
is expected; what must not change silently is the definition, which is why the
query lives in the registry and is published on the methodology page.

### Why a build-time snapshot

The archive does not send CORS headers, so the browser cannot query it
directly. Fetching at build time produces a reproducible, auditable file:
`dist/data/nasa-exoplanets.json`, with `total`, `habitable` and `updated`.
If the network is unavailable, the build falls back to the documented snapshot
in `science.js` and keeps its capture date, so a stale number is never
presented as fresh.

## Featured exoplanets

`src/js/features/nasa-exoplanets.js` keeps a hand-curated list. Two caveats are
encoded in the data:

- `radiusEstimated` — planets discovered by radial velocity do not transit, so
  their radius is a model estimate. The card prefixes it with `≈`.
- `massEstimated` — many masses are not measured, or are `m·sin i` lower limits.
  The card prefixes them with `≈`.

Current estimated entries: Proxima Centauri b, HD 40307 g, Gliese 667 Cc and
Wolf 1069 b (radius); Kepler-452 b, Proxima b, TOI-715 b, HD 40307 g,
Gliese 667 Cc and Wolf 1069 b (mass).

The card says "In the habitable zone", not "habitable". K2-18 b, for example,
is a sub-Neptune whose habitability is disputed even though it orbits in its
star's habitable zone.

## Do not

- Do not reintroduce a live counter without a CORS-capable proxy and a visible
  timestamp.
- Do not use `pl_radj`, `pl_eqt` without saying "equilibrium", or a habitable
  count without its definition.
- Do not describe the snapshot as "real time" or "live".
