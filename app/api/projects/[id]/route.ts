import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const identifier = params.id;
    const session = await getSessionUser();

    const project = await prisma.project.findFirst({
      where: {
        OR: [{ id: identifier }, { slug: identifier }],
      },
      include: {
        category: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Increment view count in real database
    await prisma.project.update({
      where: { id: project.id },
      data: { viewCount: { increment: 1 } },
    });

    let isWishlisted = false;
    let hasClaimed = false;
    let hasPurchased = false;

    if (session) {
      const [wishlist, claim, purchase] = await Promise.all([
        prisma.wishlist.findUnique({
          where: {
            userId_projectId: {
              userId: session.id,
              projectId: project.id,
            },
          },
        }),
        prisma.freeClaim.findUnique({
          where: {
            userId_projectId: {
              userId: session.id,
              projectId: project.id,
            },
          },
        }),
        prisma.purchase.findFirst({
          where: {
            userId: session.id,
            projectId: project.id,
            status: 'APPROVED',
          },
        }),
      ]);

      isWishlisted = Boolean(wishlist);
      hasClaimed = Boolean(claim);
      hasPurchased = Boolean(purchase);
    }

    // Related projects
    const related = await prisma.project.findMany({
      where: {
        categoryId: project.categoryId,
        id: { not: project.id },
        published: true,
      },
      take: 4,
      select: {
        id: true,
        title: true,
        slug: true,
        thumbnail: true,
        isPremium: true,
        price: true,
      },
    });

    let parsedTech: string[] = [];
    try {
      parsedTech = JSON.parse(project.techStack);
    } catch {
      parsedTech = [];
    }

    return NextResponse.json({
      project: {
        ...project,
        viewCount: project.viewCount + 1,
        techStack: parsedTech,
        isWishlisted,
        hasClaimed,
        hasPurchased,
      },
      related,
    });
  } catch (error: any) {
    console.error('Fetch project detail error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch project detail' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      slug,
      shortDescription,
      description,
      categoryId,
      techStack,
      version,
      liveDemoUrl,
      isPremium,
      price,
      sourcePackagePath,
      thumbnail,
      youtubeUrl,
      youtubeRequiredDuration,
      published,
    } = body;

    const data: any = {};
    if (title !== undefined) data.title = title.trim();
    if (slug !== undefined) data.slug = slug.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '-');
    if (shortDescription !== undefined) data.shortDescription = shortDescription.trim();
    if (description !== undefined) data.description = description.trim();
    if (categoryId !== undefined) data.categoryId = categoryId;
    if (techStack !== undefined) {
      data.techStack = Array.isArray(techStack)
        ? JSON.stringify(techStack)
        : typeof techStack === 'string'
        ? JSON.stringify(techStack.split(',').map((s: string) => s.trim()))
        : '[]';
    }
    if (version !== undefined) data.version = version.trim();
    if (liveDemoUrl !== undefined) data.liveDemoUrl = liveDemoUrl ? liveDemoUrl.trim() : null;
    if (isPremium !== undefined) data.isPremium = Boolean(isPremium);
    if (price !== undefined) data.price = parseFloat(price) || 0;
    if (sourcePackagePath !== undefined) data.sourcePackagePath = sourcePackagePath;
    if (thumbnail !== undefined) data.thumbnail = thumbnail;
    if (youtubeUrl !== undefined) data.youtubeUrl = youtubeUrl ? youtubeUrl.trim() : null;
    if (youtubeRequiredDuration !== undefined) {
      data.youtubeRequiredDuration = parseInt(youtubeRequiredDuration, 10) || 60;
    }
    if (published !== undefined) data.published = Boolean(published);

    const updated = await prisma.project.update({
      where: { id: params.id },
      data,
      include: { category: true },
    });

    return NextResponse.json({ project: updated });
  } catch (error: any) {
    console.error('Update project error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update project' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await prisma.project.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Project deleted successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to delete project' },
      { status: 500 }
    );
  }
}
