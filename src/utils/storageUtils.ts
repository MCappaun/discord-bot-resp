import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ClaimedRespawn } from '../data/claimedList.js';

// Obter o diretório correto
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.join(__dirname, '../data/claimedList.json');

export function saveClaimedList(list: ClaimedRespawn[]) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(list, null, 2), 'utf-8');
}

export function loadClaimedList(): ClaimedRespawn[] {
  if (!fs.existsSync(filePath)) return [];
  const data = fs.readFileSync(filePath, 'utf-8');
  try {
    const parsed = JSON.parse(data);
    return parsed.map((item: any) => ({
      ...item,
      expiration: new Date(item.expiration),
      queue: Array.isArray(item.queue)
        ? item.queue.map((entry: any) => {
            if (typeof entry === 'string') {
              return { userId: entry, channelId: item.channelId || '', hours: 2 };
            }
            return {
              userId: entry.userId,
              channelId: entry.channelId || item.channelId || '',
              hours: entry.hours === 1 || entry.hours === 2 ? entry.hours : 2,
            };
          })
        : [],
    }));
  } catch (err) {
    console.error('Erro ao carregar claimedList.json:', err);
    return [];
  }
}
