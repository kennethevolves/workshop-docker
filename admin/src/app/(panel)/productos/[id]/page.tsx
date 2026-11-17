import { notFound, redirect } from 'next/navigation';
import { updateProduct } from '@/app/actions';
import { ApiDown } from '@/components/api-down';
import { ProductForm } from '@/components/product-form';
import { apiFetch } from '@/lib/api';
import { requireToken } from '@/lib/session';
import type { Product } from '@/lib/types';

type Props = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const productId = Number(id);

  if (!Number.isInteger(productId)) {
    notFound();
  }

  const token = await requireToken();
  const result = await apiFetch<Product>(`/admin/products/${productId}`, { token });

  if (!result.ok) {
    if (result.status === 404) {
      notFound();
    }
    if (result.status === 401) {
      redirect('/login');
    }
    return <ApiDown />;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Editar producto</h1>
      <ProductForm
        action={updateProduct.bind(null, result.data.id)}
        product={result.data}
        submitLabel="Guardar cambios"
      />
    </div>
  );
}
