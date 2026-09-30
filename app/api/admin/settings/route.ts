import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const settings = await prisma.setting.findMany();
    const settingsMap = settings.reduce((acc: any, cur) => {
      acc[cur.key] = cur.value;
      return acc;
    }, {});
    return NextResponse.json({ settings: settingsMap, raw: settings });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { settings } = body;

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ error: 'Invalid settings payload' }, { status: 400 });
    }

    const updates = Object.entries(settings).map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      })
    );

    await prisma.$transaction(updates);

    return NextResponse.json({ message: 'Settings updated successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to update settings' },
      { status: 500 }
    );
  }
}
