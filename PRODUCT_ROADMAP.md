# Atlas GarageOS Product Roadmap

This roadmap protects the long-term product direction. It is not a promise to build every item immediately and it is not a milestone changelog. New work should strengthen shared foundations, preserve explainability, and earn its complexity through clear user benefit.

## Core Product

Fitment Studio is the flagship experience: a precise, understandable workspace for exploring vehicle setup geometry. My Garage is the shared vehicle-data backbone that lets every Atlas GarageOS tool build on the same vehicle memory.

The core product direction includes:

- Fitment Studio and its explainable comparison engines
- My Garage as the common vehicle and setup backbone
- What Fits? search and recommendation exploration
- Fitment Map across wheel width and offset
- Measure My Car with clearly sourced physical measurements
- Nearest Green geometric alternatives
- A future Fitment Score whose inputs and meaning remain explainable
- Shareable setups and complete builds
- Side, front, and top visualizers that reveal geometry rather than decorate it

## Automotive Tool Platform

Atlas GarageOS can grow into a coherent family of focused tools that share units, vehicles, provenance, formatting, and calculation foundations:

- Tire Size Compare
- Wheel Offset
- Speedometer Error
- PSI/BAR conversion
- MPG/L100km conversion
- Fuel Cost and Road Trip Cost
- EV Charging Cost, EV Range, and Charging Time
- Power-to-Weight
- HP, kW, and Nm conversions
- Gear Ratio
- Car Loan
- Dealer Quote Checker
- True Cost of Ownership

These tools should be added as modular products, not accumulated inside one monolithic calculator.

## My Garage and Ownership

My Garage should evolve from local vehicle memory into the user's durable automotive record:

- Multiple cars with independent active contexts
- Named Daily, Winter, Aggressive, Stock, and user-defined builds
- Fuel log, maintenance log, and expense tracking
- Car Timeline and Vehicle Passport
- Explicit import and export
- Future optional cloud sync without making an account mandatory for local utility

The platform should support the full **Buy → Own → Modify → Maintain → Sell** lifecycle. Data collected in one stage should reduce effort and improve decisions in later stages.

## Data and Intelligence

Future intelligence may combine VIN Decoder, Recall Check, justified OEM fitment data, measurements, calculations, and community knowledge. Every important value should retain provenance and, where meaningful, confidence.

Supported source concepts include:

- `official`
- `userMeasured`
- `calculated`
- `community`
- `estimate`

The system should communicate what is known, what is inferred, and what remains uncertain. OEM or community data should be added only when sourcing, licensing, maintenance, and user value justify it.

## Input Reduction

Product leaps should remove work from the user without hiding uncertainty. Possible future inputs include:

- Tire-sidewall photo reading
- Odometer photo reading
- Fuel receipt capture
- Service invoice capture

Captured values must remain reviewable before they enter durable vehicle records.

## Global Product

Atlas GarageOS is global-first. Localization is a product and architecture concern, not a late translation pass.

- Localized product content and SEO URLs
- Correct `hreflang` relationships
- Language, unit system, and currency as independent preferences
- Global calculation and data foundations with localized presentation
- Market-specific content only where it is accurate and maintainable

## Distribution Engines

Distribution should compound the value of the core product rather than fork its logic:

- Google SEO built on useful, indexable tools and explanations
- Shareable setup URLs that remain separate from canonical SEO routes
- Fitment Badge for portable, explainable results
- Embeddable widget and JavaScript SDK
- Chrome and Edge extensions
- WordPress/WooCommerce and Shopify integrations
- Progressive Web App
- Future native iOS and Android experiences where platform capabilities justify them

Every surface should consume shared engines and versioned contracts instead of reimplementing fitment logic.

## Product Principles

- Modern, premium, fast, and mobile-first
- Simple front end, powerful back end
- Explainable results over opaque conclusions
- User benefit over feature count
- Security-by-design and SEO-by-design
- Modular evolution without unnecessary operating cost
- Psychology, cognition, ownership, trust, and sharing considered as product inputs
- **Voyager principle:** seek meaningful product and technology leaps, not only copies of existing competitors
- **Steve Jobs principle:** product discovery should not be limited to what users explicitly request; design useful experiences people recognize once they see them

These principles guide judgment; they are not rigid constraints. Evidence, safety, clarity, maintainability, and the actual user problem still determine what should be built next.
