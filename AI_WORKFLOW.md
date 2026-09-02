# AI Workflow Note

## Tools Used
- **Antigravity (Google DeepMind)** — primary AI coding assistant used throughout this build

## Where AI Materially Sped Up My Work

### 1. Boilerplate Elimination (~40% time savings)
AI generated the Prisma schema, NextAuth config, and API route structure in minutes rather than hours of documentation reading. The `checkAccess()` helper pattern for authorization came from the AI as a clean abstraction.

### 2. TipTap Integration
TipTap's extension-based API requires knowing which packages to import. AI correctly identified the exact extension list needed (Document, Paragraph, Text, Bold, Italic, Underline, Heading, BulletList, OrderedList, ListItem, History) without me reading all the docs.

### 3. File Upload Parsing
The mammoth integration for DOCX-to-HTML conversion and the basic Markdown-to-HTML regex transform were AI-generated. I validated these work correctly on test files.

### 4. Component Structure
AI scaffolded the TipTapEditor toolbar component with the `ToolbarBtn` abstraction — clean, consistent pattern I would have written similarly but faster with AI assistance.

## What AI-Generated Output I Changed or Rejected

### Changed:
- **Auto-save debounce**: AI initially suggested 500ms debounce. I increased to 1500ms — too many PATCH requests at 500ms for a production-realistic scenario.
- **Markdown converter**: AI's initial regex was too simplistic and broke on edge cases. I rewrote the line-by-line processing logic with a `.split('\n').map()` approach instead of chained `.replace()` calls.
- **Error handling**: AI's initial route handlers had minimal error messaging. I added specific error messages for "User not found", "Cannot share with yourself", file type validation, etc.
- **UI distinction for shared docs**: AI put shared docs in the same grid as owned. I changed to a separate section with different color (green vs blue) to make the distinction visually clear.

### Rejected:
- **Supabase suggestion**: AI initially suggested Supabase for the database. I rejected this — it requires account setup, making reviewer setup harder. SQLite is zero-config.
- **Complex markdown parser**: AI suggested importing a full `marked` or `remark` library for MD conversion. Rejected as overkill; a basic regex transform handles the common cases with no extra dependency.
- **Role-based permissions UI**: AI suggested a dropdown (Owner / Can Edit / Can View) for shares. Rejected — adds complexity without demonstrating meaningfully different behavior in this scope.

## How I Verified Correctness, UX Quality, and Reliability

### Functional Verification
- Manually traced each API route's auth check and data flow before accepting AI output
- Verified Prisma schema relationships match the access control logic (owner vs shared)
- Checked that `onDelete: Cascade` is set on DocumentShare so deleting a doc cleans up shares

### UX Review
- Evaluated the login page flow: demo account one-click fill reduces reviewer friction
- Checked that "Shared with Me" is visually distinct (green card + "Shared by X" label)
- Verified auto-save feedback loop (saving... → ✓ Saved) is clear without being intrusive
- Confirmed file type rejection message is specific ("Supported: .txt, .md, .docx")

### Reliability
- Debounced auto-save prevents race conditions from rapid typing
- `upsert` on DocumentShare prevents duplicate share rows
- `saveTimer.current` ref properly clears between saves to prevent memory leaks
- Loading states prevent double-clicks on create/upload buttons

## Summary Assessment
AI was most valuable for: scaffolding known patterns quickly, API route boilerplate, package selection.
AI required human judgment for: UX decisions (how to show shared vs owned), debounce tuning, error message specificity, dependency minimization.
