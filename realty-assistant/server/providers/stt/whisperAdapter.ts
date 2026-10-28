export interface TranscriptionResult {
  text: string;
  language?: string;
  duration?: number;
}

export class WhisperAdapter {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://127.0.0.1:8881/v1') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/models`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async transcribe(fileBuffer: Buffer, fileName: string = 'audio.wav'): Promise<TranscriptionResult> {
    const formData = new FormData();
    const blob = new Blob([fileBuffer as any], { type: 'audio/wav' });
    formData.append('file', blob, fileName);
    formData.append('model', 'Systran/faster-whisper-small');
    formData.append('response_format', 'json');

    try {
      const res = await fetch(`${this.baseUrl}/audio/transcriptions`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Whisper transcription error (${res.status}): ${errText}`);
      }

      const data = await res.json();
      return {
        text: data.text || '',
      };
    } catch (err: any) {
      throw new Error(`Failed to transcribe audio via Whisper at ${this.baseUrl}: ${err.message}`);
    }
  }
}
