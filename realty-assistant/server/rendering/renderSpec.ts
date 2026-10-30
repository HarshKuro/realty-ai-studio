import { z } from 'zod';

export const RenderSceneSpecSchema = z.object({
  imagePath: z.string().min(1, 'Image path required'),
  durationSec: z.number().positive(),
  caption: z.string().default(''),
});

export const RenderSpecSchema = z.object({
  jobId: z.string().min(1),
  width: z.number().default(1080),
  height: z.number().default(1920),
  fps: z.number().default(30),
  scenes: z.array(RenderSceneSpecSchema).min(1),
  audioFilePath: z.string().optional(),
  aspectRatio: z.enum(['9:16', '16:9']).default('9:16'),
});

export type RenderSceneSpec = z.infer<typeof RenderSceneSpecSchema>;
export type RenderSpec = z.infer<typeof RenderSpecSchema>;

