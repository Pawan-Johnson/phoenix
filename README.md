# Phoenix FASER event display

A browser-based 3D event display for the FASER experiment, built on the
[HSF Phoenix framework](https://github.com/HSF/phoenix). This branch brings the
FASER implementation from `joshmcfayden/phoenix` onto modern Phoenix, with its
detector geometry, real and example events, tracks, tracker hits, calorimeter
clusters, and scintillator hits.

The maintained FASER code in this repository is on **`faser-dev`**. It incorporates
upstream **`main` at `c7705873` (9 October 2026)**. Upstream uses `main` as its
current default branch; the original FASER fork uses `master`.

## Contents

- [Requirements and dependencies](#requirements-and-dependencies)
- [Install from a fresh clone](#install-from-a-fresh-clone)
- [Run the display](#run-the-display)
- [Load your own events](#load-your-own-events)
- [Detector geometry and saved settings](#detector-geometry-and-saved-settings)
- [Build for hosting](#build-for-hosting)
- [Development and tests](#development-and-tests)
- [Update your checkout](#update-your-checkout)
- [Troubleshooting](#troubleshooting)
- [Repository layout](#repository-layout)

## Requirements and dependencies

### Tools you install yourself

| Requirement     | Version / purpose                                                                                                                    |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Git             | Clone the repository and update the branch.                                                                                          |
| Node.js         | **Node 22, version 22.12 or later within the 22.x line, is the recommended baseline for this branch.** Validation used Node 22.23.1. |
| npm             | Comes with Node.js; used to install Corepack if needed.                                                                              |
| Corepack        | Selects the package manager declared by the project.                                                                                 |
| Yarn            | **3.3.1**, pinned in `package.json` and bundled in `.yarn/releases/`.                                                                |
| Browser         | A browser with WebGL enabled. The detector is rendered on your computer.                                                             |
| Internet access | Needed for the first dependency installation. Production builds also retrieve Google Fonts.                                          |

Angular's installed packages declare support for Node `^20.19.0`, `^22.12.0`,
or `>=24.0.0`. Use the Node 22 baseline above to reproduce this branch's validated
setup. Node 18 and older are unsuitable for this Angular version.

Install Node.js from [the official Node.js download page](https://nodejs.org/en/download)
or through your existing Node version manager. If you already use `nvm`:

```sh
nvm install 22
nvm use 22
node --version
npm --version
```

### Dependencies installed by Yarn

You do **not** need to install Angular, TypeScript, Three.js, or the Phoenix
packages globally. Run the installation command from the repository root; Yarn
installs and links all workspaces together using `yarn.lock`.

| Dependency             | Version declared in this branch | Purpose                                                                                                         |
| ---------------------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Phoenix packages       | 4.2.3                           | Event-display library, Angular app, and shared UI components.                                                   |
| Angular                | 20.3.x                          | Application framework.                                                                                          |
| Angular Material / CDK | 20.2.x                          | Menus, dialogs, and controls.                                                                                   |
| TypeScript             | 5.8.x                           | Builds the TypeScript code.                                                                                     |
| Three.js               | **0.178.x at runtime**          | 3D rendering. The root `resolutions` entry pins this version, overriding package-level `~0.184.0` declarations. |
| `@types/three`         | 0.184.x                         | Three.js type declarations, as specified by upstream.                                                           |
| RxJS                   | 7.8.x                           | Application events and reactive state.                                                                          |
| JSROOT                 | 7.11.x                          | ROOT-format support used elsewhere in Phoenix.                                                                  |
| JSZip                  | 3.10.x                          | ZIP event and geometry support.                                                                                 |
| Jest / ts-jest         | 29.x                            | Unit and regression tests.                                                                                      |
| Lerna                  | 9.x                             | Runs tasks across the workspaces.                                                                               |
| ESLint / Prettier      | 9.x / 3.x                       | Code checks and formatting.                                                                                     |

The table describes manifest constraints and the root override; **`yarn.lock`
is the authority for exact installed versions**. Keep it unchanged for a
reproducible installation. ROOT, CERN software releases, and a Python runtime
are not required to view the bundled FASER JSON events in the browser.

### Optional system packages for native dependency builds

Most installations use prebuilt native packages. If installation falls back to
compiling packages such as `canvas`, `sharp`, or `lmdb`, you may need a C/C++
compiler, Python 3, and the libraries named in the failure message. Install these
only if your platform needs them.

On Ubuntu / Debian, a useful build setup is:

```sh
sudo apt-get update
sudo apt-get install -y build-essential python3 pkg-config \
  libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
```

On macOS, install the Xcode command-line tools. If a canvas build needs its
native libraries, install them using your existing Homebrew installation:

```sh
xcode-select --install
brew install pkg-config cairo pango libpng jpeg giflib librsvg pixman
```

On Windows, WSL2 provides a Linux setup for the instructions above. Native
Windows source builds may require Python 3 and Visual Studio C++ build tools.
These platform-specific installation paths have not all been tested for this
FASER migration.

## Install from a fresh clone

```sh
git clone --branch faser-dev https://github.com/Pawan-Johnson/phoenix.git
cd phoenix

# Check the installed Node version first.
node --version

# Install Corepack only if it is not already available.
# This command may need administrator permissions, depending on your Node setup.
npm install --global corepack
corepack enable

# From this directory, Yarn should report 3.3.1.
yarn --version

# Install the exact dependency set in the lockfile.
yarn install --immutable
```

If `corepack` is already installed, skip `npm install --global corepack`.
Corepack may ask to download the selected Yarn version on its first invocation.

The installation also generates version information, patches JSROOT as required
by this repository, and builds `phoenix-event-display`. Run it from the directory
containing the root `package.json`, `.yarnrc.yml`, and `yarn.lock`.

Use Yarn for dependency installation. Installing with npm or a global Yarn 1
installation can create a different dependency tree or fail to link the local
Phoenix packages correctly.

## Run the display

From the repository root:

```sh
yarn start
```

Wait for the app's development server to finish compiling, then open:

**[http://localhost:4200/faser](http://localhost:4200/faser)**

Alternatively, open [the home page](http://localhost:4200) and select **FASER**.
Keep the terminal running while using the display. Press `Ctrl+C` to stop it.

The startup command builds the event-display library and starts the library
watcher alongside the Angular development server. The first startup can take
longer than later startups.

The FASER page automatically loads:

- Calorimeter, preshower, timing station, veto station, tracker stations, and magnets.
- The bundled real event `faser_realevent3.json`, whose first event is named `TI12`.
- Saved detector colours, visibility, opacity, and camera settings.

Use the detector menu to show or hide individual detector parts. Use the event
selector to switch between events in the loaded file. The toolbar provides
zoom, view presets, and import/export controls; Phoenix's
[user guide](guides/users.md) explains the common controls.

### Use a different port

If port 4200 is occupied, build the library and start the app on another port:

```sh
yarn workspace phoenix-event-display tsc:build
yarn workspace phoenix-ng start --port 4201
```

Open `http://localhost:4201/faser`. To watch library changes too, run
`yarn workspace phoenix-event-display start` in a second terminal.

## Load your own events

Use the toolbar's event import controls to load a local **JSON** file or a **ZIP**
archive containing Phoenix JSON event files. A file can contain several named
events; select the event to display using the event selector.

Bundled FASER samples are under:

```text
packages/phoenix-ng/projects/phoenix-app/src/assets/files/event_data/
```

They include `faser_realevent1.json` through `faser_realevent3.json`, and
`faser_testevent1.json` through `faser_testevent6.json`.

### JSON format

The top-level object maps event names to event data. Within an event, each
physics-object type maps collection names to arrays of objects. A minimal FASER
example is:

```json
{
  "My FASER event": {
    "run number": 123,
    "event number": 456,
    "Tracks": {
      "Tracks": [
        {
          "color": "0x0000ff",
          "pos": [
            [-1000, 0, 0],
            [0, 20, 0],
            [1000, 40, 0]
          ]
        }
      ]
    },
    "Hits": {
      "Tracker hits": [
        [
          [-1000, 0, 0],
          [0, 20, 0],
          [1000, 40, 0]
        ]
      ]
    },
    "LargeScintHits": {
      "Veto": [{ "x": 2700, "y": 40, "z": 0, "energy": 1100 }]
    },
    "TimingScintHits": {},
    "CaloClusters": {},
    "Vertices": {}
  }
}
```

This is a format example, not a calibrated detector event. Coordinates must
match the detector geometry's frame and units; the inherited samples use
millimetre-scale coordinates and the detector extends along the **x axis**.
Do not interchange the x and z axes when exporting new data.

Tracks with at least two supplied positions can be drawn. Hits retain the
legacy FASER nested position-array format shown above. FASER calorimeter and
scintillator objects use `x`, `y`, `z`, and `energy`. Calorimeter samples with
angular coordinates instead fall back to the standard Phoenix cluster renderer.

The inherited scintillator renderer scales transverse size below an energy
threshold of **1000**, and colours hits green at or above that threshold. The
Cartesian calorimeter renderer uses the same threshold. These numbers retain
the original display's behaviour; verify energy units and thresholds against
your event producer before interpreting them physically.

### Change the default event

Edit `defaultEventFile` in:

```text
packages/phoenix-ng/projects/phoenix-app/src/app/sections/faser/faser.component.ts
```

For example:

```ts
defaultEventFile: {
  eventFile: 'assets/files/event_data/faser_testevent6.json',
  eventType: 'json',
},
```

Place a new bundled event file under the app's `src/assets/files/event_data/`
directory, then use its `assets/...` URL here. These URLs are relative to the
application's served assets, not absolute paths on your filesystem.

## Detector geometry and saved settings

Geometry lives in:

```text
packages/phoenix-ng/projects/phoenix-app/src/assets/geometry/FASER/
```

The component currently loads these six OBJ files:

| Detector part    | File                      |
| ---------------- | ------------------------- |
| Calorimeter      | `Calorimeter_v4.obj`      |
| Preshower        | `PreShowerStation_v3.obj` |
| Timing station   | `TimingStation_v8.obj`    |
| Veto station     | `VetoStation_v3.obj`      |
| Tracker stations | `TrackerStations_v6.obj`  |
| Magnets          | `Magnets_v5.obj`          |

The same directory contains older geometry variants retained from the fork.
To change which versions load, edit the `geometries` array in
`faser.component.ts`. Preserve the collection names if you want the existing
saved detector settings to continue matching them.

Default settings are imported from:

```text
packages/phoenix-ng/projects/phoenix-app/src/assets/files/config/phoenix-config-faser.json
```

The page applies these settings through the initialized display's state manager
after the detector and event resources finish loading. Camera presets define
both camera position and target. If the view starts too close, zoom out or
choose a preset; edit the saved camera position to change the startup view.

## Build for hosting

Build the library first, then the production application:

```sh
yarn workspace phoenix-event-display tsc:build
yarn workspace phoenix-ng build:app
```

The resulting site is written to:

```text
packages/phoenix-ng/dist/phoenix-app/
```

Serve the **whole directory**, including its assets, through an HTTP server.
Do not open `index.html` directly as a `file://` URL. The host must return
`index.html` for application routes such as `/faser`, while serving asset URLs
normally. Otherwise, opening or refreshing `/faser` directly returns a 404.

For a site using relative asset paths, the repository also provides:

```sh
yarn workspace phoenix-event-display tsc:build
yarn deploy:web
```

This writes to `packages/phoenix-ng/docs/` and creates `404.html`. It builds the
files locally; it does not upload them to a hosting service. Configure your
host's route fallback and base path for the intended deployment location.

The checked-in top-level `docs/` contains upstream-generated website files.
Use your newly built output to deploy the updated FASER code.

## Development and tests

### Editing application and library code

Angular resolves `phoenix-ui-components` directly from its TypeScript source.
It resolves `phoenix-event-display` through the workspace link to the library's
**built `dist` output**.

After changing the event-display library:

```sh
yarn workspace phoenix-event-display tsc:build
```

Then restart the Angular server and refresh the browser. A fresh `yarn start`
builds the library before starting the app. The Angular server excludes this
library from dependency pre-bundling to avoid stale cached copies.

### FASER regression checks

Run these commands from the repository root:

```sh
# Compile the core event-display library.
yarn workspace phoenix-event-display tsc:build

# Test FASER samples, the inherited loader, and default JSON loader selection.
yarn workspace phoenix-event-display test --runInBand \
  --testPathPattern='(faser-loader|phoenix-loader|url-options-manager)'

# Test FASER page initialization and loading callbacks.
yarn workspace phoenix-ng test --runInBand \
  --testPathPattern=faser.component

# Verify the production app build.
yarn workspace phoenix-ng build:app
```

The migration was validated with **37 tests across those core suites and three
FASER page tests**, a production build, and a browser check of the real event
without rendering errors. This does not imply that the entire upstream test
suite has been run for the migration.

For broader repository checks:

```sh
yarn lint
yarn test:ci
```

These run checks across the upstream codebase as well as FASER. Formatting or
other failures elsewhere may need separate investigation.

## Update your checkout

To get the latest published FASER changes:

```sh
git switch faser-dev
git pull --ff-only origin faser-dev
yarn install --immutable
yarn start
```

Commit or otherwise save local edits before updating. If `--ff-only` fails,
your local branch and remote have diverged; inspect their changes before merging
or rebasing.

To incorporate new upstream Phoenix changes into a development checkout:

```sh
# Add the upstream remote once, if it does not already exist.
git remote add upstream https://github.com/HSF/phoenix.git

git fetch upstream
git switch faser-dev
git merge upstream/main
```

Resolve any conflicts, install the resulting dependencies, and rerun the FASER
regression checks and production build before publishing the update. If
`upstream` already exists, inspect it with `git remote -v` and skip the add step.
The historical `josn/master` branch is the source of the old FASER code; it is
not the current maintained upstream framework.

## Troubleshooting

| Symptom                                                        | What to check or do                                                                                                                                                                                        |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `yarn` or `corepack` is not found                              | Install/enable Corepack using the setup steps, open a new terminal if needed, and check your PATH.                                                                                                         |
| Yarn reports a version other than 3.3.1                        | Run it from this repository's root; keep `.yarnrc.yml` and the bundled `.yarn/releases/` files intact.                                                                                                     |
| Node engine/version error                                      | Switch to Node 22.12+ within the Node 22 line and reinstall using Yarn.                                                                                                                                    |
| `--immutable` reports a lockfile change                        | Check that you have the matching manifests and `yarn.lock` from this branch. Do not remove the lockfile to work around the error. Intentional dependency updates require reviewing a regenerated lockfile. |
| Network or certificate errors during install                   | Check connectivity, your proxy, and trusted CA configuration. Configure the network correctly instead of disabling TLS verification.                                                                       |
| A native module fails to build                                 | Read its build log; install the compiler, Python 3, and system libraries it names. See the optional system packages above.                                                                                 |
| A Python detection error from `node-gyp`                       | Configure the install process to use Python 3, for example `npm_config_python=/usr/bin/python3 yarn install --immutable` on Linux. Do not symlink Python 2 over system Python.                             |
| Port 4200 is already in use                                    | Stop the other server or use the alternate-port commands above.                                                                                                                                            |
| Library edits do not appear                                    | Rebuild `phoenix-event-display`, restart the Angular server, and refresh the browser. Check that the pre-bundling exclusion remains in `angular.json`.                                                     |
| Blank display or a loading screen that never finishes          | Check the browser console and Network panel for missing geometry/event files or failed WebGL initialization. Confirm the asset URLs and serve the app over HTTP.                                           |
| Imported JSON fails to parse                                   | Remove trailing commas, use double-quoted keys/strings, and follow the named-event structure shown above.                                                                                                  |
| `Computed radius is NaN` in the browser console                | Check that positions contain finite numbers and match the expected hit format. Confirm JSON loading retains `FaserLoader`; the URL loader has a regression test for this.                                  |
| Production build fails retrieving Google Fonts                 | The production builder inlines external fonts. Allow access to `fonts.googleapis.com` and `fonts.gstatic.com`, or deliberately configure local fonts for an offline deployment.                            |
| `CommonJS or AMD dependencies can cause optimization bailouts` | These upstream dependency warnings occurred in the validated production build. Check the final exit status and distinguish warnings from build errors.                                                     |
| A deployed `/faser` route returns 404                          | Configure the server's SPA fallback to `index.html` and check the deployment's base path.                                                                                                                  |

If Angular's cache is still stale after rebuilding and restarting, stop the
server, clear its generated cache, and start it again:

```sh
# Removes only Angular's generated local cache.
rm -rf packages/phoenix-ng/.angular/cache
yarn start
```

## Repository layout

```text
phoenix/
├── package.json                 Root scripts, workspaces, and dependency overrides
├── yarn.lock                    Exact dependency resolutions
├── .yarnrc.yml                  Yarn configuration
├── packages/
│   ├── phoenix-event-display/
│   │   └── src/
│   │       ├── loaders/faser-loader.ts
│   │       ├── loaders/objects/faser-objects.ts
│   │       └── managers/url-options-manager.ts
│   └── phoenix-ng/
│       ├── projects/phoenix-app/src/
│       │   ├── app/sections/faser/       FASER page
│       │   └── assets/
│       │       ├── geometry/FASER/      Detector OBJ files
│       │       └── files/               Events and saved settings
│       └── projects/phoenix-ui-components/
└── guides/                      User and developer documentation
```

`FaserLoader` extends the current `PhoenixLoader` object-type registry, retaining
FASER-specific renderers while sharing current collection menus, cuts, labels,
and metadata handling. Default JSON loading preserves this specialized loader.

## Further documentation and licence

- [Phoenix user guide](guides/users.md)
- [Phoenix developer guide](guides/developers/README.md)
- [FASER implementation notes](guides/developers/faser.md)
- [Core event-display package](packages/phoenix-event-display/README.md)
- [Angular application](packages/phoenix-ng/README.md)
- [Contributing](CONTRIBUTING.md)
- [Upstream Phoenix](https://github.com/HSF/phoenix)

Phoenix is an HSF-supported, experiment-independent event-display framework.
This repository retains the [Apache 2.0 licence](LICENSE).
