# Atlas GarageOS V4.5 — Brand hierarchy + light-theme contrast + home visual reset

## Why this pass exists
User review identified three unresolved visual issues:
1. `Garage` should carry the brand at first glance; `Atlas` is secondary and `OS` can be quiet.
2. The homepage hero illustration felt too playful/cartoon-like and did not explain the product strongly enough.
3. Light mode reused luminous orange/yellow accents that were readable on dark surfaces but weak on white.

## Changes
- Reworked the existing wordmark hierarchy without changing product naming or SEO metadata:
  - `Garage` is now the dominant visual word.
  - `Atlas` is a small provenance kicker.
  - `OS` is a restrained suffix.
- Replaced the homepage cartoon-like car hero with an engineering-console visual built in HTML/SVG/CSS.
  - Wheel/tire geometry is the central scene.
  - Fuel/trip, EV charging and fitment readouts make the platform scope legible at a glance.
  - Hero copy now explicitly says what the site does.
- Added theme-specific semantic accent tokens.
  - Dark mode keeps luminous orange for technical emphasis.
  - Light mode uses a darker burnt-orange (`#9a4300`) for text/measurement meaning; it has strong contrast on white.
- Audited key orange/yellow text treatments in technical visuals and warning/mistake UI for light mode.

## Preserved decisions
- Product remains Atlas GarageOS; this pass changes visual hierarchy, not canonical naming/SEO identity.
- Blue remains the primary brand/navigation/action color.
- No calculation/domain/core code changed.
- NUMBER → SHAPE → MEANING remains the visual-system principle.
- My Garage remains secondary; homepage leads with the tool jobs.
