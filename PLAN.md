# PLAN — mia-vlc-read-sound

## Context

Home-automation plugin that **plays a sound through VLC** (local file or URL) so other MIA plugins can trigger audio via the Container (`sound-reader`) or the HTTP API (`readSound`).

The plugin already exists (v1.0.0, branch `develop`) but was built **before the MIA agent workflow**. Gaps versus the current template / agents:

- No `PLAN.md`, no Mediator unit tests (coverage far below 95%).
- VLC is spawned **inline** in `Mediator` with incomplete CLI flags (`--intf dummy` + `vlc://quit` only): a window / DOS box can still appear; exit after playback is not guaranteed (`--play-and-exit` missing).
- Front is still “Hello World”; SDK does not expose `readSound`.
- README is a copy of `mia-stream-deck` (wrong name, wrong badges).

**Product goal:** play one sound **transparently** — no VLC window, no extra UI, process **exits when playback ends**. Do **not** expose the full VLC CLI; wrap a **minimal callable class**.

**VLC CLI source:** [VLC command-line help](https://wiki.videolan.org/VLC_command-line_help/) (`vlc -H`). Flags kept for this plugin:

| Flag | Why |
|------|-----|
| `-I dummy` / `--intf dummy` | No GUI interface |
| `--dummy-quiet` | No DOS command box on Windows |
| `--no-video` | Skip video decoding / no video window |
| `--no-osd` / `--no-spu` | No on-screen display / subpictures |
| `--no-interact` | No dialog boxes |
| `--quiet` | Quiet stdout |
| `--play-and-exit` | Exit when the playlist is empty |
| `--no-volume-save` | Do not persist volume in the user VLC profile |
| `--audio-visual=none` | No visualization window |
| media MRL + `vlc://quit` | Play the file/URL then quit |

Binary resolution (class, not Mediator): `VLC_PATH` env, then platform defaults (`vlc.exe` under Program Files on Windows, `cvlc`/`vlc` on PATH elsewhere).

Public class surface (back): `isAvailable()` and `play(sound: string): Promise<void>`. No extra playback options (gain, loop, start-time) in this pass.

## Steps

### a) OpenAPI — ~0.5h

Update `lib/data/Descriptor.json` only for the playback contract; keep scaffold routes (front, descriptor, status, including `getPluginStatus` `404`).

- Keep `operationId` **`readSound`** and path `/mia-vlc-read-sound/api/read-sound`.
- Keep **PUT** (launch a playback) + success **201** (MIA conventions: `put` = create). Fix the empty `application/json` content (no fake schema). Prefer **201 with no body** if the generator allows it; otherwise a minimal acknowledgment object inline (not a one-off component).
- Body: required `sound` (string) — local path or VLC MRL (`file://`, `http://`, …). No long payload in path/query.
- New/updated operation: success + **`default`** Error only. No extra error codes.
- Fill `description` / `summary` so the front and README can describe “play a sound via VLC, headless”.
- Do not add volume/loop/rate fields in this pass.

### b) Back-office — ~2h

cwd = plugin root. `npm run transpile-openapi-back`, then implement.

- Add **`lib/src/utils/VLC.ts`**: executable class wrapping `child_process.spawn`.
  - Resolve the VLC binary (env + defaults).
  - `isAvailable()`: probe without opening a UI (e.g. `--intf dummy --dummy-quiet --quiet --play-and-exit vlc://quit` or equivalent).
  - `play(sound)`: always apply the transparent flag set above; wait until the process exits; reject on non-zero exit / spawn error.
  - No input validation in Mediator (host `checkParameters`); the class may still fail clearly if the binary is missing.
- **`Mediator`**: drop inline `_execute` / spawn. Init checks VLC availability via the class. `readSound` delegates to `play`. Keep front file getters.
- **`Orchestrator`**: keep Container `sound-reader` and `readSound(path)` → Mediator. No extra Server events unless playback failures should be pushed (reuse existing `error` if needed).
- Split: runtime in `lib/src/utils/`; types-only in `lib/src/@types/` if any.
- `npm run lint-back` then `npm run build-back`.

### c) Unit tests — ~2h

Blocking before any front work. Mocha under `test/` with numeric prefixes.

- Tests for `VLC` (spawn mocked): flag set, binary resolution, success / failure / missing binary. Do not require a real VLC install in CI.
- Tests for `Mediator.readSound` and init availability check (VLC mocked). Mediator coverage **≥ 95%** via `npm run unit-tests-local`.
- Keep existing `0_compilation_typescript` and `1_check_descriptor`.
- `npm run build-back` then `npm run unit-tests`; `npm run lint-tests`.

### d) Front SDK — ~0.5h

After tests pass. `npm run transpile-openapi-front`.

- Add `SDK.readSound` mapped to `PUT /mia-vlc-read-sound/api/read-sound` with Bearer token and `sound` in the JSON body.
- Reuse existing `_parseResponse` / auth helpers. Lint SDK (`npm run lint-front`).

### e) Front components — ~1.5h

Minimal operator UI (not Hello World):

- Sound field (path or URL) + play action calling `SDK.readSound`.
- Keep connection / plugin status / error modal flow.
- Component file name = exported component name.
- `npm run lint-front` then `npm run build-front`.

### f) README — ~0.5h

User-facing only (no implementation details):

- Fix title, GitHub/Sonar/Snyk badges for **mia-vlc-read-sound** (replace stream-deck leftovers).
- Purpose: play a sound on the box with VLC, no window.
- Prerequisite: VLC installed on the host (optional `VLC_PATH` if not on PATH).
- How to play from the plugin screen; mention that other plugins can request playback.
- Link to OpenAPI Descriptor.

### g) Review — ~1h

Full-stack pass: Descriptor vs Mediator vs SDK vs UI, VLC flags vs product goal, tests/coverage, README accuracy, leftover template/stream-deck strings.

## Step status
- [x] a) OpenAPI
- [x] b) Back-office
- [x] c) Unit tests
- [ ] d) Front SDK
- [ ] e) Front components
- [ ] f) README
- [ ] g) Review
