# Project Standards & Agent Rules

## 1. Documentation Maintenance
*   **Master Doc:** `references/project_status.md` is the single source of truth for high-level project status.
*   **Update Rule:** You **MUST** update `references/project_status.md` whenever:
    *   A phase is completed.
    *   A significant architectural decision is made (e.g., adding a library, changing directory structure).
    *   New known issues are discovered.
*   **Separation:** Do NOT modify the original `project_proposal.md`. It serves as the historic requirements document.

## 2. Filenaming Conventions
Adhere to the following casing standards for new files:

*   **JavaScript:** `camelCase.js` (e.g., `profanityFilter.js`, `main.js`).
    *   *Exception:* Service Workers or Worklets may use `kebab-case` if idiomatic (e.g., `pulse-worklet.js`).
*   **HTML:** `kebab-case.html` (e.g., `index.html`, `about-page.html`).
*   **CSS:** `kebab-case.css` (e.g., `style.css`, `mobile-layout.css`).
*   **Assets:**
    *   Directories: `kebab-case` (e.g., `assets/fonts`).
    *   Files: `kebab-case` preferred for images/icons. Keep original naming for simplified font matching if necessary (e.g., `RPIGeist-Bold.woff2`).
*   **Markdown:** `snake_case.md` or `kebab-case.md` (e.g., `project_status.md`).

## 3. Code Style & Structure
*   **Imports:** Prefer ES6 Modules (`import`/`export`) for new utilities.
*   **Global State:** If modifying `main.js` (p5.js sketch), acknowledge global state usage but prefer modular utilities where possible.
*   **Frameworks:** We are currently **Vanilla JS**. Do not introduce build tools (Vite, Webpack) or frameworks (React, Next.js) without explicit user approval and a documented reason in `project_status.md`.
