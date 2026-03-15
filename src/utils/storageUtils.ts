import fs from 'fs';
import path from 'path';
import { ClaimedRespawn } from '../data/claimedList.js';

// Obter o diretório correto
const __dirname = path.dirname(new URL(import.meta.url).pathname);
const filePath = path.join(__dirname, '../data/claimedList.json');

export function saveClaimedList(list: ClaimedRespawn[]) {
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
              return { userId: entry, channelId: item.channelId || '' };
            }
            return { userId: entry.userId, channelId: entry.channelId || item.channelId || '' };
          })
        : [],
    }));
  } catch (err) {
    console.error('Erro ao carregar claimedList.json:', err);
    return [];
  }
}
