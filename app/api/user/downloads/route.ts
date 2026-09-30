import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const downloads = await prisma.download.findMany({
      where: { userId: session.id },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnail: true,
            isPremium: true,
            version: true,
          },
        },
      },
      orderBy: { downloadedAt: 'desc' },
    });

    return NextResponse.json({ downloads });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch downloads' },
      { status: 500 }
    );
  }
}
