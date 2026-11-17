import Link from 'next/link';
import { CATEGORIES } from '@/lib/categories';
import type { Category } from '@/lib/types';
import { cn } from '@/lib/utils';

const OPTIONS: { label: string; href: string; value: Category | undefined }[] = [
  { label: 'All', href: '/', value: undefined },
  ...CATEGORIES.map((item) => ({
    label: item.label,
    href: `/?category=${item.slug}`,
    value: item.value,
  })),
];

export function CategoryFilter({ active }: { active: Category | undefined }) {
  return (
    <nav aria-label="Categorías" className="flex flex-wrap gap-2">
      {OPTIONS.map((option) => {
        const isActive = option.value === active;

        return (
          <Link
            key={option.href}
            href={option.href}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'hover:bg-muted rounded-full border px-3 py-1 text-sm transition-colors',
              isActive ? 'border-primary text-primary font-medium' : 'text-muted-foreground',
            )}
          >
            {option.label}
          </Link>
        );
      })}
    </nav>
  );
}
