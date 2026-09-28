# Dumul's Observatory

Interactive personal site for **dumul17** --- modder, composer, and the
three-person Indonesian alternative rock project **DUMUL**.

Live: [dumul17.github.io](https://dumul17.github.io/)

------------------------------------------------------------------------

## What's here

  ------------------------------------------------------------------------
  Page              File              Description
  ----------------- ----------------- ------------------------------------
  **Observatory**   `index.html`      Full-screen interactive sky:
                                      constellations, Gargantua, stellar
                                      SFX, music HUD, observation tools,
                                      easter eggs, and the DUMUL portal

  **DUMUL**         `dumul.html`      DUMUL album page with five
                                      selectable transmissions, synced
                                      lyrics, track notes, spectrum/seek
                                      UI, and seamless Gargantua handoff
  ------------------------------------------------------------------------

The Observatory is the entry point. The **DUMUL** portal sits around
Orion's belt, while **Gargantua** can also swallow the page into the
DUMUL transition.

------------------------------------------------------------------------

## Observatory features

-   Full-screen custom canvas sky with gravitational lensing around
    **Gargantua**
-   Interactive constellations: **Orion**, **Virgo**, **Canis Major**,
    **Taurus**, and **Pleiades**
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
-   Draggable **Gargantua** with an enlarged interaction field
-   DUMUL portal tied to **Orion's belt** stars
-   Gargantua → DUMUL neural-network transition with visual/audio
    continuity
-   Hidden **Konami** sequence plus terminal and constellation-log
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
-   Synced LRC-style lyrics where available
-   Clickable lyric lines for seeking
-   Lyrics panel sized around the fixed player bar without forcing the
    page to jump
-   Per-track **Track Notes**
-   Inline **Back to top** plus a floating mobile FAB
-   Smooth page fade-in and reduced-motion handling
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
├── dumul.html              # DUMUL / album page
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
├── og.jpg                  # DUMUL Open Graph / hero image
└── og-constellation.jpg    # Observatory Open Graph image
```

Audio paths are relative to each HTML page and are loaded directly by
the inline JavaScript. Keep the audio files on the same origin as the
HTML pages.

------------------------------------------------------------------------

## Run locally

There is no build step --- the project is intentionally shipped as
static, self-contained HTML.

A local server is recommended instead of `file://`, especially for audio
and Web Audio behavior:

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
4.  Keep the referenced audio and image assets beside the HTML files on
    the same origin.

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
-   **Single-file pages:** CSS and JavaScript remain inline on purpose
    for zero-build static hosting. Splitting them into external files is
    optional and mainly a maintainability change.
-   **Browser storage:** the Observatory/DUMUL transition uses
    `sessionStorage` for short-lived audio and visual handoff state; the
    Observatory also uses session state to shorten repeat-visit boot
    behavior.

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
-   DUMUL page --- static export with a vanilla audio / lyrics /
    analyser layer
-   Neural-network transition --- shared deterministic transition
    implementation between `index.html` and `dumul.html`

------------------------------------------------------------------------

## License

Content and original audio: © DUMUL / dumul17.

Ask before reusing tracks or site code commercially.

------------------------------------------------------------------------

*"Keep creating, even without the applause."* 🦉
