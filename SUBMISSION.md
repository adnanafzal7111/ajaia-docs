# Submission — Ajaia Docs

## What Is Included

| File/Folder        | Description                                      |
|--------------------|--------------------------------------------------|
| `src/`             | Full Next.js application source code             |
| `prisma/`          | Database schema and seed script                  |
| `README.md`        | Setup instructions, demo accounts, feature guide |
| `ARCHITECTURE.md`  | Technical decisions and prioritization rationale |
| `AI_WORKFLOW.md`   | AI tool usage, what changed, verification notes  |
| `SUBMISSION.md`    | This file                                        |
| `.env.local`       | Local environment variables (pre-configured)     |
| `package.json`     | All dependencies                                 |

## What Is Working (End-to-End)
- ✅ Login with seeded demo accounts (Alice, Bob, Carol)
- ✅ Create new documents
- ✅ Rename documents (inline title edit, saves on blur)
- ✅ Rich text editing: Bold, Italic, Underline, H1/H2/H3, Bullet List, Numbered List, Undo/Redo
- ✅ Auto-save content (1.5s debounce, visual feedback)
- ✅ Documents persist across page refresh and session restart
- ✅ Upload .txt, .md, .docx files → converted to editable documents
- ✅ Share a document by email address
- ✅ Revoke sharing access
- ✅ Dashboard shows "My Documents" (blue) vs "Shared with Me" (green) distinctly
- ✅ Shared users see "Shared by [name]" badge in the editor
- ✅ Delete documents (owner only)
- ✅ Unit tests (Jest) — run with `npm test`

## What Is Incomplete / Not Built
- ❌ Real-time collaboration (would need WebSockets/CRDT)
- ❌ View-only vs edit sharing permissions (intentionally cut for scope)
- ❌ PDF export (requires headless browser)
- ❌ Document version history
- ❌ Email notifications for shares
- ❌ Live deployment URL (local only — see README for setup)

## What I Would Build Next (2–4 More Hours)
1. **Vercel deployment** + PostgreSQL (via Supabase free tier)
2. **View-only sharing permissions** — add a `permission` field to DocumentShare ('view' | 'edit')
3. **Document search** — basic title search on dashboard
4. **Export to Markdown** — serialize TipTap HTML back to Markdown

## Demo Accounts
| Name          | Email              | Password     |
|---------------|--------------------|--------------|
| Alice Johnson | alice@ajaia.com    | password123  |
| Bob Smith     | bob@ajaia.com      | password123  |
| Carol White   | carol@ajaia.com    | password123  |

**Sharing test flow**: Log in as Alice → create a doc → share with bob@ajaia.com → log out → log in as Bob → see it in "Shared with Me"
