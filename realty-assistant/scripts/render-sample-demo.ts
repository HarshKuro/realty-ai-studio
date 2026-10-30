import path from 'path';
import fs from 'fs/promises';
import { generateFactualScript } from '../lib/story/scriptGenerator';
import { KokoroAdapter } from '../server/providers/tts/kokoroAdapter';
import { executeFfmpegRender } from '../server/rendering/ffmpegRenderer';
import { validateVideoFile } from '../server/rendering/videoValidator';

async function main() {
  console.log('=== REALTY ASSISTANT: END-TO-END DEMO RENDER SCRIPT ===\n');

  const cwd = process.cwd();
  const samplePropPath = path.resolve(cwd, 'public/samples/property.json');
  const property = JSON.parse(await fs.readFile(samplePropPath, 'utf-8'));

  console.log(`1. Loaded sample property: "${property.title}" in ${property.location}`);

  const sampleImages = [
    { name: 'Grand Foyer', path: path.resolve(cwd, 'public/samples/images/sample1.jpg') },
    { name: 'Great Room', path: path.resolve(cwd, 'public/samples/images/sample2.jpg') },
    { name: 'Chef Kitchen', path: path.resolve(cwd, 'public/samples/images/sample3.jpg') },
    { name: 'Primary Suite', path: path.resolve(cwd, 'public/samples/images/sample4.jpg') },
    { name: 'Skyline Terrace', path: path.resolve(cwd, 'public/samples/images/sample5.jpg') },
  ];

  console.log(`2. Prepared ${sampleImages.length} photographic plates.`);

  // Generate factual script
  const script = generateFactualScript(property, sampleImages.length);
  console.log(`3. Factual script generated (${script.scenes.length} scenes, ~${script.estimatedTotalDurationSec}s).`);
  console.log(`   Narration sample: "${script.fullNarration.slice(0, 120)}..."\n`);

  // Audio setup: check if Kokoro is online or use bundled sample audio / silent mode
  console.log('4. Audio narration status check (Audio is optional, zero Docker required)...');
  const ttsAdapter = new KokoroAdapter('http://127.0.0.1:8880/v1');
  const isKokoroOnline = await ttsAdapter.checkHealth();

  let audioFilePath: string | undefined;
  let totalDurationSec = sampleImages.length * 3.5;

  if (isKokoroOnline) {
    console.log('   Kokoro TTS is online. Synthesizing narration...');
    const ttsResult = await ttsAdapter.synthesize({
      input: script.fullNarration,
      voice: 'af_heart',
      speed: 1.0,
    });
    const audioOutDir = path.resolve(cwd, 'public/renders/audio');
    await fs.mkdir(audioOutDir, { recursive: true });
    audioFilePath = path.join(audioOutDir, 'sample_demo_narration.mp3');
    await fs.writeFile(audioFilePath, ttsResult.buffer);
    totalDurationSec = ttsResult.durationSec;
    console.log(`   Synthesized: ${audioFilePath} (${totalDurationSec.toFixed(2)}s)`);
  } else {
    // Docker is NOT required: use bundled sample audio if available, or proceed with clean silent mode
    const sampleAudioPath = path.resolve(cwd, 'public/samples/audio/test_audio.mp3');
    try {
      await fs.access(sampleAudioPath);
      audioFilePath = sampleAudioPath;
      totalDurationSec = 4.8;
      console.log(`   Kokoro offline (Docker not required). Using bundled demo audio: ${audioFilePath}`);
    } catch {
      audioFilePath = undefined;
      totalDurationSec = sampleImages.length * 3.5;
      console.log('   Kokoro offline & audio omitted. Proceeding with silent 9:16 video (3.5s/scene).');
    }
  }

  // Render MP4 via FFmpeg
  console.log('\n5. Orchestrating FFmpeg 9:16 vertical video renderer (1080x1920 @ 30fps)...');
  const perSceneDur = audioFilePath ? totalDurationSec / sampleImages.length : 3.5;
  const renderScenes = sampleImages.map((img, i) => ({
    imagePath: img.path,
    durationSec: perSceneDur,
    caption: script.scenes[i]?.caption || img.name,
  }));

  const renderResult = await executeFfmpegRender({
    jobId: 'sample_beverly_hills_demo',
    width: 1080,
    height: 1920,
    fps: 30,
    scenes: renderScenes,
    audioFilePath,
    aspectRatio: '9:16',
  });

  console.log(`   FFmpeg render completed!`);
  console.log(`   Output MP4: ${renderResult.outputPath}\n`);

  // Validate with FFprobe
  console.log('6. Validating exported MP4 with FFprobe...');
  const probe = await validateVideoFile(renderResult.outputPath);

  console.log('\n=== FFPROBE VERIFICATION EVIDENCE ===');
  console.log(`- File Valid: ${probe.isValid ? 'YES' : 'NO'}`);
  console.log(`- Resolution: ${probe.width} x ${probe.height} (9:16 vertical)`);
  console.log(`- Duration: ${probe.duration.toFixed(2)} seconds`);
  console.log(`- Video Codec: ${probe.videoCodec}`);
  console.log(`- Audio Codec: ${probe.audioCodec || 'None'}`);
  console.log(`- Audio Stream Present: ${probe.hasAudio ? 'YES' : 'NO'}`);
  console.log(`- File Size: ${(probe.sizeBytes / (1024 * 1024)).toFixed(2)} MB`);
  console.log('=====================================\n');

  if (probe.isValid && probe.width === 1080 && probe.height === 1920) {
    console.log('SUCCESS: Full vertical slice verified end-to-end with genuine MP4 generation!');
  } else {
    console.error('ERROR: Video validation checks did not meet the criteria!');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Execution failed:', err);
  process.exit(1);
});
