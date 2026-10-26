# Limitations

What the calculator does **not** claim.

## N is a point estimate, not a probability

The equation multiplies seven central values. The real distribution of
plausible answers is broad and skewed, and a single number hides that. In
particular:

- `N = 1` does **not** mean "we are alone". It means the expected number is one.
  It could be zero or a handful.
- `N < 1` means "probably none at any given time", not "certainly none".
- Comparing `N` with the number of stars is only meaningful as an average.

For a probabilistic treatment, see Sandberg, Drexler & Ord (2018). They show
that a substantial probability of being alone is consistent with the data once
the parameters are treated as distributions.

## The "plausibility envelope" is not a confidence interval

The UI multiplies the extreme value of every factor:

```
N_min = Π (x_i / u_i)      N_max = Π (x_i × u_i)
```

with fixed multipliers in `UNCERTAINTY_FACTORS`. This is the widest possible
range under worst-case independence. The probability of all seven extremes
occurring together is negligible, so it must not be read as "95% confidence".
Fractions are clamped to `[0, 1]`; without that clamp the envelope contains
impossible values such as `f_p = 1.2` or `f_c = 10`.

## The spatial model is a thin uniform disk

The mean separation is estimated as `0.5·√(A/N)` for a disk of radius
`R = 50,000 ly` and area `A = πR²`. Real stars are concentrated towards the
centre and in spiral arms, the disk has thickness, and we are not at its centre.
Treat the number as an order of magnitude.

## The star formation rate is treated as constant

`N = R*·L·…` assumes the current rate held for the last `L` years. Over a
million years that is reasonable; over a billion it is not. A rigorous treatment
would integrate the star formation history over the detectability window.

## The habitable zone is not habitability

A planet in the zone needs an atmosphere, a magnetic field and a stable star to
hold surface liquid water. Red dwarfs flare; tidally locked planets have
permanent day and night sides. Subsurface oceans (Europa, Enceladus) can exist
far outside the classical zone. The exoplanet counters use a temperature and
radius proxy, and the card says "in the habitable zone", not "habitable".

## No scientific consensus

There is no consensus on `f_l`, `f_i`, `f_c` or `L`. Any label that suggests
otherwise is wrong. The preset previously called "Modern Consensus" was renamed
"Modern Estimate" for this reason.

## The 3D galaxy is illustrative

A few tens of thousands of points stand in for ~200 billion stars. Colours show
how far a star system could pass the Drake filters — potential, not a census of
civilisations active now. Blinking stars are potential locations, not
simultaneous civilisations.

## SETI has searched a small slice

A non-detection constrains only the parameter space actually observed: a small
sample of stars, a limited range of frequencies, for short periods. Silence is
informative only when the search is broad enough to make it surprising.

## The funnel starts at R*·L

The cosmic filter funnel begins with the stars formed during the detectability
window, not with all 200 billion stars of the Galaxy. This is the only starting
point whose product is exactly `N`. The `n_e` step counts planets per system, so
it is the only bar that can exceed the previous one; every other step multiplies
by a fraction.
