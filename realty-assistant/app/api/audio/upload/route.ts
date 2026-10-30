import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No audio file uploaded' }, { status: 400 });
    }

    const uploadDir = path.resolve(process.cwd(), 'public/uploads/audio');
    await fs.mkdir(uploadDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExt = path.extname(file.name) || '.mp3';
    const safeBaseName = path.basename(file.name, fileExt).replace(/[^a-zA-Z0-9-_]/g, '_');
    const uniqueId = crypto.randomUUID();
    const storedFileName = `${uniqueId}_${safeBaseName}${fileExt}`;
    const destinationPath = path.join(uploadDir, storedFileName);

    await fs.writeFile(destinationPath, buffer);

    // Probe duration using ffprobe
    let durationSec = 15.0;
    try {
      const { stdout } = await execFileAsync('ffprobe', [
        '-v',
        'error',
        '-show_entries',
        'format=duration',
        '-of',
        'default=noprint_wrappers=1:nokey=1',
        destinationPath,
      ]);
      const probed = parseFloat(stdout.trim());
      if (!isNaN(probed) && probed > 0) {
        durationSec = probed;
      }
    } catch (probeErr) {
      console.warn('Audio upload ffprobe warning, using fallback duration:', probeErr);
    }

    const publicUrl = `/uploads/audio/${storedFileName}`;

    return NextResponse.json({
      success: true,
      audioUrl: publicUrl,
      audioFilePath: destinationPath,
      durationSec,
      fileName: file.name,
    });
  } catch (error: any) {
    console.error('Audio upload error:', error);
    return NextResponse.json({ error: error.message || 'Failed to upload audio' }, { status: 500 });
  }
}

