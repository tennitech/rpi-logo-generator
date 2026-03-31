# Frontify Integration Strategy

**Goal:** Seamlessly integrate the RPI Logo Generator into the RPI Brand Hub (powered by Frontify).

## 1. Integration Methods

### A. Frontify Asset Creation API
*   **Description:** Use Frontify's API to upload generated assets directly to a specific "Library" or "Workspace".
*   **Pros:** Keeps everything in one place; users don't need to download/upload manually.
*   **Cons:** Requires API keys/authentication handling (OAuth2); might be complex for a client-side only app.
*   **Feasibility:** Moderate. Requires backend proxy or secure client-side flow (if supported).

### B. Frontify "Finder" (Embed SDK)
*   **Description:** Frontify offers an SDK to open a "Finder" window to pick assets.
*   **Relevance:** Less relevant for *generating* assets, more for *consuming* them.

### C. Custom Metadata Block (Frontify Content Block)
*   **Description:** Develop the generator as a custom "Content Block" that lives *inside* a Frontify style guide page.
*   **Pros:** Ultimate seamless experience. The tool exists on the brand page itself.
*   **Cons:** Requires developing within Frontify's specific specialized framework (Terrific.js / React integration).
*   **Feasibility:** High effort, high reward.

## 2. Recommended Approach: "The iframe / External Link" (Phase 1 of Integration)
Given the constraint of "Stability First" and "Vanilla JS":
1.  **Host** the generator on a stable URL.
2.  **Embed** via iframe or link directly from the Brand Hub navigation.
3.  **Manual Upload:** Users download the PNG and manually upload it to their Frontify libraries if needed.

### Current Hosting Recommendation
- **Immediate launch:** GitHub Pages project site at `https://tennitech.github.io/rpi-logo-generator/`
- **Frontify usage:** point the iframe `src` or external link at the published GitHub Pages URL
- **Future production hardening:** move to an RPI-owned subdomain if institutional hosting, analytics, or stricter change control becomes necessary

### Embedded UI Constraint
When the generator is embedded inside the Brand Hub, it should behave like a compact tool surface inside existing page chrome, not like a standalone application shell.

- Avoid introducing a second persistent left navigation/sidebar inside the embedded experience.
- Prefer docked top controls on desktop and an overlay sheet on smaller screens when space is limited.
- Keep canvas/output controls scoped to the generator itself and assume Frontify already provides surrounding navigation context.
- Treat interface appearance separately from artwork/canvas appearance to avoid confusing the host platform's navigation with the generator's output options.

## 3. Next Steps
1.  Enable GitHub Pages deployment from the repository's GitHub Actions workflow.
2.  Add the published GitHub Pages URL to the Frontify Brand Hub as an iframe embed or external tool link.
3.  Request API documentation for RPI's specific Frontify instance if direct asset upload becomes a requirement.
4.  Determine if "Custom Content Blocks" are allowed in RPI's plan before considering a V2 rebuild.
