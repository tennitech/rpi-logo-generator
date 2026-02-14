# RPI Logo Generator & Design Hub - Agent Context

## 1. Project Overview

**Core Mission:**
Refactor the existing "Building the New" prototype (Vanilla JS/WebGL) into a production-ready **Design Tool**. The goal is to move from an isolated prototype to an integrated tool within RPI's central Brand Hub where students and faculty can generate unique, brand-compliant RPI "Bar" logos and lockups.

**The Solution:**
We will refactor the existing Vanilla JS/WebGL codebase to integrate with RPI's central Brand Hub. Key technical innovations include:

*   **Safety & Compliance:** Implementing profanity filters and accessibility (WCAG) guardrails to ensure generated content is appropriate for public use.
*   **Brand Hub/Frontify Integration:** Implement this solution in a way that is stable and seamless enough to handle the number of monthly average users that visit the brand hub. Templates for flyers, social media headers, and posters will be implemented through Frontify directly, not this project.
*   **Perfecting the Generator:** Focusing on the core "Bar" generator to ensure the workflow is intuitive, stable, and produces high-quality assets that can be easily used within the broader Brand Hub ecosystem.
*   **Licensing & Legal Requirements:** The RPI logo is a protected mark. The school’s legal council will be consulted to ensure that any RPI logo created by this software will be automatically protected under the necessary copyright.
*   **Expanded Functionality (Future/TBD):** Exploration of new bar design algorithms that reflect existing research on campus, or AI-assisted generation, strictly prioritized *after* the core generator is stable and integrated.

---

## 2. Technical Stack & Architecture

*   **Frontend Core:** Vanilla JS / WebGL (Refactoring existing prototype).
*   **Integration:** Must integrate with RPI's central Brand Hub infrastructure (Frontify).
*   **Licensing:** Open Source (MIT/Apache).

---

## 3. Development Rules & Constraints

When generating code or suggesting features, adhere to these strict guidelines:

### A. Brand Compliance (Crucial)

*   **Strict Adherence:** All generated outputs must strictly adhere to university brand guidelines.
*   **Hard-coded Assets:** RPI official colors, fonts, and "Abstract Patterns/Bars" must be hard-coded into the editor. Users cannot deviate from these parameters.
*   **Visual Style:** Output must match RPI's "graphic art" style, utilizing duotones, halftones, and abstract pattern overlays.

### B. Safety & Accessibility

*   **Profanity Filter:** A robust text-filtering system is required to prevent inappropriate words in the "Bar" data visualization.
*   **WCAG Compliance:** The tool must meet accessibility standards (screen readers, contrast, keyboard navigation) to function as an official university tool.

### C. Legal

*   **Asset Rights:** Ensure all fonts and brand libraries utilized have finalized usage rights.

---

## 4. Feature Implementation Roadmap

### Phase 1: February - Foundation & Safety
* [x] **Repo Setup:** Finalize licensing and clean up "Upstatement" prototype code.
* [x] **Integration:** Established technical pathway (local dev environment active).
* [x] **Guardrails V1:** Implemented profanity/text-filtering for the data visualizer.
* [x] **UI Refactor:** Shifted UI to "workspace" feel with sidebar and header controls.

### Phase 2: March - Stability & Integration (Revised)
* [x] **Accessibility Audit:** Updated for screen readers and contrast (semantic HTML, ARIA).
* [x] **Visual Polish:** Implemented custom dropdowns and refined "Download" actions.
* [ ] **Frontify Integration Strategy:** Define and implement the technical integration with the Brand Hub.
* [ ] **UX Refinement:** Perfect the workflow for logo creation and "Download" assets. Ensure clear user feedback and intuitive controls.
* [ ] **Stress Testing:** Ensure the generator is stable under expected load.

### Phase 3: April - Advanced Features (TBD)
* [ ] **Bar Algorithms:** Explore creating new bar design algorithms.
* [ ] **Club Pilot:** Launch beta for student clubs (focused on logo generation).

### Phase 4: May - Polish & Hand-off
* [ ] **Optimization:** WebGL performance tuning and bug fixes.
* [ ] **Documentation:** Finalize docs for RCOS and Marketing & Communications hand-off. 



---

## 5. Agent Instructions for Code Generation

1. 
**Prompt Engineering:** When writing AI backend logic, prioritize "strict prompt engineering" to force the visual output into the RPI aesthetic (halftones/abstracts). 


2. 
**Web Standards:** Prioritize Vanilla JS refactoring over introducing heavy frameworks unless necessary for the "Canvas" state management. 


3. 
**User Experience:** Design the interface to bridge the gap between "complex generative code" and "everyday utility." 