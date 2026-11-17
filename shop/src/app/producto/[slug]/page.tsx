import { ArrowLeftIcon } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ApiDown } from '@/components/api-down';
import { ProductImage } from '@/components/product-image';
import { StockStatus } from '@/components/stock-status';
import { Tag } from '@/components/tag';
import { Button } from '@/components/ui/button';
import { apiFetch } from '@/lib/api';
import { categoryLabel } from '@/lib/categories';
import { formatPrice } from '@/lib/format';
import type { Product } from '@/lib/types';

type Props = { params: Promise<{ slug: string }> };

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const result = await apiFetch<Product>(`/products/${encodeURIComponent(slug)}`);

  if (!result.ok) {
    if (result.status === 404) {
      notFound();
    }
    return <ApiDown />;
  }

  const product = result.data;

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/">
          <ArrowLeftIcon aria-hidden="true" />
          Volver al catálogo
        </Link>
      </Button>

      <div className="grid gap-8 md:grid-cols-2">
        <ProductImage product={product} className="aspect-square rounded-lg border" />

        <div className="space-y-4">
          <Tag>{categoryLabel(product.category)}</Tag>
          <h1 className="text-3xl font-semibold tracking-tight">{product.name}</h1>
          <p className="text-3xl font-semibold">{formatPrice(product.price)}</p>
          <p className="text-sm">
            <StockStatus stock={product.stock} />
          </p>
          <p className="text-muted-foreground leading-relaxed">{product.description}</p>
        </div>
      </div>
    </div>
  );
}
