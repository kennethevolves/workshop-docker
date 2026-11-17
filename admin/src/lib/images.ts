const PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export function imageUrl(image: string | null): string | null {
  return image ? `${PUBLIC_API_URL}/uploads/${image}` : null;
}
