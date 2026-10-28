import { ImageItem } from '../validation/media';
import { ScenePlan } from './scriptGenerator';

export interface PlannedScene {
  id: string;
  sceneIndex: number;
  image: ImageItem;
  caption: string;
  narration: string;
  durationSec: number;
}

export function alignScenesWithImages(
  scenePlans: ScenePlan[],
  images: ImageItem[]
): PlannedScene[] {
  return images.map((image, idx) => {
    const plan = scenePlans[idx] || scenePlans[scenePlans.length - 1];
    return {
      id: `planned-scene-${idx + 1}`,
      sceneIndex: idx + 1,
      image,
      caption: plan?.caption || image.name,
      narration: plan?.narrationSlice || '',
      durationSec: plan?.estimatedDurationSec || 3.0,
    };
  });
}
