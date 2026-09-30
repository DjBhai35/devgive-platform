import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, hashPassword, comparePassword } from '@/lib/auth';

export async function PUT(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, bio, country, avatarUrl, currentPassword, newPassword } = body;

    const updateData: any = {};
    if (name) updateData.name = name.trim();
    if (bio !== undefined) updateData.bio = bio ? bio.trim() : null;
    if (country !== undefined) updateData.country = country ? country.trim() : null;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl ? avatarUrl.trim() : null;

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Current password is required to set a new password.' },
          { status: 400 }
        );
      }

      const fullUser = await prisma.user.findUnique({
        where: { id: session.id },
      });

      if (!fullUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const isCurrentValid = await comparePassword(currentPassword, fullUser.passwordHash);
      if (!isCurrentValid) {
        return NextResponse.json(
          { error: 'Current password is incorrect.' },
          { status: 400 }
        );
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: 'New password must be at least 6 characters.' },
          { status: 400 }
        );
      }

      updateData.passwordHash = await hashPassword(newPassword);
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        status: true,
        avatarUrl: true,
        bio: true,
        country: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}
