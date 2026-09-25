# Fuel-price observations

`src/data/fuel-prices.json` is the replaceable latest snapshot used by the site.
`src/data/fuel-price-history.json` is the append-only public history. The updater must never
replace an existing date/week or trim old observations automatically.

At production scale, persist each observation in D1 with a unique key such as
`(market, product_id, observed_period, provider_id)`. Store the raw provider response in R2 by
SHA-256 digest and reference that digest from the D1 row. Corrections are later revisions linked
to the original observation; they do not erase it. Backups and exports are release artifacts,
not the primary database.

No scheduled fetch may write history after a failed/stale response. Provider terms, units,
geographic scope and whether a value is an average or monitored sample must travel with data.
