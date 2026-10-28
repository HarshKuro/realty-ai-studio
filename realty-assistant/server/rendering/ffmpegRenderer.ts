import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { RenderSpec, RenderSpecSchema } from './renderSpec';

const execFileAsync = promisify(execFile);

export interface RenderResult {
  jobId: string;
  outputPath: string;
  publicUrl: string;
  durationSec: number;
}

export async function executeFfmpegRender(specInput: RenderSpec): Promise<RenderResult> {
  const spec = RenderSpecSchema.parse(specInput);
  const tempDir = path.join(os.tmpdir(), `realty_render_${spec.jobId}`);
  await fs.mkdir(tempDir, { recursive: true });

  const outputDir = path.resolve(process.cwd(), 'public/renders/videos');
  await fs.mkdir(outputDir, { recursive: true });

  const finalOutputPath = path.join(outputDir, `${spec.jobId}.mp4`);
  const publicUrl = `/renders/videos/${spec.jobId}.mp4`;

  try {
    const sceneClipPaths: string[] = [];
    const fps = spec.fps || 30;

    // Font path for Windows default Arial
    const fontPath = 'C\\:/Windows/Fonts/arial.ttf';

    for (let i = 0; i < spec.scenes.length; i++) {
      const scene = spec.scenes[i];
      const sceneDuration = Math.max(1.0, scene.durationSec);
      const sceneClipPath = path.join(tempDir, `scene_${i}.ts`);
      const captionTxtPath = path.join(tempDir, `caption_${i}.txt`);

      // Write caption to UTF-8 file for safe drawtext textfile reading
      const cleanCaption = (scene.caption || '').replace(/\r?\n/g, ' ').trim();
      await fs.writeFile(captionTxtPath, cleanCaption, 'utf-8');

      // Escaped caption file path for FFmpeg filter
      const escapedTxtPath = captionTxtPath.replace(/\\/g, '/').replace(/:/g, '\\:');

      // Video filter: Scale and pad to 1080x1920, overlay caption pill at bottom safe zone
      const vf = [
        `scale=1080:1920:force_original_aspect_ratio=decrease`,
        `pad=1080:1920:(1080-iw)/2:(1920-ih)/2:color=black`,
        `drawtext=fontfile='${fontPath}':textfile='${escapedTxtPath}':fontcolor=white:fontsize=44:x=(w-text_w)/2:y=h-340:box=1:boxcolor=black@0.75:boxborderw=18`,
        `format=yuv420p`,
      ].join(',');

      // Render individual scene MPEG-TS clip (TS allows safe lossless concatenation)
      await execFileAsync('ffmpeg', [
        '-y',
        '-loop',
        '1',
        '-t',
        sceneDuration.toString(),
        '-i',
        scene.imagePath,
        '-vf',
        vf,
        '-r',
        fps.toString(),
        '-c:v',
        'libx264',
        '-preset',
        'ultrafast',
        '-tune',
        'stillimage',
        '-pix_fmt',
        'yuv420p',
        sceneClipPath,
      ]);

      sceneClipPaths.push(sceneClipPath);
    }

    // Write concat file list for FFmpeg concat demuxer
    const concatListPath = path.join(tempDir, 'concat_list.txt');
    const concatFileContent = sceneClipPaths
      .map((p) => `file '${p.replace(/\\/g, '/')}'`)
      .join('\n');
    await fs.writeFile(concatListPath, concatFileContent, 'utf-8');

    // Mux concatenated video with Kokoro narration audio
    // -movflags +faststart places moov atom at beginning of MP4 for instant browser playback
    const muxArgs = [
      '-y',
      '-f',
      'concat',
      '-safe',
      '0',
      '-i',
      concatListPath,
      '-i',
      spec.audioFilePath,
      '-c:v',
      'libx264',
      '-preset',
      'fast',
      '-crf',
      '22',
      '-pix_fmt',
      'yuv420p',
      '-c:a',
      'aac',
      '-b:a',
      '192k',
      '-shortest',
      '-movflags',
      '+faststart',
      finalOutputPath,
    ];

    await execFileAsync('ffmpeg', muxArgs);

    // Verify output duration using ffprobe
    const { stdout: probeOut } = await execFileAsync('ffprobe', [
      '-v',
      'error',
      '-show_entries',
      'format=duration',
      '-of',
      'default=noprint_wrappers=1:nokey=1',
      finalOutputPath,
    ]);

    const durationSec = parseFloat(probeOut.trim()) || 0;

    return {
      jobId: spec.jobId,
      outputPath: finalOutputPath,
      publicUrl,
      durationSec,
    };
  } finally {
    // Cleanup temporary scene directory
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
  }
}
