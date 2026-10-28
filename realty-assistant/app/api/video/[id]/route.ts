import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cleanId = id.replace(/[^a-zA-Z0-9-_]/g, '');
    const videoPath = path.resolve(process.cwd(), 'public/renders/videos', `${cleanId}.mp4`);

    if (!fs.existsSync(videoPath)) {
      return NextResponse.json({ error: 'Video file not found' }, { status: 404 });
    }

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.get('range');
    const isDownload = req.nextUrl.searchParams.get('download') === 'true';

    if (range && !isDownload) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;
      const fileStream = fs.createReadStream(videoPath, { start, end });

      // Convert Node read stream to Web stream
      const stream = new ReadableStream({
        start(controller) {
          fileStream.on('data', (chunk) => controller.enqueue(chunk));
          fileStream.on('end', () => controller.close());
          fileStream.on('error', (err) => controller.error(err));
        },
      });

      return new NextResponse(stream, {
        status: 206,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize.toString(),
          'Content-Type': 'video/mp4',
        },
      });
    }

    const fileBuffer = fs.readFileSync(videoPath);
    const headers: Record<string, string> = {
      'Content-Length': fileSize.toString(),
      'Content-Type': 'video/mp4',
    };

    if (isDownload) {
      headers['Content-Disposition'] = `attachment; filename="realty-showcase-${cleanId}.mp4"`;
    }

    return new NextResponse(fileBuffer, { status: 200, headers });
  } catch (error: any) {
    console.error('Video delivery error:', error);
    return NextResponse.json({ error: error.message || 'Error delivering video' }, { status: 500 });
  }
}
