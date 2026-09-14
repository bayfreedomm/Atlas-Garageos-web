# Atlas GarageOS V4 — implementation notes

V4 is the first source package that applies the approved visual direction to the actual product shell instead of treating it only as a concept image.

## Applied in code
- Dark automotive header / hero with bright calculator surfaces.
- Strong blue primary action language with orange reserved for comparison/change emphasis.
- New mobile bottom dock: Home / Tools / Compare.
- Home hero rebuilt around an inline SVG vehicle illustration rather than another raster dependency.
- Home categories and tool rows rebuilt visually around compact mobile cards.
- Standard tool shell restyled to match the approved mobile-app-like concept.
- Tire Size Calculator now has a live technical tire anatomy illustration; width/profile/rim inputs change the visual proportions.
- Tire Size Comparison keeps the V3.1 true-scale overlay, nominal front-width view and magnified-difference lens.
- Wheel Offset keeps the live technical cutaway with hub mounting face, suspension/fender direction and current/new geometry.
- Existing Quick Facts / Common Mistake / Important Warning system preserved.
- Old saved theme preference is intentionally isolated under a V4 key so an old dark-mode choice does not make V4 appear unchanged on first load.

## Deliberately not claimed as finished
- Full DE / ES / PT-BR / FR publication.
- Analytics/Search Console/Bing launch integration.
- Every remaining calculator receiving a dedicated 3D/technical scene. The shared V4 shell applies now; dedicated visuals continue tool-by-tool.
