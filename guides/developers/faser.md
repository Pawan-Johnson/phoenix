# FASER event display

The FASER display from `joshmcfayden/phoenix` is ported to current HSF Phoenix
(`main`, commit `c7705873`, 9 October 2026). Upstream now calls its default branch
`main` rather than `master`.

## Run locally

Use Node.js 22.12 or newer (Node 22 LTS is suitable) and the repository's Yarn 3:

```sh
yarn install --immutable
yarn start
```

Open `http://localhost:4200/faser`, or choose FASER from the home page.
The display loads all six detector geometry files and `faser_realevent3.json`.
Use the import menu to load the other bundled FASER JSON event files or your own
Phoenix-format events. The event file is a JSON object keyed by event name.

## Implementation

`FaserLoader` extends `PhoenixLoader` using the current object-type registry.
It retains FASER track, hit, calorimeter, vertex, and scintillator rendering while
using the current collection menus, cuts, labels, and event metadata handling.
Scintillator energy below 1000 scales the transverse size; energy at or above
1000 displays green. These thresholds and the detector OBJ files are inherited
from the original display, not a new detector calibration.

The component registers all detector loads before applying the saved detector
settings through the initialized display's state manager. Camera presets supply
both a position and a target as required by current Phoenix.

## Validate changes

```sh
yarn workspace phoenix-event-display tsc:build
yarn workspace phoenix-event-display test --runInBand --testPathPattern=faser-loader
yarn workspace phoenix-ng test --runInBand --testPathPattern=faser.component
yarn workspace phoenix-ng build:app
```
