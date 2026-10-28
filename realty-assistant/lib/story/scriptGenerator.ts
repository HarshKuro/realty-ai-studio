import { PropertyDetails } from '../validation/property';

export interface ScenePlan {
  id: string;
  sceneIndex: number;
  caption: string;
  narrationSlice: string;
  estimatedDurationSec: number;
}

export interface VideoScript {
  fullNarration: string;
  scenes: ScenePlan[];
  estimatedTotalDurationSec: number;
}

function wordsDuration(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  // Kokoro default pace is roughly 2.4 - 2.6 words per second. Add 0.5s pause.
  return Math.max(2.5, Math.round((words / 2.5) * 10) / 10 + 0.5);
}

export function generateFactualScript(
  property: PropertyDetails,
  sceneCount: number = 5
): VideoScript {
  const safeSceneCount = Math.max(4, Math.min(8, sceneCount));
  const scenes: ScenePlan[] = [];

  // 1. Scene 1 - Grand Opening Hook
  const openNarration = `Welcome to ${property.title}, an exceptional ${property.propertyType.toLowerCase()} situated in ${property.location}.`;
  const openCaption = `${property.title} | ${property.location}`;
  scenes.push({
    id: 'scene-1',
    sceneIndex: 1,
    caption: openCaption.slice(0, 65),
    narrationSlice: openNarration,
    estimatedDurationSec: wordsDuration(openNarration),
  });

  // 2. Scene 2 - Architectural Specs / Scale
  const specParts: string[] = [];
  if (property.price && property.price.trim()) {
    specParts.push(`Offered at ${property.price}`);
  }
  if (property.areaSqFt) {
    specParts.push(`${property.areaSqFt.toLocaleString()} square feet of refined space`);
  }
  if (property.bedrooms) {
    const bathStr = property.bathrooms ? ` and ${property.bathrooms} bathrooms` : '';
    specParts.push(`featuring ${property.bedrooms} bedrooms${bathStr}`);
  }

  let scene2Narration = '';
  let scene2Caption = '';
  if (specParts.length > 0) {
    scene2Narration = `This property boasts ${specParts.join(', ')}.`;
    const captionParts = [];
    if (property.price) captionParts.push(property.price);
    if (property.areaSqFt) captionParts.push(`${property.areaSqFt.toLocaleString()} Sq Ft`);
    if (property.bedrooms) captionParts.push(`${property.bedrooms} Beds`);
    scene2Caption = captionParts.join(' • ');
  } else if (property.features && property.features.length > 0) {
    scene2Narration = `Defined by remarkable architectural vision, featuring ${property.features[0].toLowerCase()}.`;
    scene2Caption = property.features[0];
  } else {
    scene2Narration = `Crafted with uncompromising craftsmanship and enduring elegance throughout.`;
    scene2Caption = `${property.propertyType} Excellence`;
  }

  scenes.push({
    id: 'scene-2',
    sceneIndex: 2,
    caption: scene2Caption.slice(0, 65),
    narrationSlice: scene2Narration,
    estimatedDurationSec: wordsDuration(scene2Narration),
  });

  // 3. Middle scenes for Highlight Features
  const middleSceneSlots = safeSceneCount - 2; // excluding first and last
  const availableFeatures = property.features || [];
  let featIdx = specParts.length > 0 ? 0 : 1;

  for (let i = 1; i < middleSceneSlots; i++) {
    const sceneNum = scenes.length + 1;
    if (featIdx < availableFeatures.length) {
      const feat = availableFeatures[featIdx];
      const narr = `Experience ${feat}, elevating everyday living into art.`;
      scenes.push({
        id: `scene-${sceneNum}`,
        sceneIndex: sceneNum,
        caption: feat.slice(0, 65),
        narrationSlice: narr,
        estimatedDurationSec: wordsDuration(narr),
      });
      featIdx++;
    } else {
      const narr = `Every detail reflects meticulous care and timeless sophistication.`;
      scenes.push({
        id: `scene-${sceneNum}`,
        sceneIndex: sceneNum,
        caption: `Sophisticated Architectural Detail`,
        narrationSlice: narr,
        estimatedDurationSec: wordsDuration(narr),
      });
    }
  }

  // 4. Final Scene - Contact & Call to Action
  const lastSceneNum = safeSceneCount;
  const brandPrefix = property.brandName ? `Presented by ${property.brandName}. ` : '';
  const finalNarration = `${brandPrefix}For inquiries and viewings, contact ${property.contact}. ${property.cta}.`;
  const finalCaption = `${property.cta} | ${property.contact}`;

  scenes.push({
    id: `scene-${lastSceneNum}`,
    sceneIndex: lastSceneNum,
    caption: finalCaption.slice(0, 65),
    narrationSlice: finalNarration,
    estimatedDurationSec: wordsDuration(finalNarration),
  });

  const fullNarration = scenes.map((s) => s.narrationSlice).join(' ');
  const estimatedTotalDurationSec = scenes.reduce((sum, s) => sum + s.estimatedDurationSec, 0);

  return {
    fullNarration,
    scenes,
    estimatedTotalDurationSec: Math.round(estimatedTotalDurationSec * 10) / 10,
  };
}
