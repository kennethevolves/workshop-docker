import { createProduct } from '@/app/actions';
import { ProductForm } from '@/components/product-form';

export default function NewProductPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Nuevo producto</h1>
      <ProductForm action={createProduct} submitLabel="Crear producto" />
    </div>
  );
}
