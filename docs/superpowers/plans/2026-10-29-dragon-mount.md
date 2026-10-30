# Dragon mount and region art implementation

Requested: purchase greeting with squeal; homeworld gate flight; 100 fire damage every third mounted battle round; capture on defeat; rescue at floor 10 of Firedrak Mountain from level-25 Drake, with imps and fire elementals; outside-dungeon defense controls retaining the hero position. Rich region maps remain a release gate.

1. Add dragon state helpers and failing behavioral tests for purchase, flight, round support, capture, rescue, separate outside battle and save restoration.
2. Integrate engine hooks without changing normal mount or alien access rules. Firedrak is a dedicated ten-floor special dungeon at a visible homeworld location.
3. Add purchase greeting and outside defense panels, sound, mounted sprite and rescue objective.
4. Validate save/load, victory and loss, dungeon exit/reentry, all movement controls and no dragon inside corridors.
5. Audit and redraw all four region map styles; browser-check each playable region before APK packaging.
6. Deploy verified web changes. Build a new APK only after the pending correction list is implemented.
