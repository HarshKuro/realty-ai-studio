export type RenderStage =
  | 'IDLE'
  | 'PREPARING_ASSETS'
  | 'GENERATING_NARRATION'
  | 'RENDERING_VIDEO'
  | 'VALIDATING_EXPORT'
  | 'COMPLETED'
  | 'FAILED';

export interface RenderJobState {
  jobId: string;
  stage: RenderStage;
  message: string;
  videoUrl?: string;
  videoPath?: string;
  durationSec?: number;
  error?: string;
  updatedAt: number;
}

// In-memory job state repository
const jobs = new Map<string, RenderJobState>();

export const jobTracker = {
  get(jobId: string): RenderJobState | undefined {
    return jobs.get(jobId);
  },

  set(jobId: string, state: Partial<RenderJobState> & { stage: RenderStage }): RenderJobState {
    const existing = jobs.get(jobId) || {
      jobId,
      stage: 'IDLE',
      message: 'Job initialized',
      updatedAt: Date.now(),
    };

    const updated: RenderJobState = {
      ...existing,
      ...state,
      updatedAt: Date.now(),
    };

    jobs.set(jobId, updated);
    return updated;
  },

  fail(jobId: string, error: string): RenderJobState {
    return this.set(jobId, {
      stage: 'FAILED',
      message: 'Rendering failed',
      error,
    });
  },
};
