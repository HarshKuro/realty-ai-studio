import { NextResponse } from 'next/server';
import { KokoroAdapter } from '@/server/providers/tts/kokoroAdapter';
import { envConfig } from '@/lib/config';

export async function GET() {
  try {
    const adapter = new KokoroAdapter(envConfig.kokoroBaseUrl);
    const voices = await adapter.listVoices();

    // Priority voices for luxury real estate
    const curatedIds = ['af_heart', 'af_bella', 'af_nicole', 'af_sky', 'am_michael', 'am_adam', 'af_alloy'];

    const sortedVoices = voices.sort((a, b) => {
      const aCurated = curatedIds.includes(a.id);
      const bCurated = curatedIds.includes(b.id);
      if (aCurated && !bCurated) return -1;
      if (!aCurated && bCurated) return 1;
      return (a.overall_grade || 'C').localeCompare(b.overall_grade || 'C');
    });

    return NextResponse.json({
      success: true,
      voices: sortedVoices,
      defaultVoice: 'af_heart',
    });
  } catch (error: any) {
    console.error('Kokoro voice listing error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Kokoro TTS service is currently offline or unreachable',
        isOffline: true,
      },
      { status: 503 }
    );
  }
}
