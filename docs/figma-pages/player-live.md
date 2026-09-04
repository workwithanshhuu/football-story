# Player Live View

Route: `/player`  
Frame: `390 x 844`  
Traceability: `FR-4.5-01`, `FR-4.5-07`, `FR-4.7-01`

## Layout

Use the pitch logger composition, but make it read-only:

- Live score and match clock remain prominent.
- Formation pitch and lineup remain visible.
- Event feed shows live actions with timestamps.
- Sync status is visible.
- Hide logger action buttons, undo, roster editing, and end-match controls.
- Add a subtle `LIVE VIEW` label beneath the header.

Offline state may show stale-data timestamp but never exposes editing controls.
