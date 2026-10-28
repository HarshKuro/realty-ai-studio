import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { KokoroAdapter } from '@/server/providers/tts/kokoroAdapter';
import { envConfig } from '@/lib/config';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { input, voice, speed } = body;

    if (!input || typeof input !== 'string' || !input.trim()) {
      return NextResponse.json({ error: 'Text input is required' }, { status: 400 });
    }

    const adapter = new KokoroAdapter(envConfig.kokoroBaseUrl);

    // Cache key based on input, voice, speed
    const cacheKey = crypto
      .createHash('sha256')
      .update(`${input.trim()}_${voice || 'af_heart'}_${speed || 1.0}`)
      .digest('hex');

    const audioDir = path.resolve(process.cwd(), 'public/renders/audio');
    await fs.mkdir(audioDir, { recursive: true });

    const cachedFilePath = path.join(audioDir, `${cacheKey}.mp3`);
    const publicUrl = `/renders/audio/${cacheKey}.mp3`;

    // Check if file already exists in cache
    try {
      const stat = await fs.stat(cachedFilePath);
      if (stat.size > 1000) {
        // Reuse cached file; probe duration if needed
        const result = await adapter.synthesize({
          input: input.trim(),
          voice: voice || 'af_heart',
          speed: speed || 1.0,
        });
        return NextResponse.json({
          success: true,
          audioUrl: publicUrl,
          audioFilePath: cachedFilePath,
          durationSec: result.durationSec,
          cached: true,
        });
      }
    } catch {
      // Not cached, generate fresh
    }

    const result = await adapter.synthesize({
      input: input.trim(),
      voice: voice || 'af_heart',
      speed: Number(speed) || 1.0,
    });

    await fs.writeFile(cachedFilePath, result.buffer);

    return NextResponse.json({
      success: true,
      audioUrl: publicUrl,
      audioFilePath: cachedFilePath,
      durationSec: result.durationSec,
      cached: false,
    });
  } catch (error: any) {
    console.error('Kokoro TTS generation error:', error);
    return NextResponse.json(
      {
        error: error.message || 'TTS generation failed',
        isOffline: error.message?.includes('unreachable') || error.message?.includes('connect'),
      },
      { status: 500 }
    );
  }
}
