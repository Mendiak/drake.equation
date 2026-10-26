# Scientific documentation

This directory keeps the scientific record of the Drake Equation Calculator:
where each value comes from, how confident we are, what the model does not
claim, and what changed when.

It is the human-readable half of a three-layer system:

| Layer | Location | Role |
| --- | --- | --- |
| Registry | [`src/js/core/science.js`](../../src/js/core/science.js) | Single source of truth. Feeds the calculator, the tooltips and the published page. |
| Checks | [`scripts/check-science.mjs`](../../scripts/check-science.mjs) | Fails the build if the registry, `config.js`, the sliders, the presets or the data snapshot disagree. |
| Publication | `/methodology/` and `/es/metodologia/` | Generated from the registry by `content/methodology.mjs`. |

The documents here explain and justify the registry. If this directory and the
registry disagree, **the registry wins** and this directory is the bug.

## Status vocabulary

Every parameter carries a `status`:

- **observed** — measured with an instrument. The source quotes an uncertainty.
  Examples: the galactic star formation rate, the fraction of stars with planets.
- **derived** — computed from measurements plus an explicit modelling choice.
  Example: converting 1.65 M☉/yr into stars per year requires an initial mass
  function, and that choice dominates the uncertainty.
- **assumption** — no direct measurement exists. The value is a documented
  choice, not a result. Examples: f_l, f_i, f_c, L.

Mixing these categories without labelling them is the usual way a Drake
Equation tool misleads its reader.

## Rules for editing

1. Change the value in `src/js/core/science.js`, never in the UI.
2. A new or changed value needs: `id`, bilingual `definition` and `basis`,
   `range`, `slider`, `status`, and a `sourceId` unless it is an assumption.
3. If the change touches a preset, update `PRESETS` in the same file.
4. Bump `SCIENCE_VERSION`, set `SCIENCE_REVIEWED`, and add an entry to
   [`changelog.md`](changelog.md).
5. Run `npm run science`. It checks the registry, defaults, sliders, presets,
   physical bounds, sources and snapshot freshness.
6. Run `npm run build` and `npm run seo` before opening a pull request.

## Review cadence

Each parameter has a `reviewAfter` month. The check warns when a review is
overdue. In practice:

- `R*`, `f_p`, `n_e` — revisit when a new occurrence-rate or SFR paper changes
  the consensus (roughly every 2–3 years).
- `f_l`, `f_i`, `f_c`, `L` — revisit only to improve the *justification*. There
  is no measurement to update.
- NASA counters — refreshed automatically on every build. The shipped snapshot
  expires after 200 days.

## Files

- [`parameters.md`](parameters.md) — definitions, defaults and ranges.
- [`data-provenance.md`](data-provenance.md) — exoplanet queries, capture date,
  featured-planet caveats and how to regenerate the snapshot.
- [`limitations.md`](limitations.md) — what the model does not claim.
- [`changelog.md`](changelog.md) — every scientific change, dated.
- [`references.bib`](references.bib) — BibTeX for the cited works.
