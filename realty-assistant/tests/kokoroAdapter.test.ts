import { describe, it, expect } from 'vitest';
import { KokoroAdapter } from '../server/providers/tts/kokoroAdapter';

describe('Kokoro TTS Adapter', () => {
  it('connects to live Kokoro container and lists curated voices', async () => {
    const adapter = new KokoroAdapter('http://127.0.0.1:8880/v1');
    const voices = await adapter.listVoices();
    expect(voices.length).toBeGreaterThan(0);

    const heart = voices.find((v) => v.id === 'af_heart');
    expect(heart).toBeDefined();
    expect(heart?.name).toBe('af_heart');
  });

  it('generates speech audio buffer from short text and probes duration', async () => {
    const adapter = new KokoroAdapter('http://127.0.0.1:8880/v1');
    const result = await adapter.synthesize({
      input: 'Welcome to this architectural residence.',
      voice: 'af_heart',
      speed: 1.0,
    });

    expect(result.buffer.length).toBeGreaterThan(5000);
    expect(result.durationSec).toBeGreaterThan(1.0);
  }, 20000);

  it('handles offline / unavailable server gracefully with clear diagnostics', async () => {
    const badAdapter = new KokoroAdapter('http://127.0.0.1:9999/v1');
    await expect(badAdapter.listVoices()).rejects.toThrow();
  });
});
