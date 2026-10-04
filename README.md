# Dumul's Observatory

Interactive personal site for **dumul17** --- modder, composer, and the
three-person Indonesian alternative rock project **DUMUL**.

Live: [dumul17.github.io](https://dumul17.github.io/)

------------------------------------------------------------------------

## What's here

| Page | HTML | Styles | Scripts | Description |
|---|---|---|---|---|
| **Observatory** | `index.html` | `index.css` | `index.js` | Full-screen interactive sky: constellations, Gargantua, stellar SFX, music HUD, observation tools, easter eggs, and the DUMUL portal |
| **DUMUL** | `dumul.html` | `dumul.css` | `dumul.js`, `dumul-app.js` | DUMUL album page with five selectable transmissions, synced lyrics, track notes, spectrum/seek UI, and seamless Gargantua handoff |

| **PWA / offline** | `manifest.json`, `icons/` | -- | `service-worker.js` | Installable app, offline shell, and opt-in offline audio archive |

The Observatory is the entry point. The **DUMUL** portal sits around
Orion's belt, while **Gargantua** can also swallow the page into the
DUMUL transition.

------------------------------------------------------------------------

## Observatory features

-   Full-screen custom canvas sky with gravitational lensing around
    **Gargantua**
-   Interactive constellations: **Orion**, **Virgo**, **Canis Major**,
    **Taurus**, **Boötes**, **Scorpius**, and the **Pleiades**
-   Stellar trigger sounds for `Betelgeuse`, `Rigel`, `Spica`, `Sirius`,
    `Pleione`, `Aldebaran`, `Arcturus`, and `Antares`
-   Tap/hover/focus feedback, supernova flashes, star chimes,
    constellation highlighting, and a **Last Signal** display
-   **Music Transmission** HUD with 8 stellar signals, `constellation`
    BGM, `collapsars` BGM, observed-state tracking, signal counter, and
    live spectrum indicators
-   **Observation Mode** and **Radio Silence**
-   **Constellation Camera** with `1×–3×` zoom, pinch/wheel control, and
    two-finger sky rotation
-   Mobile sky pan and rotation interactions
-   Draggable **Gargantua** with an enlarged interaction field and
    audio-reactive ripple rings
-   DUMUL portal tied to **Orion's belt** stars
-   Gargantua → DUMUL neural-network transition with visual/audio
    continuity
-   Hidden **Konami** sequence (keyboard, plus a swipe version for
    touch screens) along with terminal and constellation-log
    interactions
-   Source-code shortcut from the Observatory UI
-   Boot sequence with telemetry, matrix-style warm-up, repeat-visit
    shortcut, and **Red / Blue** entry choices
-   Weak-device (`IS_POTATO`) handling, idle rendering savings, and
    `prefers-reduced-motion` support
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
-   **Service worker** (`service-worker.js`, must stay at the site root):
    -   Pages: network-first, falling back to the cached copy offline.
    -   CSS / JS / images / Google Fonts: stale-while-revalidate.
    -   Audio (`.opus`): served from the cache when saved, with its own
        `Range` / `206` handling so seeking, `warmNext()` preloading and
        Web Audio analysers keep working. Anything not saved yet passes
        straight through to the network, exactly as before.
-   **When a track gets saved:**
    1.  Automatically, once it has been played past 50% (the page
        reports it to the service worker).
    2.  In bulk, when the visitor taps **SAVE ALL** on the *Offline
        Archive* banner.
-   **Offline Archive banner** (opt-in, styled like the Observatory HUD):
    asks once whether to save all 15 tracks (~43 MB) for offline use,
    shows `SYNCING n/15` progress, and can be closed while the download
    continues in the background.
    -   **NOT NOW** / close: asks again after 14 days. Per-track caching
        from playback still works.
    -   Not shown on Data Saver, 2G, or when everything is already saved.
    -   If a visitor accepted earlier but the download was interrupted,
        it resumes silently on a later visit (skipped on cellular).
    -   Hidden automatically during the Gargantua swallow.
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
├── index.js                # Observatory logic (sky, Gargantua, audio, boot, easter eggs)
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
│
├── README.md
│
├── audio/                  # All .opus files live here (kept out of the root)
│   ├── # Observatory stellar SFX
│   ├── betelgeuse.opus
│   ├── rigel.opus
│   ├── spica.opus
│   ├── sirius.opus
│   ├── pleione.opus
│   ├── aldebaran.opus
│   ├── arcturus.opus
│   ├── antares.opus
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
built in `index.js` (`mkAudio`) and `dumul.js` (`srcOf`); the service
worker lists them in `ALL_AUDIO`. Images stay beside the HTML files (the
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
| Behavior, features, bug fixes, animation, audio | `index.js` / `dumul.js` |
| Offline behavior, cache rules, track list for "Save all" | `service-worker.js` |
| Install name, colors, icons, shortcuts | `manifest.json` |
| Offline Archive banner text, size, re-ask delay | the second PWA `<script>` near the end of `index.html` / `dumul.html` (`TXT`, `SIZE_MB`, `ASK_AGAIN_DAYS`) |

Notes:

-   `dumul-app.js` is generated bundle output --- avoid editing it.
-   The deterministic neural-network layout exists in two places
    (`index.js` and the inline script at the top of `dumul.html`). Keep
    them identical, or the Gargantua → DUMUL transition will no longer
    line up.
-   After changing a CSS/JS file, bump its version query in the HTML
    (for example `dumul.js?v=1` → `dumul.js?v=2`) so returning visitors
    don't get a stale cached copy. GitHub Pages caches files for about
    10 minutes. **Also update the same entry in the `SHELL` list of
    `service-worker.js`** and bump its `VERSION` so the old precached copy
    is dropped.
-   **Adding, renaming or removing a track:** put the file in `audio/`, then update `ALL_AUDIO` in
    `service-worker.js` and `SIZE_MB` in the banner script (both HTML
    files). If you replace an audio file's contents but keep its name,
    bump `AUDIO_VERSION` in `service-worker.js`; otherwise visitors who
    already saved it keep the old version.
-   The banner script and the "play >50%" hook are duplicated in
    `index.html` and `dumul.html`. Keep the two copies identical.

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
4.  Upload the HTML, CSS and JS files together, and keep the referenced
    audio and image assets beside them on the same origin.
5.  Also upload `service-worker.js`, `manifest.json` and `icons/` to the
    repo root (and optionally `cache-status.html`). Open the live site
    once online so the service worker can install.

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
    browsers can cache them separately from the HTML; a few tiny
    scripts that must run before first paint stay inline in
    `dumul.html`.
-   **Browser storage:** the Observatory/DUMUL transition uses
    `sessionStorage` for short-lived audio and visual handoff state, and
    the Observatory also uses session state to shorten repeat-visit boot
    behavior. The DUMUL page keeps a small returning-visitor record in
    `localStorage`. The Offline Archive banner stores the visitor's
    choice in `localStorage` (`ofl_choice`), and saved tracks and the
    offline shell live in the browser's Cache Storage.

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
    vanilla JavaScript
-   DUMUL page --- vanilla audio / lyrics / analyser layer with a small
    bundled React hero
-   Offline / PWA layer --- vanilla service worker, manifest and a small
    HUD-styled opt-in banner
-   Neural-network transition --- shared deterministic transition
    implementation between `index.html` and `dumul.html`

------------------------------------------------------------------------

## License

Content and original audio: © DUMUL / dumul17.

Ask before reusing tracks or site code commercially.

------------------------------------------------------------------------

*"Keep creating, even without the applause."* 🦉
