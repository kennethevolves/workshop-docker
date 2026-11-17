import { randomUUID } from 'node:crypto';
import { rm, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { BadRequestException } from '@nestjs/common';
import { UPLOADS_DIR } from '../env';

export type UploadedImage = {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

export async function saveImage(file: UploadedImage | undefined): Promise<string> {
  if (!file) {
    throw new BadRequestException('Envía la imagen en el campo "image"');
  }

  const extension = EXTENSIONS[file.mimetype];
  if (!extension) {
    throw new BadRequestException('La imagen debe ser JPG, PNG o WEBP');
  }

  const filename = `${randomUUID()}${extension}`;
  await writeFile(join(UPLOADS_DIR, filename), file.buffer);
  return filename;
}

export async function removeImage(filename: string | null): Promise<void> {
  if (!filename) {
    return;
  }
  await rm(join(UPLOADS_DIR, basename(filename)), { force: true });
}
