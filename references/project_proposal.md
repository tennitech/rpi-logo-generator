# RPI Logo Generator & Design Hub - Agent Context

## 1. Project Overview

**Core Mission:**
Refactor the existing "Building the New" prototype (Vanilla JS/WebGL) into a production-ready **Design Hub**. The goal is to move from an isolated logo tool to a "Canva-like" web platform where students/faculty can create brand-compliant assets (logos, flyers, social headers). 

---

## 2. Technical Stack & Architecture

* 
**Frontend Core:** Vanilla JS / WebGL (Refactoring existing prototype). 


* 
**Integration:** Must integrate with RPI's central Brand Hub infrastructure. 


* 
**AI Backend:** Service required for "Event-Specific Backgrounds." 


* 
*Providers:* OpenAI, Gemini, or Stable Diffusion. 


* 
*Strategy:* Strict system prompting/engineering. 




* 
**Licensing:** Open Source (MIT/Apache). 



---

## 3. Development Rules & Constraints

When generating code or suggesting features, adhere to these strict guidelines:

### A. Brand Compliance (Crucial)

* 
**Strict Adherence:** All generated outputs must strictly adhere to university brand guidelines. 


* **Hard-coded Assets:** RPI official colors, fonts, and "Abstract Patterns/Bars" must be hard-coded into the editor. Users cannot deviate from these parameters. 


* 
**Visual Style:** Output must match RPI's "graphic art" style, utilizing duotones, halftones, and abstract pattern overlays. 



### B. Safety & Accessibility

* 
**Profanity Filter:** A robust text-filtering system is required to prevent inappropriate words in the "Bar" data visualization. 


* 
**WCAG Compliance:** The tool must meet accessibility standards (screen readers, contrast, keyboard navigation) to function as an official university tool. 



### C. Legal

* 
**Asset Rights:** Ensure all fonts and brand libraries utilized have finalized usage rights. 



---

## 4. Feature Implementation Roadmap

### Phase 1: February - Foundation & Safety
* [x] **Repo Setup:** Finalize licensing and clean up "Upstatement" prototype code. 
* [x] **Integration:** Established technical pathway (local dev environment active). 
* [x] **Guardrails V1:** Implemented profanity/text-filtering for the data visualizer. 
* [x] **UI Refactor:** Shifted UI to "workspace" feel with sidebar and header controls.

### Phase 2: March - The "Canvas" Core (Partial Completion)
* [x] **Accessibility Audit:** Updated for screen readers and contrast (semantic HTML, ARIA). 
* [x] **Visual Polish:** Implemented custom dropdowns and refined "Download" actions.
* [ ] **Canvas Prototype:** Build drag-and-drop interface with standard canvas sizes (e.g., Instagram, 8.5x11). 
* [ ] **Asset Lockdown:** Integrate hard-coded brand libraries (colors/fonts) to prevent user deviation. 



### Phase 3: April - AI & Expansion

* [ ] **AI Backgrounds:** Implement backend API to generate backgrounds based on user subject (e.g., "Chess") but styled with RPI aesthetics (duotone/halftone). 


* [ ] **Pattern Overlays:** Feature to overlay standard RPI "Bars" onto generated images. 


* [ ] **Club Pilot:** Launch beta for student clubs. 



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