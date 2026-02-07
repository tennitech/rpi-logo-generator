# RPI Brand Guidelines & Development Rules

## 1. Core Identity
**RPI** (Rensselaer Polytechnic Institute) is a dynamic, generative brand centered on "Building the New."
*   **Motto:** "Why not change the world?" (implied) / "What if we tried this?"
*   **Archetype:** The specific "RPI" brand is **Curious, Humble, Genuine, Resilient, Offbeat, and Relatable**.
*   **Mission:** We cultivate exceptional problem-solvers. We don't just theorize; we build, test, break, and rebuild.

## 2. Naming Conventions
*   **Primary:** "RPI" (General use), "Rensselaer Polytechnic Institute" (Formal).
*   **Acceptable:** Using specific school names in lockups (e.g., "Rensselaer School of Engineering").
*   **PROHIBITED:**
    *   Do NOT use "Rensselaer" in isolation to refer to the university.
    *   Do NOT create new lockups for student clubs/projects (they use the primary logo alongside their name).

## 3. Voice & Tone
When generating text or creative copy:
1.  **Curious:** Ask "What if?" Focus on inquiry.
2.  **Humble:** Confidence without arrogance. Show, don't tell.
3.  **Genuine:** Sincere enthusiasm. No manufactured excitement.
4.  **Resilient:** Frame setbacks as learning opportunities.
5.  **Offbeat:** Celebrate unique, unexpected connections.
6.  **Relatable:** Accessible expertise. Down-to-earth.

**Avoid:**
*   Obvious statements (state the unconsidered).
*   Arrogance/Condescension.
*   Pretentiousness (academic snobbery).
*   Hyperbole (marketing fluff).

## 4. Visual Principles
### A. Spectrum: Background vs. Foreground
*   **Background (Supporting):** Formal, distraction-free. Low contrast patterns. Cool colors/Black/White.
*   **Foreground (Hero):** Attention-capturing (Social Media, Events). Full color activation. High contrast. Dynamic layouts.

### B. Authenticity
*   Use real imagery (students, labs) over stock.
*   Show the process/messiness of experimentation, not just polished results.

## 5. Logo Usage
*   **Primary Logo:** "RPI" letters with the "Bar" (underscore/calibration rod).
*   **The Bar:** A variable element. Can contain data viz, metrics, or patterns.
    *   *Constraint:* Height of bar = Width of lettering line. Fixed spacing.
*   **Clear Space:**
    *   Digital: Min 10px on all sides.
    *   Print: Min 0.25 inch.
*   **Minimum Size:**
    *   Digital: 60px width.
    *   Print: 0.75 inch width.
*   **Don'ts:**
    *   Never distortion or stretch.
    *   No outlines/shadows.
    *   No unapproved colors.
    *   Do not re-create the logo (use provided assets).

## 6. Development Constraints (From Project Proposal)
*   **Hard-coded Assets:** Users CANNOT deviate from official colors/fonts.
*   **Style:** "Graphic Art" – Duotones, Halftones, Abstract Patterns.
*   **Safety:** Profanity filter required for data visualizers.
*   **Tech Stack:** Vanilla JS / WebGL preferred. No heavy frameworks unless necessary.
*   **Accessibility:** WCAG compliance mandatory.

## 7. Technical Specifications
*   **Color Codes (from main.js):**
    *   **RPI Red:** `#d6001c`
    *   **White:** `#ffffff`
    *   **Black:** `#000000`
*   **Fonts:**
    *   **Logo:** Replica (Basis for the SVG assets).
    *   **UI/Body:** `RPIGeist` (Regular, Medium, Bold, Italic) and `RPIGeistMono` (Regular, Medium, Bold). Files located in `attached_assets/`.
*   **Assets:**
    *   SVGs located in `attached_assets/`.
    *   Shaders located in `shaders/` for the visual effects.
