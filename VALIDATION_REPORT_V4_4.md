# Atlas GarageOS V4.4 validation report

## Scope
Wheel Offset Calculator UI hierarchy and live-result behavior only.

## Checks
- Confirmed calculation/domain/core files are unchanged from V4.3.
- Default 8J ET40 -> 8.5J ET35 math remains: inner +1.35 mm, outer +11.35 mm.
- Primary result and detail metrics are driven by the existing `calculateWheelOffsetTool` result.
- Input preview now updates summary, primary result, technical visual, and detail metrics together.
- Existing shareable-state field names and calculator selector remain unchanged.
- Existing proportional cutaway and mini stance visual are preserved.
- No safety, rubbing, compatibility, or legal verdict was introduced.

## Static comparison
System TypeScript 5.8.3 reports 31 pre-existing project errors on both V4.3 and V4.4 when checking `src/ui/tool-calculators.ts` and its dependency graph. After normalizing line numbers, the error sets are identical: V4.4 adds no new static TypeScript error under this check.

## Environment limitation
The project declares Node >=24 and pnpm 11.19.0. The available runtime is Node 22.16.0 and does not provide pnpm, so the canonical `pnpm build` / Astro production build was not run here.
