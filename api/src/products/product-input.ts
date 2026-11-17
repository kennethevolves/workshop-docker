import { BadRequestException } from '@nestjs/common';
import { Category } from '../generated/prisma/enums';

export type ProductInput = {
  name: string;
  description: string;
  category: Category;
  price: number;
  stock: number;
  published: boolean;
};

const CATEGORIES = Object.values(Category);

export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function parseCategory(value: unknown): Category | undefined {
  return typeof value === 'string' && (CATEGORIES as string[]).includes(value)
    ? (value as Category)
    : undefined;
}

export function parseProductInput(body: unknown, partial: false): ProductInput;
export function parseProductInput(body: unknown, partial: true): Partial<ProductInput>;
export function parseProductInput(body: unknown, partial: boolean): Partial<ProductInput> {
  const input = (body ?? {}) as Record<string, unknown>;
  const data: Partial<ProductInput> = {};
  const errors: string[] = [];

  const has = (key: string) => input[key] !== undefined;

  if (has('name') || !partial) {
    const name = typeof input.name === 'string' ? input.name.trim() : '';
    if (name.length < 3 || name.length > 80) {
      errors.push('El nombre debe tener entre 3 y 80 caracteres');
    }
    data.name = name;
  }

  if (has('description') || !partial) {
    const description = typeof input.description === 'string' ? input.description.trim() : '';
    if (description.length > 1000) {
      errors.push('La descripción no puede pasar de 1000 caracteres');
    }
    data.description = description;
  }

  if (has('category') || !partial) {
    const category = parseCategory(input.category);
    if (!category) {
      errors.push(`La categoría debe ser una de: ${CATEGORIES.join(', ')}`);
    }
    data.category = category;
  }

  if (has('price') || !partial) {
    const price = input.price;
    if (typeof price !== 'number' || !Number.isInteger(price) || price <= 0) {
      errors.push('El precio debe ser un número entero mayor a 0');
    }
    data.price = price as number;
  }

  if (has('stock') || !partial) {
    const stock = input.stock ?? 0;
    if (typeof stock !== 'number' || !Number.isInteger(stock) || stock < 0) {
      errors.push('Las existencias deben ser un número entero de 0 en adelante');
    }
    data.stock = stock as number;
  }

  if (has('published')) {
    if (typeof input.published !== 'boolean') {
      errors.push('published debe ser true o false');
    }
    data.published = input.published as boolean;
  } else if (!partial) {
    data.published = true;
  }

  if (errors.length > 0) {
    throw new BadRequestException(errors);
  }

  return data;
}
