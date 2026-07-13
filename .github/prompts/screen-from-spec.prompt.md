---
mode: agent
description: Generate a screen from a spec in specs/
---

Implement the screen described in the spec file I reference (in `specs/`).

Rules:
- Follow the spec exactly: purpose, elements, empty/loading/error states. If the spec is missing a state, ask before inventing it.
- Use existing shadcn/ui components and the design tokens from the Tailwind theme — no one-off colors or radii.
- Every user-facing string via next-intl: add keys to both `da` and `en` message files.
- Mobile-first. Verify the layout works at 375px width.
- After implementing, list which spec lines map to which components, and update `PROGRESS.md` "Last session" / "Next up".
