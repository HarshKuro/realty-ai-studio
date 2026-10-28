import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import crypto from 'crypto';

const execFileAsync = promisify(execFile);

export interface KokoroVoice {
  id: string;
  name: string;
  target_quality?: string;
  overall_grade?: string;
  training_duration?: string;
}

export interface SynthesizeOptions {
  input: string;
  voice?: string;
  speed?: number;
}

export interface SynthesizeResult {
  buffer: Buffer;
  durationSec: number;
  format: string;
}

export class KokoroAdapter {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://127.0.0.1:8880/v1') {
    // Ensure no trailing slash
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  async listVoices(): Promise<KokoroVoice[]> {
    try {
      const res = await fetch(`${this.baseUrl}/audio/voices`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        throw new Error(`Kokoro returned status ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      if (Array.isArray(data.voices)) {
        return data.voices;
      }
      if (Array.isArray(data)) {
        return data;
      }
      return [];
    } catch (err: any) {
      throw new Error(`Kokoro TTS service unreachable at ${this.baseUrl}: ${err.message}`);
    }
  }

  async synthesize(opts: SynthesizeOptions): Promise<SynthesizeResult> {
    const input = opts.input.trim();
    if (!input) {
      throw new Error('Narration text cannot be empty');
    }

    const payload = {
      model: 'kokoro',
      input,
      voice: opts.voice || 'af_heart',
      response_format: 'mp3',
      speed: opts.speed ?? 1.0,
    };

    let res: Response;
    try {
      res = await fetch(`${this.baseUrl}/audio/speech`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (err: any) {
      throw new Error(`Failed to connect to Kokoro TTS at ${this.baseUrl}: ${err.message}`);
    }

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Kokoro TTS error (${res.status}): ${errText}`);
    }

    const arrayBuf = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuf);

    if (buffer.length === 0) {
      throw new Error('Kokoro TTS returned empty audio buffer');
    }

    // Probe duration using ffprobe
    const durationSec = await this.probeAudioDuration(buffer);

    return {
      buffer,
      durationSec,
      format: 'mp3',
    };
  }

  private async probeAudioDuration(buffer: Buffer): Promise<number> {
    const tempFile = path.join(os.tmpdir(), `kokoro_probe_${crypto.randomUUID()}.mp3`);
    try {
      await fs.writeFile(tempFile, buffer);
      const { stdout } = await execFileAsync('ffprobe', [
        '-v',
        'error',
        '-show_entries',
        'format=duration',
        '-of',
        'default=noprint_wrappers=1:nokey=1',
        tempFile,
      ]);

      const dur = parseFloat(stdout.trim());
      if (isNaN(dur) || dur <= 0) {
        // Fallback approximation if ffprobe output is unexpected
        return Math.max(2.0, (buffer.length / 32000) * 2);
      }
      return dur;
    } catch (err) {
      console.warn('ffprobe probe warning, fallback estimation used:', err);
      return 3.0;
    } finally {
      await fs.unlink(tempFile).catch(() => {});
    }
  }
}
