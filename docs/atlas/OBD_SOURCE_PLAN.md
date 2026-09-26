# Atlas GarageOS — OBD/DTC Source and Permission Plan

Status: `PARTIAL` — source authority identified; bulk-content redistribution permission is not yet approved, 2026-09-26.

This is a product data gate, not legal advice. Atlas must retain the exact license or permission that applies to every imported field and must not infer redistribution rights from the ability to view or purchase a source.

## Confirmed authority chain

1. SAE J2012 defines the standardized DTC framework. SAE's current J2012 Digital Annex is the maintained spreadsheet containing standardized DTCs and descriptors and is updated several times per year.
   - Catalogue: <https://saemobilus.sae.org/standards/j2012da_202403-digital-annex-diagnostic-trouble-code-definitions-failure-type-byte-definitions>
   - Current revision observed during review: `J2012DA_202607`, published 2026-07-29.
2. ISO 15031-6:2015 defines the DTC rules/format and explicitly points to SAE J2012-DA for the standardized codes and descriptors.
   - Catalogue: <https://www.iso.org/standard/66369.html>
3. U.S. regulations establish operational and safety context, including the distinction between pending, confirmed/MIL-on and permanent codes and the warning that a stored code does not by itself positively identify the source of a fault.
   - Current eCFR Title 40: <https://www.ecfr.gov/current/title-40/chapter-I/subchapter-C/>
   - OBD test report language: <https://www.ecfr.gov/current/title-40/chapter-I/subchapter-U/part-85/subpart-W/section-85.2223>
   - Light-duty OBD requirements: <https://www.ecfr.gov/current/title-40/chapter-I/subchapter-U/part-86/subpart-S/section-86.1806-17>
4. California Air Resources Board regulations are a primary regulatory source for OBD requirements but do not replace the maintained J2012-DA code list.
   - CARB OBD regulatory documents: <https://ww3.arb.ca.gov/regact/obdii/obdii.htm>

## Permission decision

- `BLOCKED` — Do not bulk-import SAE/ISO descriptors until Atlas holds a license or written permission that explicitly covers storage, transformation, website display, translations, and public redistribution.
- `ACCEPTABLE WITH FIELD REVIEW` — U.S. federal regulatory text can support original Atlas explanations of regulatory state and diagnostic limitations. Section 105 of U.S. copyright law generally excludes U.S. Government works from copyright protection, but third-party material incorporated by reference remains separate and must not be copied through the regulation.
- `REJECTED / SUPERSEDED` — Scraping competitor code libraries, copying search snippets, importing an unlicensed GitHub list, or treating model memory as a source.
- `REQUIRES SEPARATE PERMISSION` — Manufacturer service information, TSBs, wiring diagrams, repair procedures and exact vehicle-specific claims.

## Scale without thin pages

- Foundation batch: validate the schema and editorial workflow against 50 candidate codes. Candidates are not automatically published records.
- First public target: 250 reviewed generic pages if and only if the license, source, automotive-review and safety-copy gates pass per record.
- Expansion target: 1,000+ only after Search Console demand and review throughput prove the cluster is useful. No artificial ceiling exists in the domain model.
- Never generate `code × vehicle × year × language` combinations without a unique vehicle-specific evidence bundle.

## Per-record provenance requirements

Every production record must retain source type, publisher, title, durable locator, exact field scope, retrieval date, reuse-permission state, permission locator, Atlas review note, automotive review date, confidence and lifecycle status. `citation-only`, `unknown`, or `prohibited` evidence does not satisfy the publication gate.

## Procurement checklist

- [ ] Ask SAE for a written web-publication/redistribution and translation license for J2012-DA fields.
- [ ] Record licensed fields, revision cadence, update rights, attribution, territories, languages and termination obligations.
- [ ] Select an automotive domain reviewer and record the review protocol.
- [ ] Approve safe wording for pending/confirmed/permanent codes, MIL behavior, urgency and “code is not a failed-part verdict.”
- [ ] Select the first 250 candidates from demand plus source coverage; do not choose by page volume alone.
- [ ] Create production data only after the above gates are recorded as complete.
