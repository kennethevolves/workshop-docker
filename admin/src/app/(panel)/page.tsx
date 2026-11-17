import { PencilIcon, PlusIcon } from 'lucide-react';
import Link from 'next/link';
import { ApiDown } from '@/components/api-down';
import { DeleteProductButton } from '@/components/delete-product-button';
import { ProductImage } from '@/components/product-image';
import { StatusDot } from '@/components/status-dot';
import { Tag } from '@/components/tag';
import { Button } from '@/components/ui/button';
import { apiGet } from '@/lib/api';
import { categoryLabel } from '@/lib/categories';
import { formatPrice } from '@/lib/format';
import { requireToken } from '@/lib/session';
import type { Product } from '@/lib/types';
import { cn } from '@/lib/utils';

export default async function ProductsPage() {
  const token = await requireToken();
  const products = await apiGet<Product[]>('/admin/products', token);

  if (!products) {
    return <ApiDown />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Productos</h1>
          <p className="text-muted-foreground text-sm">{products.length} productos en el catálogo.</p>
        </div>
        <Button asChild>
          <Link href="/productos/nuevo">
            <PlusIcon aria-hidden="true" />
            Nuevo producto
          </Link>
        </Button>
      </div>

      {products.length === 0 ? (
        <p className="text-muted-foreground rounded-lg border p-6 text-sm">
          Todavía no hay productos. Crea el primero o corre el seed de la base de datos.
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted text-muted-foreground text-left">
              <tr>
                <th className="px-4 py-2.5 font-medium">Producto</th>
                <th className="px-4 py-2.5 font-medium">Categoría</th>
                <th className="px-4 py-2.5 text-right font-medium">Precio</th>
                <th className="px-4 py-2.5 text-right font-medium">Existencias</th>
                <th className="px-4 py-2.5 font-medium">Estado</th>
                <th className="px-4 py-2.5">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  className={cn('border-t', !product.published && 'bg-muted text-muted-foreground')}
                >
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-3">
                      <ProductImage product={product} className="size-10 shrink-0 rounded-md border" />
                      <div className="min-w-0">
                        <p className="truncate font-medium">{product.name}</p>
                        <p className="text-muted-foreground truncate font-mono text-xs">{product.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <Tag>{categoryLabel(product.category)}</Tag>
                  </td>
                  <td className="px-4 py-2 text-right font-mono">{formatPrice(product.price)}</td>
                  <td className="px-4 py-2 text-right font-mono">{product.stock}</td>
                  <td className="px-4 py-2">
                    <StatusDot active={product.published} label={product.published ? 'Publicado' : 'Oculto'} />
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" asChild>
                        <Link href={`/productos/${product.id}`} aria-label={`Editar ${product.name}`}>
                          <PencilIcon aria-hidden="true" />
                        </Link>
                      </Button>
                      <DeleteProductButton id={product.id} name={product.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
