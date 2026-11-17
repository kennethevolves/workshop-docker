import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

if (existsSync('.env')) {
  process.loadEnvFile();
}

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}`);
  }
  return value;
}

export const UPLOADS_DIR = resolve(process.env.UPLOADS_DIR ?? 'uploads');
