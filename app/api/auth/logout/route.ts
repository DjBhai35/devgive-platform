import { NextResponse } from 'next/server';
import { getAuthCookieOptions } from '@/lib/auth';

export async function POST() {
  const cookieOptions = getAuthCookieOptions();
  const response = NextResponse.json({ message: 'Logged out successfully' });
  response.cookies.set(cookieOptions.name, '', {
    ...cookieOptions,
    maxAge: 0,
  });
  return response;
}
