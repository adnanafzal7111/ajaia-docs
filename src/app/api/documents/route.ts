import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [owned, shared] = await Promise.all([
    prisma.document.findMany({
      where: { ownerId: session.user.id },
      orderBy: { updatedAt: 'desc' },
      select: { id: true, title: true, updatedAt: true, ownerId: true },
    }),
    prisma.documentShare.findMany({
      where: { userId: session.user.id },
      include: {
        document: {
          select: {
            id: true, title: true, updatedAt: true, ownerId: true,
            owner: { select: { name: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return NextResponse.json({
    owned,
    shared: shared.map(s => ({ ...s.document, sharedBy: s.document.owner })),
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const doc = await prisma.document.create({
    data: {
      title: body.title || 'Untitled Document',
      content: body.content || '',
      ownerId: session.user.id,
    },
  });
  return NextResponse.json(doc, { status: 201 });
}
