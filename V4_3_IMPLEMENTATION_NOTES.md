# Atlas GarageOS V4.3 implementation notes

## Scope
Focused Tire Size Comparison hierarchy pass. Calculation/domain formulas are unchanged.

## Tire Size Comparison
- Adds a dedicated primary-result panel immediately after the actions.
- Makes diameter percentage the first answer instead of burying it among equal metric cards.
- Adds a theoretical 100 km/h indicated-speed example derived from the same diameter ratio.
- Keeps the existing natural-language interpretation directly below the primary answer.
- Keeps the V4.2 live technical visual system and its true-scale / magnified-difference distinction.
- Renames detailed metric labels to remove the duplicate “Diameter difference” label and clarify static/theoretical semantics.
- Removes the special visual emphasis from the first detailed metric because the primary answer now owns hierarchy.

## Preserved constraints
- No domain/calculation-engine changes.
- No compatibility or safety verdicts added.
- What Fits remains hidden/experimental.
- Existing SEO routes and tool registry are unchanged.
