# Atlas GarageOS V4.2 implementation notes

## Scope of this pass
V4.2 is a focused visual/UX refinement pass based on the first real mobile review of V4.1. It does not change the underlying calculator/domain formulas.

## Mobile shell corrections
- Theme quick-toggle contrast strengthened in both Day and Night modes.
- Atlas brand blue is explicitly re-owned by V4 in both themes so legacy V3 dark-theme amber tokens cannot recolor navigation/CTAs.
- Primary calculator buttons are forced to white text over Atlas blue.
- Mobile dock is smaller and now auto-hides while the user scrolls downward or focuses form controls, then reappears on upward scroll / idle. This reduces persistent overlap with forms and results.
- Home category cards, popular-tool rows, directory search/filter controls and tool rows are denser on small phones.
- The mobile tools directory removes the redundant outer card surface so tool rows read as the primary objects instead of “cards inside a card.”

## Tire Size Comparison visual upgrade
- Preserves true-scale side overlay and nominal-width front view.
- Adds more realistic wheel/tire shading, rim layers and contact shadow.
- Adds a dedicated on-vehicle static-geometry view that moves hub/body height from the calculated radius change.
- Keeps a separately labelled magnified-difference lens so small real changes are visible without falsifying the proportional drawings.
- Adds a dry/wet road context panel with explicit non-claims: tire size alone does not predict grip.
- All new visual geometry updates from valid live input values.

## Wheel Offset visual upgrade
- Reworks the main scene into a coherent wheel-well cutaway instead of two detached comparison rows.
- Adds suspension/strut, fender boundary, brake/hub context and a fixed hub-mounting plane.
- Current and new wheel envelopes overlay on the same physical plane; width and ET change the live inner/outer position.
- Adds a small stance view that magnifies outer movement while the main cutaway remains proportional.
- Keeps explicit text explaining that wheel position is not a real-vehicle fitment verdict.

## Deliberately unchanged
- Calculation/domain engines.
- `What Fits` remains hidden/experimental.
- Localization routes beyond English remain unpublished until full translation QA.
- Fuel / Road Trip / EV / PSI advanced visuals remain later passes.
