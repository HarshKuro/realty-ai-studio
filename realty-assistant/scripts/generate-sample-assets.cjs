const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const dir = path.resolve(__dirname, '../public/samples/images');
fs.mkdirSync(dir, { recursive: true });

const scenes = [
  { file: 'sample1.jpg', label: 'Grand Minimalist Foyer', color: '0x10131A' },
  { file: 'sample2.jpg', label: 'High Ceiling Great Room', color: '0x151922' },
  { file: 'sample3.jpg', label: 'Chef Kitchen & Dining', color: '0x12171E' },
  { file: 'sample4.jpg', label: 'Primary Bedroom Suite', color: '0x141820' },
  { file: 'sample5.jpg', label: 'Panoramic Sky Terrace', color: '0x0E1117' }
];

for (const s of scenes) {
  const outPath = path.join(dir, s.file);
  // generate 1080x1920 solid architectural image
  const cmd = `ffmpeg -y -f lavfi -i color=c=${s.color}:s=1080x1920:d=1 -frames:v 1 "${outPath}"`;
  execSync(cmd, { stdio: 'inherit' });
  console.log('Created ' + outPath);
}
console.log('All 5 sample images generated.');
