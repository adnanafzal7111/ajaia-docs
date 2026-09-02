# Architecture Note — Ajaia Docs

## What I Prioritized and Why

### Stack Choices
- **Next.js 14 (App Router)**: Unified full-stack in one repo, zero backend config, easy Vercel deploy. Eliminates the overhead of a separate Express/FastAPI server.
- **TipTap**: Production-ready ProseMirror-based editor with a React-friendly API. Extensible, well-documented, and ships exact features needed (bold/italic/underline/headings/lists/undo) without building from scratch.
- **Prisma + SQLite**: Zero external dependencies for the database. SQLite is perfect for this scope — no Postgres server to spin up, still fully relational with foreign keys and cascading deletes.
- **NextAuth.js (Credentials provider)**: Handles session management, JWT tokens, and CSRF without building auth from scratch. Using seeded demo accounts keeps scope tight while making sharing fully demonstrable.
- **Tailwind CSS**: Fastest path to a clean, consistent UI without writing CSS files.

### Feature Prioritization
1. **Core editing loop first** (create → edit → auto-save → reopen): This is the product's primary value proposition. Got this right before adding sharing.
2. **Auto-save with debounce** (1.5s): Better UX than a manual Save button. Content is never lost.
3. **Sharing model**: Simple but correct — owner/shared roles, email-based invite, revoke access. No role tiers (view-only vs edit) — that would require more UI complexity for limited return in this scope.
4. **File upload**: Three formats (.txt, .md, .docx) that cover 90% of real-world import needs. DOCX handled via `mammoth` which does HTML conversion server-side.

### What I Cut
- **Real-time collaboration** (WebSockets/CRDTs): Significant infrastructure complexity (Liveblocks, Yjs, or a custom sync server). Out of scope for the timebox.
- **Role-based permissions** (view-only vs edit): Would require more data model complexity and UI state management.
- **PDF export**: Requires a headless browser or paid service.
- **Version history**: Needs a document revision table and diff UI.
- **Email notifications for shares**: Requires an email provider.

### Data Model
```
User --< Document (one-to-many, owner)
User --< DocumentShare >-- Document (many-to-many, access grants)
```
- Access check runs on every document read/write: owner OR has a DocumentShare row
- Cascade delete on DocumentShare when Document is deleted

### Security Decisions
- All API routes verify session before any DB query
- Share routes verify document ownership before granting/revoking access  
- Passwords hashed with bcrypt (10 rounds)
- JWT stored in httpOnly cookie via NextAuth

### Auto-Save Design
Content changes → 1.5s debounce → PATCH /api/documents/[id]
Title changes → onBlur → PATCH /api/documents/[id]
This pattern avoids excessive writes while ensuring no data loss.
