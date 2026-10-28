import { describe, it, expect } from 'vitest';
import { envConfig } from '../lib/config';

describe('Environment Configuration', () => {
  it('loads default Kokoro and Whisper URLs', () => {
    expect(envConfig.kokoroBaseUrl).toBeDefined();
    expect(envConfig.whisperBaseUrl).toBeDefined();
    expect(envConfig.kokoroBaseUrl).toContain('8880');
    expect(envConfig.whisperBaseUrl).toContain('8881');
  });

  it('provides default render configurations', () => {
    expect(envConfig.renderTimeoutMs).toBeGreaterThan(0);
    expect(envConfig.defaultAspectRatio).toBe('9:16');
  });
});

