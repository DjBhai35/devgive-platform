import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const claims = await prisma.freeClaim.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, username: true } },
        project: { select: { id: true, title: true, slug: true, youtubeRequiredDuration: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ claims });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch free claims' },
      { status: 500 }
    );
  }
}
