# V4.7 Implementation Notes

## Scope
Homepage visual-direction correction after V4.6. No domain/calculation logic changes.

## Homepage
- Replaced the V4.5/V4.6 technical console hero with the approved Concept B direction: real car, real context.
- Reused the existing local `public/atlas-hero-car.png` asset as the photographic hero; no external runtime dependency.
- Hero now keeps a dark photographic treatment in both light and dark themes so typography remains predictable and high contrast.
- Hero copy now states the product more directly: tire fitment, wheel offset, fuel cost, road trips and EV charging.
- Added primary `Explore tools` and secondary `Compare fitment` actions.
- Added compact tool-family strip: Tires & wheels, Fuel & trips, EV tools, Performance.
- Moved tool search to a dedicated surface immediately below the hero rather than placing a white search control over the photo.

## Brand
- Garage remains the dominant wordmark term from V4.5; Atlas remains secondary and OS remains quiet.

## Light-theme contrast
- Darkened semantic amber/orange text for light surfaces.
- Darkened yellow warning/status text and retained a pale yellow background.
- Accent-background controls use white foreground text in light mode.
- The photographic homepage hero does not switch to a pale day-mode background.

## Guardrails
- No edits under `src/domain/`.
- No calculator formula changes.
- No fitment recommendation logic changes.
