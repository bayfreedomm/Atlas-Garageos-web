# Atlas GarageOS V4.4 implementation notes

## Scope
Focused Wheel Offset Calculator hierarchy pass. Calculation/domain formulas are unchanged.

## Wheel Offset Calculator
- Adds a dedicated primary-result panel directly after the actions.
- Makes outer-edge movement the first answer because it is the clearest immediate stance/fender-position change.
- Keeps inner-edge movement adjacent so clearance-side geometry is never hidden.
- Updates both primary results live while the user edits wheel width or ET.
- Keeps the natural-language geometry summary directly below the primary answer.
- Keeps the existing proportional wheel-well cutaway and magnified stance view.
- Adds a clear Details divider before the two raw geometry metrics.
- Removes special emphasis from the first detail metric because the primary result now owns hierarchy.

## Preserved constraints
- No domain/calculation-engine changes.
- No clearance, rubbing, safety, compatibility, or legal verdicts added.
- Existing routes, SEO registry, shareable state, and Fitment Studio behavior are unchanged.
