import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const items = await prisma.wishlist.findMany({
      where: { userId: session.id },
      include: {
        project: {
          include: { category: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = items.map((w) => {
      let parsedTech: string[] = [];
      try {
        parsedTech = JSON.parse(w.project.techStack);
      } catch {
        parsedTech = [];
      }
      return {
        id: w.id,
        projectId: w.projectId,
        createdAt: w.createdAt,
        project: {
          ...w.project,
          techStack: parsedTech,
        },
      };
    });

    return NextResponse.json({ wishlist: formatted });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch wishlist' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Please sign in to add projects to your wishlist.' }, { status: 401 });
    }

    const body = await request.json();
    const { projectId } = body;

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required.' }, { status: 400 });
    }

    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_projectId: {
          userId: session.id,
          projectId,
        },
      },
    });

    if (existing) {
      await prisma.wishlist.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ wishlisted: false, message: 'Removed from wishlist' });
    } else {
      await prisma.wishlist.create({
        data: {
          userId: session.id,
          projectId,
        },
      });
      return NextResponse.json({ wishlisted: true, message: 'Added to wishlist' });
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to toggle wishlist' },
      { status: 500 }
    );
  }
}
