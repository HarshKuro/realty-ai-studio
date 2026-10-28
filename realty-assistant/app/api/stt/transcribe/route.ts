import { NextRequest, NextResponse } from 'next/server';
import { WhisperAdapter } from '@/server/providers/stt/whisperAdapter';
import { envConfig } from '@/lib/config';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    const adapter = new WhisperAdapter(envConfig.whisperBaseUrl);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await adapter.transcribe(buffer, file.name || 'dictation.wav');

    return NextResponse.json({
      success: true,
      text: result.text.trim(),
    });
  } catch (error: any) {
    console.error('Whisper transcription error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Speech-to-text transcription failed',
        isOffline: true,
      },
      { status: 500 }
    );
  }
}
