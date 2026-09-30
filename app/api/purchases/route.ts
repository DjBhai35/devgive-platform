import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const purchases = await prisma.purchase.findMany({
      where: { userId: session.id },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnail: true,
            isPremium: true,
            price: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ purchases });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch purchases' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json(
        { error: 'Please sign in to proceed with donation or purchase.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { projectId, amount, paymentMethod, transactionReference, notes, paymentProofUrl } = body;

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required.' }, { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
    }

    const orderAmount = parseFloat(amount) || project.price || 1.0;

    const purchase = await prisma.purchase.create({
      data: {
        userId: session.id,
        projectId: project.id,
        amount: orderAmount,
        currency: 'USD',
        status: 'PENDING', // Owner reviews or approves
        paymentMethod: paymentMethod || 'Manual Proof / Crypto',
        transactionReference: transactionReference || `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        notes: notes || null,
        paymentProofUrl: paymentProofUrl || null,
      },
      include: {
        project: true,
      },
    });

    return NextResponse.json({
      message: 'Transaction submitted successfully! Our team will review the transaction.',
      purchase,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Purchase creation error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process purchase' },
      { status: 500 }
    );
  }
}
