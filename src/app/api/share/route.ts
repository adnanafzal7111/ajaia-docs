import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { documentId, email } = await req.json();
  if (!documentId || !email) return NextResponse.json({ error: 'documentId and email required' }, { status: 400 });

  const doc = await prisma.document.findUnique({ where: { id: documentId } });
  if (!doc || doc.ownerId !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const target = await prisma.user.findUnique({ where: { email } });
  if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  if (target.id === session.user.id) return NextResponse.json({ error: 'Cannot share with yourself' }, { status: 400 });

  const share = await prisma.documentShare.upsert({
    where: { documentId_userId: { documentId, userId: target.id } },
    update: {},
    create: { documentId, userId: target.id },
  });
  return NextResponse.json(share, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { documentId, userId } = await req.json();
  const doc = await prisma.document.findUnique({ where: { id: documentId } });
  if (!doc || doc.ownerId !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await prisma.documentShare.deleteMany({ where: { documentId, userId } });
  return NextResponse.json({ success: true });
}
