import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';

const execFileAsync = promisify(execFile);

export interface VideoProbeResult {
  isValid: boolean;
  width: number;
  height: number;
  duration: number;
  videoCodec: string;
  audioCodec?: string;
  hasAudio: boolean;
  sizeBytes: number;
  error?: string;
}

export async function validateVideoFile(filePath: string): Promise<VideoProbeResult> {
  try {
    const stat = await fs.stat(filePath);
    if (stat.size === 0) {
      return {
        isValid: false,
        width: 0,
        height: 0,
        duration: 0,
        videoCodec: '',
        hasAudio: false,
        sizeBytes: 0,
        error: 'Video file is empty (0 bytes)',
      };
    }

    const { stdout } = await execFileAsync('ffprobe', [
      '-v',
      'error',
      '-print_format',
      'json',
      '-show_format',
      '-show_streams',
      filePath,
    ]);

    const data = JSON.parse(stdout);
    const videoStream = data.streams?.find((s: any) => s.codec_type === 'video');
    const audioStream = data.streams?.find((s: any) => s.codec_type === 'audio');

    if (!videoStream) {
      return {
        isValid: false,
        width: 0,
        height: 0,
        duration: 0,
        videoCodec: '',
        hasAudio: false,
        sizeBytes: stat.size,
        error: 'No video stream detected in output file',
      };
    }

    const width = parseInt(videoStream.width || '0', 10);
    const height = parseInt(videoStream.height || '0', 10);
    const duration = parseFloat(data.format?.duration || videoStream.duration || '0');

    return {
      isValid: width > 0 && height > 0 && duration > 0,
      width,
      height,
      duration,
      videoCodec: videoStream.codec_name || '',
      audioCodec: audioStream?.codec_name,
      hasAudio: !!audioStream,
      sizeBytes: stat.size,
    };
  } catch (err: any) {
    return {
      isValid: false,
      width: 0,
      height: 0,
      duration: 0,
      videoCodec: '',
      hasAudio: false,
      sizeBytes: 0,
      error: `ffprobe failed: ${err.message}`,
    };
  }
}
