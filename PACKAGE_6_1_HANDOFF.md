# Package 6.1 — Visual expansion and persistent measurements

Source of truth: the Package 6.0 FULL ZIP extracted directly to a fresh workspace. No older Atlas ZIP, repository or Codex project was used.

## Visible changes

- Existing Tire Comparison, Wheel Offset and PCD WebGL scenes now show their key measurements in a high-contrast panel inside the viewer throughout rotation. The front-view guide lines may still hide when oblique projection would make their physical span misleading, but the numbers do not disappear.
- Tire Size Calculator: one live parametric tire. Speedometer: two live tires plus indicated/theoretical actual speed. Gear Ratio: proportional current/new tire diameters. Compression Ratio: a bore/stroke/clearance-volume section. EV Charging: a proportional start/end charge-window battery. Each is available in EN/DE/ES and retains the static result as the calculation source of truth.
- Fitment Studio: a new two-view 3D workspace switches between tires and wheel width/ET at one fixed mounting plane. It updates with the setup form, including imported/shared setups, while keeping real clearance separate.
- Guided next-decision and related-tool cards now read visually as clickable controls, with explicit arrow buttons, stronger contrast and keyboard focus.

These scenes use the existing lazy Three.js renderer and Canvas fallback. No dependency, canonical calculation, fuel history/data, Wrangler/Cloudflare setting or route was changed. The 3D illustrations do not claim vehicle approval, charging-curve prediction or dynamic engine behavior.

Not every registered tool has a new 3D scene: fuel prices, pure unit converters and vehicle lookup retain their existing task-specific visual/data treatments. Their numbers do not have a defensible spatial 3D mapping, so a decorative scene was not invented to satisfy a count.

## Checks

Frozen-lockfile offline install passed. Unit tests: 230/230 passed. Astro typecheck: 300 files, zero errors/warnings/hints. Production build: 230 pages; the existing lazy Three.js chunk-size advisory remains. Live browser review covered Tire Comparison rotation and persistent HUD, new Tire Size, Gear Ratio, Compression and EV scenes, Fitment tire/wheel switching, and 390px Fitment layout. Remaining external checks: physical-device touch/pinch, forced WebGL context loss, WebKit/Firefox and deployed performance.
