import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [approvedCount, pendingCount, downloadsCount, favoritesCount, recentPurchases] =
      await Promise.all([
        prisma.purchase.count({
          where: { userId: session.id, status: 'APPROVED' },
        }),
        prisma.purchase.count({
          where: { userId: session.id, status: 'PENDING' },
        }),
        prisma.download.count({
          where: { userId: session.id },
        }),
        prisma.wishlist.count({
          where: { userId: session.id },
        }),
        prisma.purchase.findMany({
          where: { userId: session.id },
          include: {
            project: {
              select: {
                id: true,
                title: true,
                slug: true,
                thumbnail: true,
                isPremium: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
      ]);

    return NextResponse.json({
      stats: {
        approved: approvedCount,
        pending: pendingCount,
        downloads: downloadsCount,
        favorites: favoritesCount,
      },
      recentTransactions: recentPurchases,
    });
  } catch (error: any) {
    console.error('User stats error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch user stats' },
      { status: 500 }
    );
  }
}
