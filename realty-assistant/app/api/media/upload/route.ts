import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES, ImageItem } from '@/lib/validation/media';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Unsupported image format (${file.type}). Please upload JPEG, PNG, or WebP.` },
        { status: 400 }
      );
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Max allowed size is 10MB.` },
        { status: 400 }
      );
    }

    const uploadDir = path.resolve(process.cwd(), 'public/uploads');
    await fs.mkdir(uploadDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExt = path.extname(file.name) || (file.type === 'image/png' ? '.png' : '.jpg');
    const safeBaseName = path.basename(file.name, fileExt).replace(/[^a-zA-Z0-9-_]/g, '_');
    const uniqueId = crypto.randomUUID();
    const storedFileName = `${uniqueId}_${safeBaseName}${fileExt}`;
    const destinationPath = path.join(uploadDir, storedFileName);

    await fs.writeFile(destinationPath, buffer);

    const imageItem: ImageItem = {
      id: uniqueId,
      name: file.name,
      url: `/uploads/${storedFileName}`,
      filePath: destinationPath,
      size: file.size,
      type: file.type,
    };

    return NextResponse.json({ success: true, image: imageItem });
  } catch (error: any) {
    console.error('Media upload error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process image' }, { status: 500 });
  }
}
