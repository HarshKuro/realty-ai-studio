import { NextResponse } from 'next/server';
import { KokoroAdapter } from '@/server/providers/tts/kokoroAdapter';
import { envConfig } from '@/lib/config';

const FALLBACK_CURATED_VOICES = [
  { id: 'af_heart', name: 'af_heart (Recommended)', target_quality: 'A', overall_grade: 'A' },
  { id: 'af_bella', name: 'af_bella (Warm Female)', target_quality: 'A', overall_grade: 'A' },
  { id: 'af_nicole', name: 'af_nicole (Editorial Female)', target_quality: 'B', overall_grade: 'B' },
  { id: 'af_sky', name: 'af_sky (Brisk Female)', target_quality: 'B', overall_grade: 'B' },
  { id: 'am_michael', name: 'am_michael (Executive Male)', target_quality: 'A', overall_grade: 'A' },
  { id: 'am_adam', name: 'am_adam (Narrative Male)', target_quality: 'B', overall_grade: 'B' },
];

export async function GET() {
  try {
    const adapter = new KokoroAdapter(envConfig.kokoroBaseUrl);
    const voices = await adapter.listVoices();

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
      isOffline: false,
    });
  } catch (error: any) {
    // Graceful offline fallback: return curated voices with isOffline flag so UI stays functional
    return NextResponse.json({
      success: false,
      voices: FALLBACK_CURATED_VOICES,
      defaultVoice: 'af_heart',
      isOffline: true,
      message: 'Local Kokoro TTS service is offline (Docker is not required). Audio narration is completely optional.',
    });
  }
}
