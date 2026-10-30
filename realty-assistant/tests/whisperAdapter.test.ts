import { describe, it, expect } from 'vitest';
import { WhisperAdapter } from '../server/providers/stt/whisperAdapter';

describe('Whisper STT Adapter', () => {
  it('checks health and returns a boolean without throwing an error', async () => {
    const adapter = new WhisperAdapter('http://127.0.0.1:8881/v1');
    const isOnline = await adapter.checkHealth();
    expect(typeof isOnline).toBe('boolean');
  });

  it('handles offline gracefully without crashing', async () => {
    const badAdapter = new WhisperAdapter('http://127.0.0.1:9999/v1');
    const isOnline = await badAdapter.checkHealth();
    expect(isOnline).toBe(false);
  });

  it('reports offline gracefully when transcribing without a running server', async () => {
    const badAdapter = new WhisperAdapter('http://127.0.0.1:9999/v1');
    await expect(badAdapter.transcribe(Buffer.from('fake-audio-bytes'))).rejects.toThrow(/Failed to transcribe/i);
  });
});
