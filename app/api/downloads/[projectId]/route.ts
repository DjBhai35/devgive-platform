import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in to download source code.' },
        { status: 401 }
      );
    }

    const { projectId } = params;

    const project = await prisma.project.findFirst({
      where: {
        OR: [{ id: projectId }, { slug: projectId }],
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
    }

    let isAuthorized = false;

    // Check if user is admin (owner has direct access)
    if (session.role === 'ADMIN') {
      isAuthorized = true;
    } else if (project.isPremium) {
      // Must have an APPROVED purchase
      const purchase = await prisma.purchase.findFirst({
        where: {
          userId: session.id,
          projectId: project.id,
          status: 'APPROVED',
        },
      });
      if (purchase) isAuthorized = true;
    } else {
      // Free project: must have verified free claim
      const claim = await prisma.freeClaim.findUnique({
        where: {
          userId_projectId: {
            userId: session.id,
            projectId: project.id,
          },
        },
      });
      if (claim) isAuthorized = true;
    }

    if (!isAuthorized) {
      return NextResponse.json(
        {
          error: project.isPremium
            ? 'Access denied. You must purchase this project and wait for payment approval to unlock the source code.'
            : 'Access denied. You must complete the YouTube verification claim before downloading.',
          requiresClaimOrPurchase: true,
          isPremium: project.isPremium,
        },
        { status: 403 }
      );
    }

    // Resolve source file path
    const filePath = path.join(
      process.cwd(),
      project.sourcePackagePath || 'storage/packages/ecommerce-saas.zip'
    );

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Source code file archive not found on server.' },
        { status: 404 }
      );
    }

    const fileBuffer = await fs.promises.readFile(filePath);

    // Record download in real database
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const forwarded = request.headers.get('x-forwarded-for');
    const ipAddress = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';

    await prisma.$transaction([
      prisma.download.create({
        data: {
          userId: session.id,
          projectId: project.id,
          userAgent,
          ipAddress,
        },
      }),
      prisma.project.update({
        where: { id: project.id },
        data: { downloadCount: { increment: 1 } },
      }),
    ]);

    const filename = `${project.slug}-source.zip`;

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': fileBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process download' },
      { status: 500 }
    );
  }
}
