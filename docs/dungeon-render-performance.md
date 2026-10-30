# Dungeon renderer and inventory — 0.8.88

Stone dungeon walls now write packed RGBA blocks into one pixel buffer instead of issuing tens of thousands of tiny fillRect calls and CSS color changes. A bounded 20-view cache preserves recent positions and orientations. Opening a chest, a state change, a different floor or newly loaded textures changes the cache key. Removed the half-second expiration that rebuilt stationary views. Tree-fort rendering is unchanged.

Isolated Chrome 1280×800 benchmark: previous renderer approximately 30–100 ms per rebuilt view; new renderer approximately 15–18 ms for warmed uncached directions and 0–0.1 ms on revisits. Initial module/JIT warmup remains slower (44–76 ms). These are desktop browser measurements, not physical tablet measurements.

Landscape inventory keeps gear, a fifteen-cell bag page, item details and stats in one viewport. Unlimited bag capacity is unchanged. Short ordinary dialogs size to content; only overflowing panels use viewport pages. Tested confirmation cancellation preserves the selected adventurer save.
