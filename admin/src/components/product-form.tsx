'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import type { FormState } from '@/app/actions';
import { FormError } from '@/components/form-error';
import { ProductImage } from '@/components/product-image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CATEGORIES } from '@/lib/categories';
import type { Product } from '@/lib/types';

const FIELD_CLASS =
  'w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30';

const INITIAL_STATE: FormState = { error: null };

type Props = {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  product?: Product;
  submitLabel: string;
};

export function ProductForm({ action, product, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, INITIAL_STATE);

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name">Nombre</Label>
          <Input id="name" name="name" defaultValue={product?.name} required minLength={3} maxLength={80} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Categoría</Label>
          <select
            id="category"
            name="category"
            defaultValue={product?.category ?? 'LAPTOPS'}
            className={`${FIELD_CLASS} h-8 py-1`}
          >
            {CATEGORIES.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Precio (MXN)</Label>
            <Input id="price" name="price" type="number" min={1} step={1} defaultValue={product?.price} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stock">Existencias</Label>
            <Input id="stock" name="stock" type="number" min={0} step={1} defaultValue={product?.stock ?? 0} required />
          </div>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Descripción</Label>
          <textarea
            id="description"
            name="description"
            rows={4}
            maxLength={1000}
            defaultValue={product?.description}
            className={FIELD_CLASS}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="image">Imagen</Label>
          <div className="flex items-center gap-4">
            {product && <ProductImage product={product} className="size-16 shrink-0 rounded-lg border" />}
            <Input id="image" name="image" type="file" accept="image/jpeg,image/png,image/webp" />
          </div>
          <p className="text-muted-foreground text-xs">JPG, PNG o WEBP de hasta 2 MB.</p>
        </div>

        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input
            type="checkbox"
            name="published"
            defaultChecked={product?.published ?? true}
            className="accent-primary size-4"
          />
          Publicado en la tienda
        </label>
      </div>

      <FormError message={state.error} />

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? 'Guardando…' : submitLabel}
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Cancelar</Link>
        </Button>
      </div>
    </form>
  );
}
