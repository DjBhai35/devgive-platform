import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const downloads = await prisma.download.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, username: true } },
        project: { select: { id: true, title: true, slug: true, isPremium: true } },
      },
      orderBy: { downloadedAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ downloads });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch downloads log' },
      { status: 500 }
    );
  }
}
