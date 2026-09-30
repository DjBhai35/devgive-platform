import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json(
        { error: 'Please sign in to claim this free project.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { projectId, watchedSeconds } = body;

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required.' }, { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
    }

    if (project.isPremium) {
      return NextResponse.json(
        { error: 'This is a premium project and requires a purchase/donation.' },
        { status: 400 }
      );
    }

    const requiredDuration = project.youtubeRequiredDuration || 60;
    const actualSeconds = Math.floor(Number(watchedSeconds) || 0);

    if (actualSeconds < requiredDuration) {
      return NextResponse.json(
        {
          error: `Verification incomplete. You must watch at least ${requiredDuration} seconds of the video to unlock. Current: ${actualSeconds}s.`,
          requiredSeconds: requiredDuration,
          currentSeconds: actualSeconds,
        },
        { status: 400 }
      );
    }

    // Save claim in real database
    const claim = await prisma.freeClaim.upsert({
      where: {
        userId_projectId: {
          userId: session.id,
          projectId: project.id,
        },
      },
      update: {
        youtubeWatchedSeconds: actualSeconds,
        verifiedAt: new Date(),
      },
      create: {
        userId: session.id,
        projectId: project.id,
        youtubeWatchedSeconds: actualSeconds,
        verifiedAt: new Date(),
      },
    });

    return NextResponse.json({
      verified: true,
      message: 'Claim verified successfully! Source code download is now unlocked.',
      claim,
    });
  } catch (error: any) {
    console.error('Free claim verification error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to verify free claim' },
      { status: 500 }
    );
  }
}
