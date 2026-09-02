import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get('file') as File | null;

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

  const ext = file.name.split('.').pop()?.toLowerCase();
  const allowedExts = ['txt', 'md', 'docx'];
  if (!allowedExts.includes(ext || '')) {
    return NextResponse.json(
      { error: 'Unsupported file type. Please upload .txt, .md, or .docx files only.' },
      { status: 400 }
    );
  }

  let content = '';

  if (ext === 'docx') {
    const mammoth = await import('mammoth');
    const bytes = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ buffer: Buffer.from(bytes) });
    content = result.value;
  } else {
    const text = await file.text();
    if (ext === 'md') {
      content = text
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/^- (.+)$/gm, '<li>$1</li>')
        .split('\n')
        .map(line => {
          if (line.startsWith('<h') || line.startsWith('<li')) return line;
          if (line.trim() === '') return '';
          return `<p>${line}</p>`;
        })
        .join('');
    } else {
      // plain text
      content = text
        .split('\n')
        .filter(l => l.trim())
        .map(l => `<p>${l}</p>`)
        .join('');
    }
  }

  const doc = await prisma.document.create({
    data: {
      title: file.name.replace(/\.(txt|md|docx)$/i, '') || 'Uploaded Document',
      content,
      ownerId: session.user.id,
    },
  });

  return NextResponse.json(doc, { status: 201 });
}
