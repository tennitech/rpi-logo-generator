# Project Standards Rule

Follow the repository root `AGENTS.md` first. This file is a compatibility shim for tools that read `.agent/rules/*`.

## Reinforcements

- `references/project_status.md` is the single source of truth for project status and architecture history.
- Update `references/project_status.md` when phases complete, architecture changes, or new known issues are found.
- Do not modify `references/project_proposal.md`.
- Stay on Vanilla HTML, CSS, and JavaScript unless the user explicitly approves a stack change and it is logged in `references/project_status.md`.
- Prefer ES modules for new utilities.
- Apply the Client-First class strategy from `AGENTS.md` to all new work:
  - global utilities use dash-only names
  - new custom classes use underscore folder-style names
  - JS hooks should use IDs or `data-*`, not styling utilities
