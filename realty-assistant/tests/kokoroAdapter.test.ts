import { describe, it, expect } from 'vitest';
import { KokoroAdapter } from '../server/providers/tts/kokoroAdapter';

describe('Kokoro TTS Adapter', () => {
  it('checks service health without crashing', async () => {
    const adapter = new KokoroAdapter('http://127.0.0.1:8880/v1');
    const isOnline = await adapter.checkHealth();
    expect(typeof isOnline).toBe('boolean');
  });

  it('handles offline / unavailable server gracefully with clear diagnostics', async () => {
    const badAdapter = new KokoroAdapter('http://127.0.0.1:9999/v1');
    await expect(badAdapter.listVoices()).rejects.toThrow(/unreachable|failed/i);
    await expect(badAdapter.synthesize({ input: 'Test' })).rejects.toThrow(/Failed to connect|unreachable|failed/i);
  });

  it('validates empty narration input throws descriptive error', async () => {
    const adapter = new KokoroAdapter('http://127.0.0.1:8880/v1');
    await expect(adapter.synthesize({ input: '   ' })).rejects.toThrow(/cannot be empty/i);
  });

  it('connects to live Kokoro container if online, or reports offline status cleanly', async () => {
    const adapter = new KokoroAdapter('http://127.0.0.1:8880/v1');
    const isOnline = await adapter.checkHealth();
    if (isOnline) {
      const voices = await adapter.listVoices();
      expect(voices.length).toBeGreaterThan(0);
      const heart = voices.find((v) => v.id === 'af_heart');
      expect(heart).toBeDefined();

      const result = await adapter.synthesize({
        input: 'Welcome to this architectural residence.',
        voice: 'af_heart',
        speed: 1.0,
      });
      expect(result.buffer.length).toBeGreaterThan(5000);
      expect(result.durationSec).toBeGreaterThan(1.0);
    } else {
      // Offline mode: Kokoro is completely optional and doesn't block the app
      await expect(adapter.listVoices()).rejects.toThrow(/unreachable|failed/i);
    }
  });
});
