import { CpuIcon, KeyboardIcon, LaptopIcon, MonitorIcon, type LucideIcon } from 'lucide-react';
import { imageUrl } from '@/lib/images';
import type { Category, Product } from '@/lib/types';
import { cn } from '@/lib/utils';

const ICONS: Record<Category, LucideIcon> = {
  LAPTOPS: LaptopIcon,
  COMPONENTS: CpuIcon,
  PERIPHERALS: KeyboardIcon,
  MONITORS: MonitorIcon,
};

export function ProductImage({
  product,
  className,
}: {
  product: Pick<Product, 'name' | 'image' | 'category'>;
  className?: string;
}) {
  const src = imageUrl(product.image);
  const Icon = ICONS[product.category];

  return (
    <div className={cn('bg-muted flex items-center justify-center overflow-hidden', className)}>
      {src ? (
        <img src={src} alt={product.name} className="size-full object-cover" />
      ) : (
        <Icon className="text-muted-foreground size-1/3 max-h-16 max-w-16" aria-hidden="true" />
      )}
    </div>
  );
}
