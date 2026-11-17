import { ApiDown } from '@/components/api-down';
import { CategoryFilter } from '@/components/category-filter';
import { ProductCard } from '@/components/product-card';
import { apiGet } from '@/lib/api';
import { categoryFromSlug } from '@/lib/categories';
import type { Product } from '@/lib/types';

type Props = { searchParams: Promise<{ category?: string }> };

export default async function StorePage({ searchParams }: Props) {
  const { category: categorySlug } = await searchParams;
  const category = categoryFromSlug(categorySlug);
  const products = await apiGet<Product[]>(category ? `/products?category=${category}` : '/products');

  if (!products) {
    return <ApiDown />;
  }

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Catálogo</h1>
        <p className="text-muted-foreground text-sm">
          Laptops, componentes, periféricos y monitores para armar tu setup.
        </p>
      </div>

      <CategoryFilter active={category} />

      {products.length === 0 ? (
        <p className="text-muted-foreground rounded-lg border p-6 text-sm">
          No hay productos que mostrar. ¿Ya corriste el seed de la base de datos?
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
