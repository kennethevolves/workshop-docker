import type { Category } from '@/lib/types';

export const CATEGORIES: { value: Category; label: string; slug: string }[] = [
  { value: 'LAPTOPS', label: 'Laptops', slug: 'laptops' },
  { value: 'COMPONENTS', label: 'Components', slug: 'components' },
  { value: 'PERIPHERALS', label: 'Peripherals', slug: 'peripherals' },
  { value: 'MONITORS', label: 'Monitors', slug: 'monitors' },
];

export function categoryLabel(category: Category): string {
  return CATEGORIES.find((item) => item.value === category)?.label ?? category;
}

export function categoryFromSlug(slug: string | undefined): Category | undefined {
  return CATEGORIES.find((item) => item.slug === slug)?.value;
}
