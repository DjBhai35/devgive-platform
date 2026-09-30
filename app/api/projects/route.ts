import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const type = searchParams.get('type') || ''; // 'free' | 'premium'
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '6', 10));
    const sort = searchParams.get('sort') || 'newest';

    const where: any = {
      published: true,
    };

    if (q) {
      where.OR = [
        { title: { contains: q } },
        { shortDescription: { contains: q } },
        { techStack: { contains: q } },
      ];
    }

    if (category) {
      where.OR = [
        { categoryId: category },
        { category: { slug: category } },
      ];
    }

    if (type === 'free') {
      where.isPremium = false;
    } else if (type === 'premium') {
      where.isPremium = true;
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'downloads') orderBy = { downloadCount: 'desc' };
    else if (sort === 'views') orderBy = { viewCount: 'desc' };
    else if (sort === 'price_asc') orderBy = { price: 'asc' };
    else if (sort === 'price_desc') orderBy = { price: 'desc' };

    const total = await prisma.project.count({ where });
    const projects = await prisma.project.findMany({
      where,
      include: {
        category: true,
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    });

    const formatted = projects.map((p) => {
      let parsedTech: string[] = [];
      try {
        parsedTech = JSON.parse(p.techStack);
      } catch {
        parsedTech = [];
      }
      return {
        ...p,
        techStack: parsedTech,
      };
    });

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      projects: formatted,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error: any) {
    console.error('Fetch projects error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
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

    if (!title || !shortDescription || !description || !categoryId) {
      return NextResponse.json(
        { error: 'Title, short description, description, and category are required.' },
        { status: 400 }
      );
    }

    const cleanSlug = (slug || title)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_-]/g, '-');

    const project = await prisma.project.create({
      data: {
        title: title.trim(),
        slug: cleanSlug,
        shortDescription: shortDescription.trim(),
        description: description.trim(),
        categoryId,
        techStack: Array.isArray(techStack) ? JSON.stringify(techStack) : typeof techStack === 'string' ? JSON.stringify(techStack.split(',').map((s: string) => s.trim())) : '[]',
        version: version || '1.0.0',
        liveDemoUrl: liveDemoUrl || null,
        isPremium: Boolean(isPremium),
        price: isPremium ? parseFloat(price) || 0 : 0,
        sourcePackagePath: sourcePackagePath || 'storage/packages/ecommerce-saas.zip',
        thumbnail: thumbnail || null,
        youtubeUrl: youtubeUrl || null,
        youtubeRequiredDuration: parseInt(youtubeRequiredDuration, 10) || 60,
        published: published !== undefined ? Boolean(published) : true,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error: any) {
    console.error('Create project error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create project' },
      { status: 500 }
    );
  }
}
