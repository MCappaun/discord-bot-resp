import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const srcDataDir = path.join(rootDir, 'src', 'data');
const distDataDir = path.join(rootDir, 'dist', 'data');

fs.mkdirSync(distDataDir, { recursive: true });
for (const entry of fs.readdirSync(srcDataDir)) {
  const from = path.join(srcDataDir, entry);
  const to = path.join(distDataDir, entry);
  const stat = fs.statSync(from);
  if (stat.isFile()) {
    fs.copyFileSync(from, to);
  }
}
