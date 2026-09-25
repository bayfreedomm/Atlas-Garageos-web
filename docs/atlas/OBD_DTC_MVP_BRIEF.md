# Atlas GarageOS — OBD/DTC MVP Brief

Status: `PLANNED` — design brief only, 2026-09-25.

This document is the gate before OBD/DTC product code or indexable routes are created. It does not assert that any code meaning, cause, urgency, repair, TSB, or recall is currently verified in Atlas.

## Why this is worth building

OBD/DTC is both a high-intent organic entry point and a reusable Vehicle Intelligence Graph entity family. The useful product is not `P0420 = one sentence`; it is a source-bound explanation that helps a user understand what the code means, what it does not prove, what to check first, and where vehicle-specific evidence is still missing.

## MVP boundary

The first release is deliberately small:

- 25–50 generic, high-intent codes across powertrain, misfire, fuel/air, emissions, and selected network/body/ABS families.
- Candidate first-wave anchors for source research: `P0420`, `P0300`, `P0301`, `P0171`, `P0455`, `P0011`, and `U0100`. These are candidates, not approved content.
- Generic code pages only. No `code × vehicle × trim` pages until unique vehicle-specific evidence exists.
- No diagnosis certainty, repair estimate, or safety clearance verdict.
- No AI-generated code facts without a reviewed source record.
- Warning-light and symptom links may be present only when their own evidence records exist.

The MVP is successful when a user can identify the code family, understand the common meaning and limitations, follow a cautious first-check sequence, and continue to a relevant Atlas action without the page pretending to diagnose the vehicle.

## Route and SEO contract

Canonical public routes:

- `/obd-codes/` — curated directory with families and plain-language entry points.
- `/obd-codes/{normalized-code}/` — one page per approved generic code, lowercase URL, trailing slash.

The route is indexable only when the record has reviewed content, a provenance record, meaningful interpretation, limitations, and at least one useful internal next action. Query state, vehicle selection, and user-entered freeze-frame values must remain application state and must not create indexable URL combinations.

Vehicle-specific routes are deferred. If later approved, they must require a real unique evidence bundle and use a separate route family; they must not be generated combinatorially.

## Proposed domain record

The eventual domain schema should keep the generic code entity independent from vehicle-specific observations:

```text
DtcCode
  code: normalized five-character code
  standard: generic OBD-II / manufacturer-specific / unknown
  family: P | B | C | U
  system: engine, emissions, transmission, network, body, chassis, etc.
  subsystem: optional normalized subsystem
  component: optional component references
  title: reviewed plain-language title
  meaning: what the code generally indicates
  symptoms: reviewed symptom references
  possibleCauses: ordered possibilities, not a diagnosis
  firstChecks: low-risk observations and documentation checks
  diagnosticOrder: bounded next-step sequence
  relatedCodes: normalized code references
  relatedWarnings: warning-light references
  relatedSymptoms: symptom references
  vehicleContext: separate optional evidence links, never embedded guesses
  urgency: context + safe-immediate-action wording, not a universal severity score
  evidence: EvidenceRecord[]
  confidence: high | medium | low | unknown
  reviewedAt: date
  status: draft | reviewed | published | retired
```

`EvidenceRecord` must include at least `sourceType`, `publisher`, `title`, `locator`, `scope`, `retrievedAt`, `license/permission`, and an Atlas review note. The source type must be one of the controlled classes: official standard, manufacturer service information, official recall/communication, government investigation, vetted technical reference, owner complaint, community report, calculated, or estimated. A complaint or community report cannot be presented as a confirmed defect.

## Generic versus vehicle-specific language

Every page must visibly separate:

1. **Generic meaning:** what the normalized code commonly indicates across compatible OBD systems.
2. **Vehicle-specific evidence:** exact make/model/year/engine/market observations, manufacturer communication, recall, or sourced service information.
3. **User input:** scanner text, freeze-frame values, symptoms, and maintenance history supplied by the user.
4. **Atlas calculation:** deterministic interpretation of a validated input, never a hidden factual assertion.

`P0420 generally indicates catalyst-system efficiency below the monitored threshold` and `P0420 on this exact 2020 vehicle is commonly caused by X` are different evidence claims and must never share the same badge or confidence value.

## Page information architecture

1. Code identity, family, and a one-sentence plain-language meaning.
2. What it can indicate and what it does not prove.
3. Symptoms, with a clear generic/vehicle-specific label.
4. Possible causes ordered as possibilities, not a ranked certainty.
5. First checks that do not require unsafe work or invented thresholds.
6. Diagnostic order and when a qualified technician or manufacturer procedure is needed.
7. Related codes, warning lights, symptoms, maintenance, and fitment/vehicle context where sourced.
8. Evidence/provenance panel and confidence state.
9. Relevant Atlas next actions: enter vehicle context, open a related tool, save a note to My Garage later, or read methodology.

## Source and licensing gate

Before content entry, record the source plan and permission for each field. Acceptable source paths may include licensed data, official manufacturer/service documentation with permitted use, public government material with clear reuse terms, or a carefully reviewed standard/reference source. A search snippet, forum answer, or model memory is not sufficient for a safety-relevant claim.

The project must not scrape or republish a competitor’s code encyclopedia without permission. If a source cannot be cited and retained with its scope, the field stays `UNKNOWN` / `NOT VERIFIED`.

## Internal graph links

The DTC family should eventually connect to:

`Vehicle → ModelYear/Trim → Engine/System/Component → DTC → WarningLight/Symptom → Maintenance/Repair → Tool → My Garage history`

The first MVP only needs safe, real links: code directory, related generic code pages, existing methodology/contact/privacy pages, and a future vehicle-context entry point. Do not create empty graph nodes just to add links.

## Acceptance gates before implementation

- [ ] Source and license plan approved for every published field.
- [ ] Normalization rules for `P`, `B`, `C`, and `U` families reviewed.
- [ ] Evidence and confidence types fit the existing `src/domain/evidence.ts` boundaries.
- [ ] Generic/vehicle-specific copy reviewed by an automotive domain reviewer.
- [ ] Safety language, escalation wording, and no-diagnosis boundary approved.
- [ ] First code set selected from demand and source quality, not guessed volume.
- [ ] Schema tests cover missing sources, unknown fields, duplicate codes, related-code cycles, and retired records.
- [ ] Route generation test proves only `published` reviewed records reach sitemap output.

Until these gates pass, OBD remains `PLANNED` and no OBD route or data file should be added to production.
