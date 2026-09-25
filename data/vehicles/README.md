# Vehicle fitment records

The current 30-record reviewed seed remains in `src/data/vehicle-fitment.ts` while the product
is static. New bulk data must enter through versioned JSONL release files validated against
`../schemas/vehicle-fitment-record.schema.json`; do not add tens of thousands of hand-written
TypeScript objects.

Recommended partitioning is `market/make/release.jsonl`. A record keeps its stable `recordId`.
Corrections create a new `revisionId` with `supersedesRevisionId`; the earlier revision remains
available for audit. A release manifest records row count, SHA-256 digest, schema version and
publication time.

Before a record becomes public, validate the year/generation scope, tire and wheel notation,
bolt pattern consistency, source provenance, confidence and any torque-specific evidence.
Vehicle relationships are reference evidence, never an automatic safety or clearance verdict.
