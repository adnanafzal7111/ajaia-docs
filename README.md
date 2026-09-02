# Ajaia Docs — Collaborative Document Editor

A lightweight Google Docs-inspired collaborative document editor built with Next.js 14, TipTap, Prisma, and SQLite.

## Quick Start

### Prerequisites
- Node.js 18+
- npm

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Set up the database
npm run db:push

# 3. Seed demo users
npm run db:seed

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Demo Accounts
All accounts use password: `password123`

| Name          | Email              |
|---------------|--------------------|
| Alice Johnson | alice@ajaia.com    |
| Bob Smith     | bob@ajaia.com      |
| Carol White   | carol@ajaia.com    |

## Features

### Document Creation & Editing
- Create new documents from dashboard
- Rich text editor with toolbar: **Bold**, *Italic*, <u>Underline</u>, H1/H2/H3, Bullet Lists, Numbered Lists, Undo/Redo
- Auto-save with 1.5s debounce — edits save automatically
- Rename documents inline (click title, edit, click away)

### File Upload
- Upload `.txt`, `.md`, or `.docx` files from the dashboard
- Files are converted to editable documents automatically
- `.docx` files parsed via `mammoth` library
- `.md` files converted from Markdown to HTML
- Unsupported file types show a clear error message

### Sharing
- Share any document you own via email address
- Shared documents appear in a distinct "Shared with Me" section (green cards vs blue owned cards)
- Remove access at any time from the Share panel in the editor
- Owners see a Share button; shared users see "Shared by [name]" badge

### Persistence
- SQLite database via Prisma ORM
- All documents, users, and shares persist across restarts
- Rich text content preserved as HTML

## Running Tests

```bash
npm test
```

## Project Structure

```
src/
  app/
    api/           # Next.js API routes
      documents/   # CRUD for documents
      share/       # Share/unshare logic
      upload/      # File upload handler
      users/       # List users for sharing
      auth/        # NextAuth.js endpoints
    dashboard/     # Document list page
    doc/[id]/      # Editor page
    login/         # Auth page
  components/
    editor/        # TipTap rich text editor
  lib/
    prisma.ts      # Prisma client singleton
    auth.ts        # NextAuth config
  __tests__/       # Jest unit tests
prisma/
  schema.prisma   # Database schema
  seed.ts         # Demo user seeder
```

## Supported File Types for Upload
| Extension | Description              | Behavior                          |
|-----------|--------------------------|-----------------------------------|
| `.txt`    | Plain text               | Each line wrapped in `<p>` tags   |
| `.md`     | Markdown                 | Headers, bold, italic, lists converted |
| `.docx`   | Word document            | Full HTML conversion via mammoth  |

All other file types are rejected with a clear error message.

## Environment Variables

| Variable          | Description                        | Default                    |
|-------------------|------------------------------------|----------------------------|
| `DATABASE_URL`    | SQLite database path               | `file:./dev.db`            |
| `NEXTAUTH_SECRET` | JWT signing secret                 | Set in `.env.local`        |
| `NEXTAUTH_URL`    | App URL                            | `http://localhost:3000`    |
