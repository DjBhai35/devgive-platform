import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getSessionUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!file.name.endsWith('.zip')) {
      return NextResponse.json({ error: 'Only .zip archives are allowed' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const safeFilename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const targetDir = path.join(process.cwd(), 'storage', 'packages');

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const targetPath = path.join(targetDir, safeFilename);
    await fs.promises.writeFile(targetPath, buffer);

    const relativePath = `storage/packages/${safeFilename}`;

    return NextResponse.json({
      message: 'Source code package uploaded successfully',
      packagePath: relativePath,
      filename: safeFilename,
      sizeBytes: buffer.length,
    });
  } catch (error: any) {
    console.error('Package upload error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to upload source code package' },
      { status: 500 }
    );
  }
}
