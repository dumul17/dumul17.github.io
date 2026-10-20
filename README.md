# Dumul's Observatory

Interactive personal site for **dumul17** --- modder, composer, and the
three-person Indonesian alternative rock project **DUMUL**.

Live: [dumul17.github.io](https://dumul17.github.io/)

------------------------------------------------------------------------

## What's here

| Page | HTML | Styles | Scripts | Description |
|---|---|---|---|---|
| **Observatory** | `index.html` | `index.css` | `dumul-js/obs/js/01-core.js` … `11-live-count.js`, plus the data files `sky-data.js`, `texts.js` and the language layer `i18n.js`, `i18n-sky.js`, `i18n-texts.js` (all in `dumul-js/obs/`) | Full-screen interactive sky: 4 seasonal sectors, 23 constellations, Gargantua, 16 stellar SFX, music HUD, observation tools, wormhole gates, drone relay, EN/ID language switch, easter eggs, and the DUMUL portal |
| **DUMUL** | `dumul.html` | `dumul.css` | `dumul.js`, `dumul-app.js` | DUMUL album page with five selectable transmissions, synced lyrics, track notes, spectrum/seek UI, and seamless Gargantua handoff |
| **PWA / offline** | `manifest.json`, `icons/` | -- | `service-worker.js` | Installable app, offline shell, and opt-in offline audio archive |

The Observatory is the entry point. The **DUMUL** portal sits around
Orion's belt, while **Gargantua** can also swallow the page into the
DUMUL transition.

------------------------------------------------------------------------

## Observatory features

-   Full-screen custom canvas sky with gravitational lensing around
    **Gargantua**
-   **Sector Overview → Sector Gate:** the sky is split into four
    seasonal sectors. Tap a sector from the overview to enter it; the
    **Sector Scan** HUD (minimap + draw/cull counters) shows what is
    actually being rendered.

    | Sector | Constellations |
    |---|---|
    | **Winter** — *The Pantheon of Radiant Heroes* | Orion, Taurus, Canis Major, Pleiades, Gemini, Auriga, Canis Minor |
    | **Spring** — *The Guardians of the Cosmic Balance* | Virgo, Boötes, Ursa Major, Leo, Hydra |
    | **Summer** — *The Assembly of Celestial Beasts* | Scorpius, Sagittarius, Lyra, Cygnus, Ophiuchus, Aquila |
    | **Autumn** — *The Royal Court of the Fallen Dynasty* | Cassiopeia, Perseus, Aries, Pegasus, Pisces |

-   23 interactive constellations in total, drawn on a custom canvas sky
-   **16 stellar trigger sounds:** Winter — `Betelgeuse`, `Rigel`,
    `Aldebaran`, `Pleione`, `Sirius`, `Capella`, `Pollux`, `Procyon`;
    Spring — `Spica`, `Arcturus`, `Alioth`, `Regulus`; Summer — `Vega`,
    `Deneb`, `Altair`; Autumn — `Alpheratz`
-   **Spatial signal (muffle / relay):** an SFX that plays in one sector
    is *muffled* (low-pass + attenuation) when you hear it from somewhere
    else. It is clear only when **both** are summoned: the **overview
    Gargantua** (summoned by default, saved in `dumul_bh_home`) **and** the
    Gargantua relay in the sector the sound comes from. If only one of the
    two is summoned the signal stays muffled and a toast says which side
    is missing.
-   Tap/hover/focus feedback, supernova flashes, star chimes,
    constellation highlighting, and a **Last Signal** display
-   **Music Transmission** HUD with 16 stellar signals (grouped per
    sector), `constellation` BGM, `collapsars` BGM, volume slider, shuffle /
    repeat buttons, a Gargantua Spectrum visualizer toggle, observed-state
    tracking, signal counter, and live spectrum indicators
-   **Observation Mode** and **Radio Silence**
-   **BGM-reactive sky** (visual only, follows whichever BGM is playing):
    `constellation` makes the constellation lines and stars "breathe"
    slowly under a cold-blue tint; `collapsars` brightens and speeds up
    Gargantua's disk, pulls nearby constellations toward it with a faint
    shiver, and shifts the sky tint to violet/dark red. Switching BGM
    cross-fades the tint over ~4 seconds.
-   While a BGM plays: more frequent (capped) shooting stars, a soft glow
    on the clickable SFX stars, a star-dust trail behind the cursor /
    touch colored by the active BGM, and **BGM ducking** (BGM drops to
    ~28% while a star SFX plays, then rises back after it ends)
-   **Constellation Lock (minigame):** the 16 stellar SFX start locked.
    Open Observation Mode → Constellation Camera, focus a constellation and
    tap its stars in order (a yellow ring marks the next one; the SFX star is
    always the last step). Only the final tap makes sound: it unlocks the
    constellation, plays its SFX and shows an *ALIGNMENT COMPLETE* popup.
    Orion unlocks **Betelgeuse + Rigel**; every other constellation unlocks
    its single star. While locked, constellation lines are hidden and the
    sky shows a pulse on each star plus an occasional light dot travelling in
    alignment order (off on `IS_POTATO` / reduced motion, which keep one static
    ring on the first star). Lines draw in as the unlock reward. **Pleiades**
    has no lines, so it unlocks with a cross-sector chain in Camera mode:
    Orion's belt (Alnitak → Alnilam → Mintaka), then switch focus to Taurus and
    tap Aldebaran. Locked SFX rows in the Music HUD show a padlock and are
    disabled; the two BGM loops are never locked. The Konami code unlocks
    everything (without touching the Constellation Log).
-   **Constellation Camera** with `1×–3×` zoom, pinch/wheel control, and
    two-finger sky rotation
-   Mobile sky pan and rotation interactions
-   **Bilingual (EN / ID):** the language is taken from the saved choice
    (`dumul_lang`), then the browser language, then English. The
    **Language** chip in the Settings panel switches it (the page reloads
    so every canvas is redrawn). Telescope messages, terminal log,
    camera info cards, signal fragments and all UI labels are translated;
    star / constellation / track names and numbers stay as they are.
    Anything without a translation falls back to English.
-   **Sector Gate wormhole:** jumping through a Sector Gate, or holding the
    mini Gargantua (~0.6 s), plays a warp-tunnel transition (blue-violet-
    magenta streaks around a dark core) and muffles the audio while you are
    inside. It is plain Canvas 2D (no WebGL, no external textures) and
    switches itself off on `prefers-reduced-motion`.
-   **Drone relay (TX / RX) indicator:** long-press the telescope to send
    a drone to the target star; a progress ring fills while you hold. Inside
    a sector the drone flies from the telescope, orbits the target, and a
    dashed tether carries signal packets back; in the sector overview the
    Gargantua tunnel draws a line from the source sector through Gargantua to
    the receiving sector. Colors follow each sector's interlocking indicator.
-   **UI sound design:** small synthesized Web Audio effects (camera radar
    sweep, star-tracker noise, UI taps, constellation chime). No audio files;
    they follow the master volume and go silent in Radio Silence. Stellar
    Signals duck while the noise bed plays.
-   **Tune panel** (owl button → Settings): **Gargantua** (size, lensing,
    bloom, speed), **Sky** (haze, Milky Way band, drift, nebula image,
    sector sky, portal halo), **Asteroid** (the orbiting ring: on/off, count,
    size, orbit width, thickness, speed) and **Tele** (bring the telescope
    along, bubble messages, LED color, hover / spin / size). Every tab has
    Save / Reset and is kept in `localStorage`.
-   **Quality chip** (`Perf · HIGH / LOW`): no device auto-detect, the
    default is HIGH. The visitor's choice is saved (`dumul_quality`); append
    `?perf=low` or `?perf=high` to the URL to test a tier without saving.
-   Constellation glyph sprites (128 px WebP art in `img/glyph/<id>.webp`,
    loaded per constellation the first time it is shown, tinted per star,
    with a vector-line fallback) and a nebula backdrop image
    (`img/nebula-portrait.webp`, one image cover-fitted for both portrait and landscape)
-   **Live observer counter:** loaded after the page has finished loading (on idle), so Firebase never competes with boot and audio for bandwidth. A small `N observers` readout showing how many
    unique devices have the Observatory open right now (Firebase Realtime
    Database presence, one entry per device, removed when the last tab
    closes). If it can't connect, it stays hidden and nothing else is
    affected.
-   Draggable **Gargantua** with an enlarged interaction field and
    audio-reactive ripple rings
-   DUMUL portal tied to **Orion's belt** stars
-   Gargantua → DUMUL neural-network transition with visual/audio
    continuity
-   Hidden **Konami** sequence (keyboard, plus a swipe version for
    touch screens) along with terminal (tap the clock 5×), telescope
    greeting / random telescope messages, Gargantua-near-clock time
    dilation, and constellation-log interactions
-   Built-in **layout editor** (`/?layout=1`) for moving / scaling
    constellations; **COPY** outputs values to paste into `sky-data.js`
-   Source-code shortcut from the Observatory UI
-   Boot sequence with telemetry, matrix-style warm-up, repeat-visit
    shortcut, and **Red / Blue** entry choices
-   Low-quality tier (`IS_POTATO`, picked from the Quality chip), idle rendering savings, and
    `prefers-reduced-motion` support. All BGM-reactive visuals switch off
    on hidden tabs, `prefers-reduced-motion`, `IS_POTATO`, Radio Silence,
    the swallow transition and the tesseract; audio keeps playing. BGM
    ducking is skipped on `IS_POTATO` and where `audio.volume` is
    read-only (iOS Safari), where the old "BGM pauses" behavior is kept
-   Mobile-safe pointer/touch handling, haptics where supported, and
    throttled analyser/hover work

------------------------------------------------------------------------

## DUMUL page features

The current album sequence is:

1.  **Glitch (Instrumental)** --- opening / threshold
2.  **Limerence** --- debut / distortion & ache
3.  **Glitch** --- neural interference
4.  **Nastenka** --- white nights / after Dostoevsky
5.  **Larung** --- to drift, to let go

Player features:

-   Selectable track list with previous / next controls
-   Play / pause and seek controls
-   Waveform-style seek visualization
-   Web Audio analyser with reactive spectrum / neural mesh
-   Compact mini spectrum above the player bar that appears when the
    hero spectrum scrolls out of view
-   Synced LRC-style lyrics where available
-   Keyword-triggered glitch effects on specific lyric lines
-   Lyrics panel sized around the fixed player bar without forcing the
    page to jump
-   Per-track **Track Notes**
-   Dynamic tab title (now-playing / "come back" message) and Media
    Session support for lock-screen / notification controls
-   Returning-visitor "Corrupted Memory" log messages (shown on direct
    visits, not on the Gargantua handoff)
-   Single floating **Back to top** button (appears after scrolling down and
    lifts above the player bar while a track is active)
-   Smooth page fade-in and reduced-motion handling
-   Hero canvas pauses while off-screen, and below-the-fold sections use
    `content-visibility` to cut rendering work
-   No automatic `collapsars` background bed on the DUMUL page

### Gargantua handoff

Entering DUMUL through the Observatory's Gargantua swallow is a
continuous audio/visual transition:

-   `index.html` uses `glitch-instrumental.opus` as the transition BGM
-   Playback position is handed through `sessionStorage`
-   `dumul.html` resumes that position in **Glitch (Instrumental)**, the
    first DUMUL transmission
-   Spectrum / neural-mesh state is handed across so the visual
    transition does not hard-cut
-   The destination is temporarily pinned at the top while the DUMUL
    layout and player settle
-   Normal DUMUL playback then takes over and the transition volume
    ramps into the regular player level

------------------------------------------------------------------------

## Offline / PWA

The site is an installable PWA and keeps working without a connection
once its files (and, optionally, its music) have been cached.

-   **Install:** `manifest.json` (standalone display, `#060b11` theme,
    icons in `icons/`, plus a shortcut straight to DUMUL). Browsers show
    their usual *Install app / Add to Home screen* option.
-   **Service worker** (`service-worker.js`, must stay at the site root —
    its scope is the folder it lives in, so moving it into
    `dumul-js/obs/` would stop it controlling `index.html` /
    `dumul.html`; GitHub Pages cannot send `Service-Worker-Allowed`):
    -   Pages: network-first, falling back to the cached copy offline.
    -   CSS / JS / images / Google Fonts: stale-while-revalidate.
    -   Audio (`.opus`): served from the cache when saved, with its own
        `Range` / `206` handling so seeking, `warmNext()` preloading and
        Web Audio analysers keep working. Anything not saved yet passes
        straight through to the network, exactly as before.
-   **When a track gets saved:**
    1.  Automatically, once it has been played past 50% (the page
        reports it to the service worker).
    2.  In bulk, when the visitor taps the **offline button** in the
        Settings panel.
-   **Offline button** (opt-in, no popup): in the Observatory it lives in the
    owl panel (Settings tab) as a chip that shows its own state:
    `Save offline n/23` → `Saving n/23` (the chip fills as a progress bar)
    → `Offline ready`. Tapping it downloads all tracks (23 files, ~75 MB).
    -   `Offline…` while the service worker is still starting; `Offline N/A`
        if it never becomes ready (e.g. Firefox private mode), tap to retry.
    -   `Retry n/23` appears if the download stalls for 90 s or finishes
        partially.
    -   The choice is remembered (`ofl_choice`). If the download was
        interrupted, it resumes silently on a later visit (skipped on Data
        Saver, 2G and cellular).
    -   The chip is removed if the browser has no service worker / Cache
        Storage.
-   **Limits:** at most 24 audio files and 15 MB per file are kept
    (`MAX_AUDIO_FILES`, `MAX_AUDIO_BYTES`); oldest saved goes first.
-   **`cache-status.html`:** a small diagnostic page (not linked from the
    site, `noindex`). Lists which tracks are saved and their sizes, shows
    storage usage, and has *Download all* / *Clear audio cache* buttons.
    Safe to delete from the repo if you don't need it.

------------------------------------------------------------------------

## Project layout

``` text
.
├── index.html              # Observatory (entry)
├── index.css               # Observatory styles
│
├── dumul-js/
│   └── obs/                # Observatory scripts + data (everything the sky runs on)
│       ├── sky-data.js     # ONE source of truth: sectors, constellations, stars, SFX, panel groups, audio list
│       ├── texts.js        # All site text (telescope messages, terminal log, greetings) — pure data (English)
│       ├── i18n.js         # EN/ID layer: UI dictionary, T('key'), language chip (dumul_lang)
│       ├── i18n-sky.js     # ID translation of sky-data.js (whispers, camera info cards, signal fragments)
│       ├── i18n-texts.js   # ID translation of texts.js (telescope messages, terminal log)
│       ├── check-sky.js    # Pre-deploy check:  node dumul-js/obs/check-sky.js
│       ├── img/
│       │   ├── nebula-portrait.webp    # Nebula backdrop (single image, used for portrait AND landscape)
│       │   └── glyph/                  # 23 constellation glyph arts, <id>.webp (128 px)
│       └── js/             # Observatory logic, split from the old index.js (load order matters!)
│           ├── 01-core.js          # setup, stage, Sector Scan HUD, camera, audio, spatial muffle, visualizers
│           ├── 02-sky-logic.js     # data wiring, Pleiades, memory, unlock, observation mode, alignment, time dilation, layout, plate
│           ├── 03-gargantua.js     # black hole, shared neural network, transition spectrum
│           ├── 04-render.js        # overlays, telescope, SFX, target reticle, constellation drawing, observatory FX
│           ├── 05-sector-ui.js     # sector overview, Gargantua summon/relay, sector gate, tune panel, music player
│           ├── 06-interaction.js   # interaction, easter eggs, terminal, greeting, clock dilation
│           ├── 07-boot.js          # boot, layout editor, render loop
│           ├── 08-tx-drone.js      # drone TX/RX animation + hold ring (TXFX)
│           ├── 09-wormhole.js      # wormhole transition for sector gates / mini Gargantua (WORMHOLE)
│           ├── 10-ui-sound.js      # synthesized UI sound effects (UIS)
│           └── 11-live-count.js    # live observer counter (ES module, loaded lazily via import(); Firebase presence)
│
├── dumul.html              # DUMUL / album page
├── dumul.css               # DUMUL styles
├── dumul.js                # Player, lyrics, track notes, handoff, visitor log, effects
├── dumul-app.js            # Bundled React hero (minified, not meant to be edited by hand)
│
├── service-worker.js       # PWA: caching, offline, audio Range handling (keep at root)
├── manifest.json           # PWA manifest
├── icons/
│   ├── icon-192.png
│   ├── icon-512.png
│   └── icon-maskable-512.png
├── cache-status.html       # Optional diagnostic page for the audio cache
├── licenses/
│   └── gargantua-css-LICENSE.txt   # MIT license of the Gargantua CSS source (Josetxu)
│
├── README.md
│
├── audio/                  # All .opus files live here (kept out of the root)
│   ├── # Observatory stellar SFX (16)
│   ├── betelgeuse.opus  rigel.opus  aldebaran.opus  pleione.opus
│   ├── sirius.opus  capella.opus  pollux.opus  procyon.opus      # Winter
│   ├── spica.opus  arcturus.opus  alioth.opus  regulus.opus      # Spring
│   ├── vega.opus  deneb.opus  altair.opus                        # Summer
│   ├── alpheratz.opus                                            # Autumn
│   ├── # Observatory / transition audio
│   ├── constellation.opus      # Observatory BGM
│   ├── collapsars.opus         # Observatory BGM
│   ├── glitch-instrumental.opus# Gargantua → DUMUL transition / album opening
│   ├── # DUMUL album audio
│   ├── limerence.opus
│   ├── glitch.opus
│   ├── nastenka.opus
│   └── larung.opus
│
├── og.webp                 # Hero image used on both pages (art Limerence di dumul)
├── collapsars-cover.webp   # Album art Collapsars (Media Session Observatory)
├── og.jpg                  # DUMUL Open Graph image
└── og-constellation.jpg    # Observatory Open Graph image
```

Audio paths are relative to the HTML pages (`audio/<name>.opus`) and are
built in `dumul-js/obs/js/01-core.js` (`mkAudio`) and `dumul.js`
(`srcOf`); the service worker gets its list from `SKY.audioFiles()`
(`ALL_AUDIO`), which is generated from `sky-data.js`. Images stay beside the HTML files (the
Open Graph images are referenced by absolute URL, so leave them at the
site root). `service-worker.js` and
`manifest.json` must also stay at the root so the service worker's scope
covers both pages.

------------------------------------------------------------------------

## Editing guide

| To change... | Edit |
|---|---|
| Text, structure, meta/SEO tags, links | `index.html` / `dumul.html` |
| Look and layout | `index.css` / `dumul.css` |
| Add / move a constellation, star, SFX, sector, panel group | `dumul-js/obs/sky-data.js` (then `node dumul-js/obs/check-sky.js`) |
| Any sentence the Observatory says (telescope, terminal, greeting) | `dumul-js/obs/texts.js` (English) + `i18n-texts.js` (Indonesian) |
| UI labels / button text / toasts, either language | `dumul-js/obs/i18n.js` (dictionary) and `data-i18n="key"` in `index.html` |
| Constellation whispers, camera info cards, signal fragments | `dumul-js/obs/sky-data.js` (English) + `i18n-sky.js` (Indonesian) |
| Observatory behavior, features, bug fixes, animation, audio | `dumul-js/obs/js/01…10-*.js` (see the layout above for which file) |
| Drone relay animation / wormhole transition / UI sounds | `08-tx-drone.js` / `09-wormhole.js` / `10-ui-sound.js` |
| Live observer counter | `11-live-count.js` |
| DUMUL page behavior | `dumul.js` |
| Offline behavior, cache rules, track list for "Save all" | `service-worker.js` |
| Install name, colors, icons, shortcuts | `manifest.json` |
| Offline button text, size estimate | the second PWA `<script>` near the end of `index.html` (`STR`, `SIZE_MB`) |

Notes:

-   `dumul-app.js` is generated bundle output --- avoid editing it.
-   The deterministic neural-network layout exists in two places
    (`dumul-js/obs/js/03-gargantua.js` and the inline script at the top
    of `dumul.html`). Keep
    them identical, or the Gargantua → DUMUL transition will no longer
    line up.
-   After changing a CSS/JS file, bump its version query in the HTML
    (for example `dumul.js?v=1` → `dumul.js?v=2`) so returning visitors
    don't get a stale cached copy. GitHub Pages caches files for about
    10 minutes. **Also update the same entry in the `SHELL` list of
    `service-worker.js`** and bump its `VERSION` so the old precached copy
    is dropped. `node dumul-js/obs/check-sky.js` verifies the `?v=` values
    match.
-   **The files in `dumul-js/obs/js/` (`01` … `10`) are one
    program, not modules.** They are plain classic scripts loaded in order
    with `defer` and share one global scope; there is no IIFE anymore, so
    each file starts with `'use strict'`. Don't reorder the `<script>`
    tags (`08`–`10` load after `07-boot.js`), don't add `type="module"`, and keep
    top-level names unique across files (`SKY`, `TXT`, `I18N`, `T`,
    `TXFX`, `WORMHOLE` and `UIS` are already taken).
    Anything that runs at load time (not inside a function) may only use
    functions from the same or an earlier file. Bump `?v=` on **every**
    tag (data files, i18n files, all js files, `index.css`) + the `SHELL`
    list together on each deploy.
-   **`11-live-count.js` is the exception:** it is an ES module (Firebase is
    imported from `gstatic.com`), so it has its own scope and needs a
    network connection. It has no `<script>` tag: a small inline script near
    the end of `index.html` loads it with `import()` after `window.load` (on
    idle, 6 s at the latest). Its `?v=` is still bumped, must match the
    `import()` path, and is listed in `SHELL` like the others.
-   **Load order of the language layer:** `sky-data.js` → `texts.js` →
    `i18n.js` → `i18n-sky.js` → `i18n-texts.js` → `01-core.js`. The
    translations overwrite `SKY` / `TXT` in place, so they must run before
    any script reads them. A tiny inline fallback `T()` in `index.html`
    keeps boot from stalling if `i18n.js` fails to load.
-   **Adding a UI string:** add the key to the dictionary in `i18n.js`
    (`{en, id}`), then use `data-i18n="key"` / `data-i18n-aria="key"` in the
    HTML or `T('key')` in JS. New telescope / terminal lines go in
    `texts.js` and get a counterpart in `i18n-texts.js`.
-   **Glyph art:** one `img/glyph/<id>.webp` per constellation. To add or
    replace one, put the file there, add the id to `GLYPH_ART_IDS` in
    `05-sector-ui.js`, add it to `SHELL` in `service-worker.js`, and bump
    `GLYPH_ART_V` (and the `?v=` in `SHELL`) if you replaced an existing image.
    `check-sky.js` verifies the id list, the files and the `SHELL` entries.
-   **Adding, renaming or removing a track:** put the file in `audio/`
    and register it in `sky-data.js` (the service worker's `ALL_AUDIO`
    is generated from it), then update `SIZE_MB` in the offline
    script of `index.html`. If you replace an audio file's contents but keep its name,
    bump `AUDIO_VERSION` in `service-worker.js`; otherwise visitors who
    already saved it keep the old version.
-   The "play >50%" service-worker hook is duplicated in `index.html` and
    `dumul.html`. Keep the two copies identical.

------------------------------------------------------------------------

## Run locally

There is no build step --- the project is plain static files.

A local server is required instead of `file://`: `dumul-app.js` is an ES
module (browsers block those from `file://`), and audio / Web Audio
behave more reliably over HTTP.

``` bash
npx serve .

# or
python3 -m http.server 8080
```

Then open `http://localhost:8080/` for the Observatory or `/dumul.html`
for the DUMUL page.

Before deploying, run the data/version check from the site root (needs
Node, no install step). It must print `OK`:

``` bash
node dumul-js/obs/check-sky.js
# or point it at the site root explicitly
node dumul-js/obs/check-sky.js /path/to/site
```

It validates `sky-data.js` (`SKY.check()`), that every audio file exists,
that the `?v=` of `index.css`, `sky-data.js`, `texts.js`, the three `i18n*.js`
files and every `js/*.js` in `index.html` matches `SHELL` in
`service-worker.js` (and the script tags are in folder order), that each `js/` file starts with
`'use strict'`, and that no old hard-coded text/button patterns are left.

Service workers run on `localhost` and HTTPS only. While developing, use
DevTools → Application → Service Workers → *Update on reload* (or
*Unregister*), otherwise an older cached copy may keep being served.

------------------------------------------------------------------------

## Deploy (GitHub Pages)

The site is configured for the user site **`dumul17.github.io`**.

1.  Push the project files to
    `https://github.com/dumul17/dumul17.github.io`
2.  Use the `main` branch (or another GitHub Pages source branch) with
    `/` as the published root.
3.  The HTML already contains canonical URLs for
    `https://dumul17.github.io/` and
    `https://dumul17.github.io/dumul.html`.
4.  Upload the HTML and CSS files, the whole `dumul-js/obs/` folder
    (`sky-data.js`, `texts.js`, `i18n*.js`, `img/` incl. `img/glyph/`, `js/01…11`) and the `dumul.*` files
    together, and keep the referenced audio and image assets beside them
    on the same origin. Upload `dumul-js/obs/` **before** the new
    `index.html` / `service-worker.js` so the page never points at scripts
    that aren't there yet.
5.  Also upload `service-worker.js`, `manifest.json` and `icons/` to the
    repo root (and optionally `cache-status.html`). Open the live site
    once online so the service worker can install.
6.  If `dumul-js` lives in its own repository, that repo needs GitHub
    Pages enabled so `/dumul-js/obs/…` resolves from the main site (the
    check script then needs the site root passed as an argument).

------------------------------------------------------------------------

## Notes / behavior

-   **Audio:** normal Observatory audio is started through user
    interaction rather than assuming autoplay will succeed.
-   **Gargantua audio routing:** `glitch-instrumental.opus` is connected
    to the audible output path of the shared analyser graph, so the
    swallow stays audible even after stars were tapped earlier in the
    same visit.
-   **Star SFX and music:** the Observatory coordinates its stellar SFX
    and music channels so they do not unnecessarily stack.
-   **DUMUL background audio:** `collapsars.opus` is an Observatory BGM
    option; `dumul.html` does not automatically start it in the
    background.
-   **Gargantua:** the Observatory transition uses
    `glitch-instrumental.opus`, then DUMUL resumes that position as its
    first transmission.
-   **Performance:** analyser work, hover hit-testing, spectrum drawing,
    and secondary effects are throttled where appropriate. Idle mode
    reduces secondary rendering work after inactivity.
-   **Accessibility / device support:** the pages include pointer/touch
    handling, keyboard-accessible controls, focus states, haptics where
    supported, and `prefers-reduced-motion` paths.
-   **Offline caching:** the service worker never touches audio that
    isn't saved yet, so streaming, seeking and preload behave the same
    as without it. Saved tracks are served locally, which also removes
    the boot screen's audio bandwidth on later visits.
-   **Split assets:** CSS and JavaScript live in external files so
    browsers can cache them separately from the HTML (the Observatory
    script is split into 10 ordered files plus the data and language files, with
    the live counter as a separate lazily loaded module); a few tiny
    scripts that must run before first paint stay inline in
    `dumul.html`.
-   **Browser storage:** the Observatory/DUMUL transition uses
    `sessionStorage` for short-lived audio and visual handoff state, and
    the Observatory also uses session state to shorten repeat-visit boot
    behavior. The DUMUL page keeps a small returning-visitor record in
    `localStorage`. The Observatory keeps heard-state in `obs_stellar_v1` (StellarMem,
    drives the Constellation Log) and unlocked constellations in `obs_unlock_v1`
    (separate on purpose: *heard* is not *unlocked*). Unlocking asks the
    service worker to save that constellation's `.opus` (`CACHE_AUDIO`); existing
    cached audio is never cleared. The overview Gargantua summoned/recalled state is kept in
    `dumul_bh_home` (default: summoned). The language is stored in
    `dumul_lang`, the quality tier in `dumul_quality`, tune-panel settings in
    `dumul_sky_cfg`, `dumul_ast_cfg` and `dumul_tele_cfg`, and the music
    player's volume / shuffle / repeat in `mp_vol`, `mp_shuffle` and
    `mp_repeat`. The offline button stores the visitor's choice in
    `localStorage` (`ofl_choice`), and saved tracks and the offline shell
    live in the browser's Cache Storage.
-   **Live counter & third-party hosts:** `11-live-count.js` keeps an
    anonymous per-device id in `localStorage` (`dumul_dev`) and writes
    presence entries to Firebase Realtime Database; nothing else is sent.
    Besides Google Fonts, this is the only third-party network use. Without
    a connection the counter simply stays hidden.

------------------------------------------------------------------------

## Contact

-   [YouTube](https://www.youtube.com/@dumul17)
-   [Instagram](https://www.instagram.com/dumuldumbowl/)

------------------------------------------------------------------------

## Credits

-   **DUMUL** --- Indonesian alternative rock; current album arc:
    *Glitch (Instrumental)* → *Limerence* → *Glitch* → *Nastenka* →
    *Larung*
-   Site concept & code --- dumul17
-   Observatory sky / constellation interaction --- custom canvas and
    vanilla JavaScript, data-driven from `sky-data.js`
-   DUMUL page --- vanilla audio / lyrics / analyser layer with a small
    bundled React hero
-   Offline / PWA layer --- vanilla service worker, manifest and a small
    HUD-styled opt-in button
-   Neural-network transition --- shared deterministic transition
    implementation between `index.html` and `dumul.html`
-   Wormhole transition, drone relay animation and UI sound effects ---
    vanilla Canvas 2D / Web Audio, written for this site
-   Live observer counter --- Firebase Realtime Database presence
-   EN / ID language layer --- `i18n.js`, `i18n-sky.js`, `i18n-texts.js`
-   Gargantua black hole visual --- *"Interstellar Blackhole Gargantua #2 -
    Pure CSS"* by Josetxu
    ([codepen.io/josetxu/pen/rNWgNeq](https://codepen.io/josetxu/pen/rNWgNeq)),
    MIT License. Adapted into a canvas sprite. See
    `licenses/gargantua-css-LICENSE.txt`.

------------------------------------------------------------------------

## License

Content and original audio: © DUMUL / dumul17.

Ask before reusing tracks or site code commercially.

------------------------------------------------------------------------

*"Keep creating, even without the applause."* 🦉
