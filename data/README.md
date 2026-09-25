# Atlas GarageOS data vault

This directory is the durable source-data boundary. It is intentionally separate from
`src/data`, which contains small application-ready projections bundled into the static site.

## Rules

- Raw provider responses are immutable. Never edit or replace an existing snapshot.
- Historical observations are append-only. A correction is a new reviewed revision that
  identifies the record it supersedes; it is not an in-place rewrite.
- Every vehicle fact needs a stable record ID, schema version, market/generation scope,
  source reference, observation time and confidence state.
- Generated application data may be rebuilt from this vault. The vault must never depend on
  generated files in `dist`.
- Secrets, private user data and unlicensed third-party datasets do not belong in Git.

## Storage path as the datasets grow

The repository remains the home for schemas, migrations, small reviewed seed releases and
release manifests. At production scale, Cloudflare D1 should hold queryable current/revision
records and Cloudflare R2 should hold content-addressed raw source snapshots and large release
artifacts. Scheduled ingestion should validate into a staging table, publish a new revision in
one transaction, and only then refresh the static application projection.

This structure prevents a later move to D1/R2 from changing the domain contract or silently
destroying the historical series.
