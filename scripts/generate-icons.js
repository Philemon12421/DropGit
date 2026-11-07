import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPngBuffer(width, height, isMaskable = false) {
  // RGBA buffer
  const stride = width * 4;
  const rawData = Buffer.alloc((stride + 1) * height);

  // Background color #0E1015 (14, 16, 21)
  const bgR = 14, bgG = 16, bgB = 21, bgA = 255;
  const fgR = 255, fgG = 255, fgB = 255, fgA = 255;

  const cx = width / 2;
  const cy = height / 2;
  const scale = width / 64;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (stride + 1);
    rawData[rowOffset] = 0; // Filter byte: None

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;

      // Coordinate mapped to 64x64 icon grid
      const gx = x / scale;
      const gy = y / scale;

      let isForeground = false;

      // Arrow stem: x in [30, 34], y in [16, 37]
      if (gx >= 30 && gx <= 34 && gy >= 16 && gy <= 37) {
        isForeground = true;
      }

      // Arrow left arrowhead: line from (32, 37) to (22, 27)
      // d = |(y2-y1)x - (x2-x1)y + x2*y1 - y2*x1| / dist
      if (gy >= 26 && gy <= 38 && gx >= 21 && gx <= 33) {
        const distToDiag1 = Math.abs((27 - 37) * gx - (22 - 32) * gy + 22 * 37 - 27 * 32) / Math.hypot(-10, -10);
        if (distToDiag1 < 2.5) isForeground = true;
      }

      // Arrow right arrowhead: line from (32, 37) to (42, 27)
      if (gy >= 26 && gy <= 38 && gx >= 31 && gx <= 43) {
        const distToDiag2 = Math.abs((27 - 37) * gx - (42 - 32) * gy + 42 * 37 - 27 * 32) / Math.hypot(-10, 10);
        if (distToDiag2 < 2.5) isForeground = true;
      }

      // Base tray: y in [41, 45], x in [18, 46]
      if (gy >= 41 && gy <= 45 && gx >= 18 && gx <= 46) {
        isForeground = true;
      }

      if (isForeground) {
        rawData[pixelOffset] = fgR;
        rawData[pixelOffset + 1] = fgG;
        rawData[pixelOffset + 2] = fgB;
        rawData[pixelOffset + 3] = fgA;
      } else {
        rawData[pixelOffset] = bgR;
        rawData[pixelOffset + 1] = bgG;
        rawData[pixelOffset + 2] = bgB;
        rawData[pixelOffset + 3] = bgA;
      }
    }
  }

  // PNG File Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR Chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type: RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace

  const ihdrChunk = createChunk('IHDR', ihdrData);

  // IDAT Chunk (compressed image data)
  const compressed = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = createChunk('IDAT', compressed);

  // IEND Chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ -1) >>> 0;
}

const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c >>> 0;
}

function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const typeAndData = chunk.subarray(4, 8 + len);
  const crc = crc32(typeAndData);
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPngBuffer(192, 192));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPngBuffer(512, 512));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPngBuffer(512, 512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPngBuffer(180, 180));

console.log('PWA PNG icons generated successfully.');
