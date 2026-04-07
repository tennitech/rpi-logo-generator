# RPI Logo Generator - Project Status & Master Documentation

**Last Updated:** 2026-04-07
**Current Phase:** Phase 3 (Advanced Features & Refinement)

## 1. Project Overview
A web-based **Design Tool** integrated with RPI's central Brand Hub. It allows students and faculty to generate unique, brand-compliant RPI "Bar" logos and lockups. The tool strictly adheres to branding patterns while ensuring safety and stability.

## 2. Architecture & Tech Stack
*   **Core:** Vanilla HTML5, CSS3, JavaScript (ES6+).
*   **Rendering:** p5.js (WebGL mode) for 2D/3D graphics and shaders.
*   **Integration:** Designed to embed within the **Frontify** ecosystem.
*   **Shaders:** GLSL fragment shaders for pattern generation.
*   **Audio:** Web Audio API with AudioWorklet (`pulse-worklet.js`) for audio-reactive features.
*   **Fonts:** Official `RPIGeist` family (WOFF2) served locally.

### File Structure
*   `assets/` - Static resources (fonts, images, shaders).
*   `css/` - Stylesheets (`style.css`).
*   `js/` - Logic (`main.js`, `drawing.js`, `pulse-worklet.js`).
    *   `utils/` - Helper modules (`profanityFilter.js`).
*   `animation/` - Standalone static prototype route for experimental motion studies.
*   `generator-command-deck/` - Hidden fullscreen generator prototype route with compact floating controls.
*   `generator-panel-mosaic/` - Hidden fullscreen generator prototype route with dashboard-style control layout.
*   `generator-shared/` - Shared fullscreen generator foundation for the hidden generator routes.
*   `references/` - Documentation and guidelines.

## 3. Completed Milestones

### Phase 0: Analysis & Setup
*   [x] Analyzed Project Proposal and Brand Guidelines.
*   [x] Extracted condensed brand rules for agent usage.

### Phase 1: Foundation & Safety
*   [x] **Structure:** specific directory layout established (`assets`, `css`, `js`).
*   [x] **Branding:** Integrated `RPIGeist` font family and defined CSS variables.
*   [x] **Safety:** Implemented client-side profanity filter with real-time feedback.
*   [x] **UI Polish:** Shifted to workspace layout, implemented accessible dropdowns and navigation.

### Phase 2: Stability & Integration
*   [x] **Frontify Integration:** Researched strategy (iframe/embed) and implemented "Copy Embed Code" feature.
*   [x] **Generator Stability:** Fixed WebGL context handling, memory leaks, and added unit tests (Jest).
*   [x] **UX Perfection:** Refined download workflow with Toast notifications and polished controls.
*   [x] **Asset Lockdown:** Verified adherence to hardcoded brand constants.

## 4. Active Roadmap

### Phase 3: Advanced Features & Refinement
*   [ ] **Advanced Export:** High-res PNG/SVG export refinement.
*   [ ] **Interactive Tutorials:** Guide users through the tool.
*   [ ] **Club Pilot:** Beta launch for student clubs.
*   [ ] **AI Exploration:** (Future) Event-specific background generation.

## 5. Recent Updates
- **[2026-04-07] Fullscreen Generator Reframed Around Bar-First Editing And Context Preview**:
    - Reworked the shared fullscreen prototype so the default editor stage now shows only the bar, with the surrounding terminal panes confined to a fixed grid instead of floating over the artwork.
    - Added a top-level `editor / preview` mode toggle in `generator-shared/fullscreenGenerator.js` and `generator-shared/fullscreen-generator.css`; `preview` hides the editor panes and shows the full RPI logo in-context, while `editor` restores the bar-only workspace.
    - Moved export actions into a dedicated bottom output pane beneath the stage and added terminal-style zoom controls (`-`, `+`, and `reset`) there so output actions live in one consistent location.
    - Forced the preview-mode logo treatment to match the active red warning-terminal art direction on black, while preserving the existing export path and bar parameter editing model underneath.
- **[2026-04-07] Fullscreen Generator Shifted Toward Red Warning-Terminal Styling**:
    - Restyled `generator-shared/fullscreen-generator.css` toward the supplied warning-popup / retro alert-terminal references instead of the plainer red terminal pass.
    - The current fullscreen shell now leans on stacked alert-window outlines, denser red scanlines, dotted ambient grids, deeper maroon-black backgrounds, and sharper monochrome-red box treatments.
    - Kept the interaction model unchanged during this pass so the prototype still exposes only the required minimal boxes around the central preview stage.
- **[2026-04-06] Fullscreen Generator Reset Around `/animation` Handoff And Simpler Docks**:
    - Replaced the previous red-heavy terminal command-deck treatment in `generator-shared/fullscreenGenerator.js` and `generator-shared/fullscreen-generator.css` after design review showed the UI chrome had become too dense and visually noisy.
    - The fullscreen experience now starts by playing the existing `/animation/` route in an overlayed iframe on a black field rather than opening directly into the editor shell.
    - After the animation settles on the terminal-text RPI mark, the hidden generator now overlays a matching terminal-text logo in the same stage position, fades a real white SVG logo in directly on top of it, then funnels sampled terminal glyphs outward into the UI dock regions during the handoff.
    - Simplified the fullscreen editor shell to a large central preview stage plus two restrained side docks, removing the earlier command string, event log, telemetry grid, and oversized title treatment.
    - Shifted the active controls toward a mixed language: terminal-style labeling and framing remain, but the actual sliders now use darker, more physical progress bars inspired by the supplied reference image instead of flat terminal widgets.
    - Kept the focused fullscreen feature scope at `ruler`, `ticker`, `waveform`, and `circles`, and preserved the shared SVG/PNG export path plus existing URL-state semantics so the visual reset does not fork rendering logic.
- **[2026-04-07] Fullscreen Generator Reduced Again To Minimal Terminal Boxes**:
    - Removed the remaining “product UI” framing from the shared fullscreen prototype after further review; the editor now uses only the required terminal-styled interaction boxes around the central logo stage.
    - Collapsed the prior multi-dock layout into three minimal terminal boxes: one combined `system / palette` box, one `active system` controls box, and one `output` box for readouts and exports.
    - Restyled the whole shell back toward a harder terminal language: mono typography everywhere, black surfaces, RPI-red borders and labels, flatter box geometry, and reduced glass / glossy treatment.
    - Added a centered terminal-style `skip intro` button to the onboarding overlay so the animation-to-handoff sequence can be bypassed immediately without waiting through the full intro timing.
- **[2026-04-04] Shared Fullscreen Generator Rebuilt As A Terminal-Native Experience**:
    - Replaced the earlier shared fullscreen generator shell in `generator-shared/fullscreenGenerator.js` and `generator-shared/fullscreen-generator.css` with a new terminal-first interface rather than iterating on the previous panel treatment.
    - Kept the focused fullscreen feature scope at `ruler`, `ticker`, `waveform`, and `circles`, and preserved the existing URL-state contract plus shared SVG/PNG export pipeline so the new experience does not fork bar-rendering logic.
    - Rebuilt the fullscreen UI around a live command deck, terminal-style system selection, palette switching, keyboard shortcuts, event log, and focused telemetry panels, while keeping the edited logo itself rendered as official vector geometry instead of ASCII art.
    - Added a drifting terminal projection background plus a refreshed boot overlay that still performs an ASCII-to-vector handoff inspired by the isolated `/animation` motion study without turning the editor surface itself into text art.
    - Differentiated the two fullscreen routes through layout behavior rather than separate logic: `/generator-command-deck` stays a three-column terminal deck, while `/generator-panel-mosaic` now promotes the stage first and drops the side panels beneath it.
    - Updated the route metadata in `generator-command-deck/index.html` and `generator-panel-mosaic/index.html` so the hidden prototypes now describe themselves as terminal deck / terminal mosaic experiences.
- **[2026-04-04] Hidden Fullscreen Generator Routes Added At `/generator-command-deck` And `/generator-panel-mosaic`**:
    - Added two new hidden fullscreen generator routes that do not modify the current `/` application shell or the existing `/animation` motion lab.
    - Implemented a shared route foundation in `generator-shared/fullscreenGenerator.js` and `generator-shared/fullscreen-generator.css` so both hidden routes reuse the same onboarding, state model, preview rendering, export logic, and focused v1 feature set while differing only in layout language.
    - Built the shared generator state model around the focused v1 systems `ruler`, `ticker`, `waveform`, and `circles`, preserving the existing overlapping parameter names and color-mode values used by the main generator's URL/export semantics.
    - Wired the hidden routes to the existing shared SVG bar generator in `js/utils/barPattern.js` and carried over the current circle-packing/export semantics needed for `circles`, rather than inventing a parallel rendering path.
    - Added an autoplay onboarding overlay that uses terminal-style typed boot output, resolves to an ASCII rendering of the RPI mark, then hands off to a real high-resolution vector logo preview and reveals the fullscreen editor panels.
    - Implemented SVG as the primary export and PNG as the secondary export directly from the hidden routes, with the editable preview staying non-terminal and built from the official logo geometry after onboarding completes.
    - Created two distinct fullscreen layout treatments on top of the same feature set: a cleaner `command deck` variant and a denser `panel mosaic` variant inspired by instrumentation/dashboard references.
    - Reworked the initial fullscreen-generator presentation away from the earlier glass-panel/dashboard treatment and aligned the hidden routes to the `/animation` terminal language instead: black field, RPI-red mono/pixel UI chrome, scanline overlays, darker telemetry modules, and terminal-style controls throughout.
    - Shifted the hidden routes to `RPIGeistMono` plus `GeistPixelSquare` for a more consistent terminal voice, while keeping the central edited logo itself real vector output rather than ASCII art.
    - Changed the hidden-route default preview pairing to `white-on-black` so the first post-onboarding editor state lands closer to the terminal study instead of a bright white artboard.
    - Removed the flowing `/animation` iframe from the hidden-route onboarding handoff and replaced it with a calmer static terminal logo field before the particle funnel, reducing the wave-like motion in the intro while preserving the terminal aesthetic.
- **[2026-04-03] Animated Terminal Logo Study Added At `/terminal-logo`**:
    - Added a standalone prototype page at `/terminal-logo` for an animated, black-background RPI logo study built from moving pixel-text rows rather than the main generator's p5.js rendering path.
    - Used the supplied `RPI-logo-5.svg` geometry as the masking shape so the terminal-text fill stays locked to the official logo silhouette and bar proportions.
    - Styled the page around the local `GeistPixel-Square` font with restrained scanlines, a shallow tilted text field, white-on-black terminal contrast, and a light RPI red glow instead of introducing non-brand colors.
    - Added lightweight per-row drift and mutation logic in plain JavaScript so the study can be transplanted to other static surfaces without bringing over the main generator runtime.
    - Kept the route isolated from the generator shell and updated the GitHub Pages deployment workflow so the prototype ships with the rest of the static site.
- **[2026-03-31] GitHub Pages Deployment Added For Frontify Embed Hosting**:
    - Added a GitHub Actions workflow at `.github/workflows/deploy-pages.yml` to publish the static generator to GitHub Pages from `main`.
    - Scoped the Pages artifact to the actual site files (`index.html`, `assets`, `css`, `js`, `animation`, and `favicon.ico`) instead of publishing the whole repository.
    - Fixed the hidden `/animation` route's back-link so it works correctly when the site is served from the GitHub Pages project-site path `/rpi-logo-generator/`.
    - Updated deployment and integration documentation so Frontify embeds can target the published GitHub Pages URL immediately.
- **[2026-03-24] Hidden Animation Prototype Added At `/animation`**:
    - Added a standalone experimental page at `/animation` so new experience ideas can be explored without coupling prototype motion work to the main generator shell.
    - The current `/animation` surface on the `codex/animation-pattern-cycle` draft branch now derives its terminal grid from the live viewport dimensions so the motion study fills the screen more reliably across display sizes.
    - Presentation remains black background, RPI red glyphs, and the local `RPIGeistMono` font, with smaller type and a denser grid to increase code-like texture and improve terminal-art stability.
    - The draft animation now flies terminal-text particles in from offscreen to form the initial full-screen `RPI_Pattern_1.svg` composition, then cycles through the imported pattern SVG set with quicker morphs and subtle side-to-side motion inside each pattern.
    - Imported additional pattern assets for the cycle study: `Style=Circles 2`, `Style=Circles Gradient 1`, `Style=Fibonacci Sequence`, `Style=Ruler IN`, `Style=Ticker Sm`, `Style=Triangle Grid 1`, `Style=Triangles 1`, `Style=Union`, and `Style=Wave_ Quantum`.
    - Removed the earlier random background-noise treatment around the active bars and replaced it with a stable aura/force-field layer of nearby terminal characters so transitions stay cleaner and do not visibly reset between pattern changes.
    - Slowed and smoothed the overall sequence by lengthening hold and morph timings, softening the per-pattern lateral motion, and inserting a Geist Pixel Square ASCII title stage that spells `THE BAR GENERATOR` before the final morph into the supplied `RPI-logo-5.svg`.
    - Strengthened the morph feel with a magnetic snap/overshoot in particle travel so each transition lands more satisfyingly without abrupt resets.
    - Kept the prototype hidden from the primary UI and implemented it as a static subdirectory route so it works cleanly with the repo's simple static-server workflow.
- **[2026-03-24] Embed-First UI Refactor For Frontify Context**:
    - Reworked the generator layout away from a persistent in-app left sidebar and toward an embed-friendly control dock, so the tool no longer visually competes with Frontify's existing page navigation.
    - Split canvas appearance from interface appearance: canvas color modes now affect only the artwork/canvas frame, while overall UI dark mode is a separate interface preference.
    - Simplified the control language by removing non-essential status copy and shifting the UI toward concise labels and direct controls.
    - Rebalanced typography toward `RPIGeist` for interface elements and reserved `RPIGeistMono` for smaller technical moments, reducing the developer-tool feel while staying inside the RPI type system.
    - Kept mobile access via an overlay control sheet and retained keyboard/focus handling for the compact controls experience.
- **[2026-03-24] Subagent Policy Aligned To Official Codex Docs**:
    - Added a dedicated subagent workflow section to root `AGENTS.md` based on the official OpenAI Codex subagents documentation.
    - Clarified that subagents help reduce context pollution by offloading noisy exploration, logs, tests, and summarization work from the main thread.
    - Added explicit guidance to prefer subagents for read-heavy parallel tasks, be cautious with write-heavy parallel edits, and choose model/reasoning settings by task depth.
    - Clarified that Codex should only use subagents when the user explicitly asks for subagents, delegation, or parallel agent work.
- **[2026-03-17] Client-First Policy Consolidation Completed**:
    - Added root `AGENTS.md` as the canonical repo instruction file so Codex agents launched from the repo root now receive the correct policy.
    - Adopted a repo-specific Client-First system based on the supplied quick guide, adapted for Vanilla HTML/CSS/JS instead of copied Webflow mechanics.
    - Merged the full legacy `project_standards` and `rpi-brand-guidelines` requirements into root `AGENTS.md` so no prior agent rules were dropped during consolidation.
    - Added the explicit bar-governance rule to `AGENTS.md`: bars must stay scientifically accurate, related reference markdown files must be updated, and function must win over form.
    - Converted `.agent/rules/*`, `references/AGENTS.md`, and `.codex/config.toml` away from duplicated rule text to lightweight compatibility references so instructions do not drift.
- **[2026-02-17] Stability Pass In Progress**:
    - Fixed ticker width ratio label binding bug in `main.js` (`#ticker-width-ratio-display` now updates correctly).
    - Consolidated SVG bar pattern export logic into shared utility `js/utils/barPattern.js` to prevent drift between files.
    - Added waveform and circles SVG export parity in the shared generator (including circles grid/packing and fill/stroke variants).
    - Added regression tests for shared SVG bar generation and ticker width ratio display behavior.
- **[2026-02-12] Phase 2 Completed**:
    - Implemented Toast notification system for better UX.
    - Added "Copy Embed Code" feature for Frontify integration.
    - Fixed WebGL context handling and memory leaks.
    - Set up Jest testing framework.
    - Created Frontify integration strategy document.

## 6. Design Decisions
*   **Profanity Filter:** Implemented client-side for immediate feedback and user privacy.
*   **Font Format:** Chosen `.woff2` for optimal web performance.
*   **Global Access:** `ProfanityFilter` attached to `window` for p5.js compatibility.
*   **Frontify Integration:** Chosen external iframe embedding as the initial integration strategy for simplicity and speed.
*   **Static Hosting:** GitHub Pages via GitHub Actions is now the default deployment path for the embedable generator, with the published project-site URL serving as the initial Frontify iframe target.
*   **Embed-First Controls:** Desktop controls should behave like a docked tool surface inside the Brand Hub content area, not like a second site sidebar; mobile may use an overlay sheet when space is constrained.
*   **Export Consistency:** Introduced shared SVG bar pattern generator (`js/utils/barPattern.js`) as single source of truth for non-solid bar exports.
*   **Agent Policy Source Of Truth:** Root `AGENTS.md` is now the canonical instruction surface for repo-scoped agents; compatibility rule files should reference it instead of duplicating policy text.
*   **Client-First Adaptation:** The project now applies a repo-specific Client-First system that keeps global utilities reusable, new custom classes underscore-scoped, JS hooks separate from style classes, and structural wrappers semantic and readable.
*   **Prototype Route Isolation:** Experimental experience concepts may ship as standalone static subdirectory routes, allowing direct URLs such as `/animation` without entangling the main generator's p5.js application shell.
*   **Terminal Mask Rendering:** Terminal-logo studies may render animated DOM text through an official-logo mask on isolated routes when the effect is purely presentational and does not alter export logic or the main generator.
*   **Animation-Led Fullscreen Handoff:** The shared fullscreen generator now opens with a terminal-style intro and transitions from terminal text into a real SVG preview while glyph particles funnel outward into the minimal terminal interaction boxes.

## 7. Known Issues / Notes
*   `main.js` relies heavily on global variables (p5.js pattern). Future refactoring might consider modularizing this.
*   Previously identified issue where ticker width ratio display failed to update has been resolved (2026-02-17).
*   Previously identified SVG export drift between `main.js` and `drawing.js` has been addressed by shared utility (2026-02-17).
