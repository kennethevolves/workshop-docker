import Link from 'next/link';
import { ProductImage } from '@/components/product-image';
import { StockStatus } from '@/components/stock-status';
import { Tag } from '@/components/tag';
import { categoryLabel } from '@/lib/categories';
import { formatPrice } from '@/lib/format';
import type { Product } from '@/lib/types';

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/producto/${product.slug}`}
      className="group hover:border-primary flex flex-col overflow-hidden rounded-lg border transition-colors"
    >
      <ProductImage product={product} className="aspect-[4/3] border-b" />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <Tag>{categoryLabel(product.category)}</Tag>
        <p className="group-hover:text-primary leading-snug font-medium">{product.name}</p>
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <p className="text-lg font-semibold">{formatPrice(product.price)}</p>
          <span className="text-muted-foreground text-xs">
            <StockStatus stock={product.stock} />
          </span>
        </div>
      </div>
    </Link>
  );
}
