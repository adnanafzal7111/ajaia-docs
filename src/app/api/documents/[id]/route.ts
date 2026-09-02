import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function checkAccess(docId: string, userId: string) {
  const doc = await prisma.document.findUnique({ where: { id: docId } });
  if (!doc) return null;
  if (doc.ownerId === userId) return { doc, role: 'owner' as const };
  const share = await prisma.documentShare.findUnique({
    where: { documentId_userId: { documentId: docId, userId } },
  });
  if (share) return { doc, role: 'shared' as const };
  return null;
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const access = await checkAccess(params.id, session.user.id);
  if (!access) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const doc = await prisma.document.findUnique({
    where: { id: params.id },
    include: {
      owner: { select: { name: true, email: true } },
      shares: { include: { user: { select: { id: true, name: true, email: true } } } },
    },
  });
  return NextResponse.json({ ...doc, role: access.role });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const access = await checkAccess(params.id, session.user.id);
  if (!access) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const body = await req.json();
  const updated = await prisma.document.update({
    where: { id: params.id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.content !== undefined && { content: body.content }),
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const doc = await prisma.document.findUnique({ where: { id: params.id } });
  if (!doc || doc.ownerId !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  await prisma.document.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
