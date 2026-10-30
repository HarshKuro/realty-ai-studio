const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

async function main() {
  console.log('=== REALTY ASSISTANT: AUTOMATED WALKTHROUGH & SCREENSHOT RECORDER ===\n');

  const screenshotsDir = path.resolve(__dirname, '../docs/screenshots');
  const recordingsDir = path.resolve(__dirname, '../docs/recordings');
  fs.mkdirSync(screenshotsDir, { recursive: true });
  fs.mkdirSync(recordingsDir, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2, // High-DPI crystal-clear Retina screenshots
    recordVideo: {
      dir: recordingsDir,
      size: { width: 1440, height: 900 },
    },
  });

  const page = await context.newPage();

  console.log('1. Navigating to Studio application at http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Screenshot Step 1: Blank form
  console.log('2. Step 1: Listing Specifications Form...');
  await page.screenshot({ path: path.join(screenshotsDir, '01-property-form-empty.png') });

  // Load sample property facts
  console.log('   Clicking Load Beverly Hills Sample...');
  await page.click('button:has-text("Load Beverly Hills Sample")');
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(screenshotsDir, '02-property-form-filled.png') });

  // Submit Step 1
  console.log('   Submitting property facts...');
  await page.click('button:has-text("Confirm Details & Continue")');
  await page.waitForTimeout(1200);

  // Step 2: Media Uploader
  console.log('3. Step 2: Photographic Plates & Media Manager...');
  await page.screenshot({ path: path.join(screenshotsDir, '03-media-upload-empty.png') });

  console.log('   Clicking Load 5 Sample Photos...');
  await page.click('button:has-text("Load 5 Sample Photos")');
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(screenshotsDir, '04-media-upload-loaded.png') });

  // Proceed to Step 3
  console.log('   Confirming photos & generating factual story...');
  await page.click('button:has-text("Confirm Photos & Generate Factual Story")');
  await page.waitForTimeout(1500);

  // Step 3: Story Editor
  console.log('4. Step 3: Factual Story & Captions Editor...');
  await page.screenshot({ path: path.join(screenshotsDir, '05-story-editor.png') });

  // Proceed to Step 4
  console.log('   Proceeding to Voice Studio...');
  await page.click('button:has-text("Continue to Voice Studio")');
  await page.waitForTimeout(1500);

  // Step 4: Voice Studio
  console.log('5. Step 4: Voice & Narration Studio (Kokoro TTS)...');
  await page.screenshot({ path: path.join(screenshotsDir, '06-voice-studio.png') });

  // Synthesize speech with Kokoro
  console.log('   Synthesizing speech via Kokoro TTS container...');
  const synthBtn = page.locator('button:has-text("Synthesize Narration Track")');
  await synthBtn.click();

  // Wait for narration ready
  console.log('   Waiting for speech synthesis...');
  await page.waitForSelector('audio[src]', { timeout: 35000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(screenshotsDir, '07-voice-studio-synthesized.png') });

  // Proceed to Step 5: Render
  console.log('6. Step 5: Orchestrating FFmpeg Render Pipeline...');
  await page.click('button:has-text("Approve Audio & Proceed to Render Engine")');
  await page.waitForTimeout(2000);

  // Screenshot rendering in progress
  await page.screenshot({ path: path.join(screenshotsDir, '08-rendering-pipeline.png') });

  // Wait for export studio (render completion)
  console.log('   Waiting for FFmpeg 9:16 rendering and FFprobe validation...');
  await page.waitForSelector('text=Verified Video Export', { timeout: 60000 });
  await page.waitForTimeout(2500);

  // Screenshot Export Studio
  console.log('7. Step 6: Export Studio & Video Player...');
  await page.screenshot({ path: path.join(screenshotsDir, '09-export-studio.png') });

  console.log('8. Finalizing walkthrough recording...');
  await page.waitForTimeout(2500);

  const video = page.video();
  await page.close();
  await context.close();
  await browser.close();

  if (video) {
    const rawVideoPath = await video.path();
    console.log(`   Raw recording saved to: ${rawVideoPath}`);

    const outputMp4 = path.resolve(recordingsDir, 'realty-assistant-walkthrough.mp4');
    console.log(`   Transcoding to high-grade MP4 at: ${outputMp4}`);

    try {
      execSync(`ffmpeg -y -i "${rawVideoPath}" -c:v libx264 -preset fast -crf 20 -pix_fmt yuv420p "${outputMp4}"`, {
        stdio: 'inherit',
      });
      console.log(`   Walkthrough MP4 successfully created: ${outputMp4}`);
    } catch (ffmpegErr) {
      console.warn('   FFmpeg transcode warning:', ffmpegErr);
    }
  }

  console.log('\n=== RECORDING & SCREENSHOT GENERATION COMPLETE ===');
}

main().catch((err) => {
  console.error('Fatal error during recording:', err);
  process.exit(1);
});
