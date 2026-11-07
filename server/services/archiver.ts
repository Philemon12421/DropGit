import JSZip from 'jszip';
import { validateUrl } from '../utils/ssrf.ts';

export interface FileToZip {
  path: string;       // relative path in zip (e.g. "components/Button.tsx")
  url: string;        // raw file URL to fetch
  size?: number;
}

export async function createZipFromFiles(
  files: FileToZip[],
  onProgress?: (processed: number, total: number, currentName: string) => void
): Promise<Buffer> {
  const zip = new JSZip();
  const concurrency = 6;
  let processed = 0;

  // Process in chunks
  for (let i = 0; i < files.length; i += concurrency) {
    const chunk = files.slice(i, i + concurrency);
    await Promise.all(
      chunk.map(async (file) => {
        try {
          const validation = validateUrl(file.url);
          if (!validation.valid) {
            console.warn(`Skipping invalid URL for ${file.path}: ${validation.error}`);
            return;
          }

          const headers: HeadersInit = {
            'User-Agent': 'DropGit-Universal-Downloader',
          };
          if (file.url.includes('github') && process.env.GITHUB_TOKEN) {
            headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
          }

          const res = await fetch(file.url, { headers });
          if (res.ok) {
            const arrayBuffer = await res.arrayBuffer();
            zip.file(file.path, Buffer.from(arrayBuffer));
          } else {
            console.warn(`Failed to fetch ${file.path}: HTTP ${res.status}`);
            zip.file(
              file.path + '.error.txt',
              `DropGit was unable to retrieve this file (HTTP ${res.status}).\nSource: ${file.url}`
            );
          }
        } catch (err: any) {
          console.warn(`Error fetching ${file.path}:`, err.message);
          zip.file(
            file.path + '.error.txt',
            `Error retrieving this file: ${err.message}\nSource: ${file.url}`
          );
        } finally {
          processed++;
          if (onProgress) {
            onProgress(processed, files.length, file.path);
          }
        }
      })
    );
  }

  const zipBuffer = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  return zipBuffer;
}
