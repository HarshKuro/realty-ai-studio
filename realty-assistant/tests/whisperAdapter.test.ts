import { describe, it, expect } from 'vitest';
import path from 'path';
import { WhisperAdapter } from '../server/providers/stt/whisperAdapter';

describe('Whisper STT Adapter', () => {
  it('connects to live Whisper container and checks health or models', async () => {
    const adapter = new WhisperAdapter('http://127.0.0.1:8881/v1');
    const isOnline = await adapter.checkHealth();
    expect(isOnline).toBe(true);
  });

  it('handles offline gracefully without crashing', async () => {
    const badAdapter = new WhisperAdapter('http://127.0.0.1:9999/v1');
    const isOnline = await badAdapter.checkHealth();
    expect(isOnline).toBe(false);
  });
});
