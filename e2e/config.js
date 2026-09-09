import path from 'node:path';
import fs from 'node:fs';

const envCandidates = ['.env', 'artillery.env'];
for (const envFile of envCandidates) {
  const fullPath = path.resolve(process.cwd(), envFile);
  if (fs.existsSync(fullPath)) {
    const lines = fs.readFileSync(fullPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...vals] = trimmed.split('=');
        const val = vals.join('=').trim();
        if (!process.env[key.trim()]) {
          process.env[key.trim()] = val;
        }
      }
    }
  }
}

export const CONFIG = {
  BASE_URL: process.env.TARGET_URL || 'https://medev-backend.onrender.com/api',
  TIMEOUT_MS: 35000,
  MAX_RETRIES: 2,
  ADMIN_EMAIL: process.env.MEDEV_ADMIN_EMAIL || null,
  ADMIN_PASSWORD: process.env.MEDEV_ADMIN_PASSWORD || null,
};
