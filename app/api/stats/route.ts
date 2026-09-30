import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const [projectCount, downloadAggregate, userCount, approvedDonations] = await Promise.all([
      prisma.project.count({ where: { published: true } }),
      prisma.project.aggregate({
        _sum: { downloadCount: true },
      }),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.purchase.count({ where: { status: 'APPROVED' } }),
    ]);

    const totalDownloads = (downloadAggregate._sum.downloadCount || 0);

    return NextResponse.json({
      stats: {
        projects: projectCount,
        downloads: totalDownloads,
        supporters: userCount,
        approvedDonations: approvedDonations,
      },
    });
  } catch (error: any) {
    console.error('Platform stats error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch platform stats' },
      { status: 500 }
    );
  }
}
