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
-   Clickable lyric lines for seeking
-   Keyword-triggered glitch effects on specific lyric lines
-   Lyrics panel sized around the fixed player bar without forcing the
    page to jump
-   Per-track **Track Notes**
-   Dynamic tab title (now-playing / "come back" message) and Media
    Session support for lock-screen / notification controls
-   Returning-visitor "Corrupted Memory" log messages (shown on direct
    visits, not on the Gargantua handoff)
-   Inline **Back to top** plus a floating mobile FAB
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
├── README.md
│
├── # Observatory stellar SFX
├── betelgeuse.opus
├── rigel.opus
├── spica.opus
├── sirius.opus
├── pleione.opus
├── aldebaran.opus
├── arcturus.opus
├── antares.opus
│
├── # Observatory / transition audio
├── constellation.opus      # Observatory BGM
├── collapsars.opus         # Observatory BGM
├── glitch-instrumental.opus# Gargantua → DUMUL transition / album opening
│
├── # DUMUL album audio
├── limerence.opus
├── glitch.opus
├── nastenka.opus
├── larung.opus
│
├── og.webp                 # Hero image used on both pages
├── og.jpg                  # DUMUL Open Graph image
└── og-constellation.jpg    # Observatory Open Graph image
```

Audio and image paths are relative to the HTML pages and are loaded
directly by the JavaScript and CSS. Keep the assets in the same folder
as the HTML files (the Open Graph images are referenced by absolute
URL, so leave them at the site root).

------------------------------------------------------------------------

## Editing guide

| To change... | Edit |
|---|---|
| Text, structure, meta/SEO tags, links | `index.html` / `dumul.html` |
| Look and layout | `index.css` / `dumul.css` |
| Behavior, features, bug fixes, animation, audio | `index.js` / `dumul.js` |

Notes:

-   `dumul-app.js` is generated bundle output --- avoid editing it.
-   The deterministic neural-network layout exists in two places
    (`index.js` and the inline script at the top of `dumul.html`). Keep
    them identical, or the Gargantua → DUMUL transition will no longer
    line up.
-   After changing a CSS/JS file, bump its version query in the HTML
    (for example `dumul.js?v=1` → `dumul.js?v=2`) so returning visitors
    don't get a stale cached copy. GitHub Pages caches files for about
    10 minutes.

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

------------------------------------------------------------------------

## Notes / behavior

-   **Audio:** normal Observatory audio is started through user
    interaction rather than assuming autoplay will succeed.
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
-   **Split assets:** CSS and JavaScript live in external files so
    browsers can cache them separately from the HTML; a few tiny
    scripts that must run before first paint stay inline in
    `dumul.html`.
-   **Browser storage:** the Observatory/DUMUL transition uses
    `sessionStorage` for short-lived audio and visual handoff state, and
    the Observatory also uses session state to shorten repeat-visit boot
    behavior. The DUMUL page keeps a small returning-visitor record in
    `localStorage`.

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
-   Neural-network transition --- shared deterministic transition
    implementation between `index.html` and `dumul.html`

------------------------------------------------------------------------

## License

Content and original audio: © DUMUL / dumul17.

Ask before reusing tracks or site code commercially.

------------------------------------------------------------------------

*"Keep creating, even without the applause."* 🦉
