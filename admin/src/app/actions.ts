'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { SESSION_COOKIE, requireToken } from '@/lib/session';
import type { Product } from '@/lib/types';

export type FormState = { error: string | null };

export async function login(_state: FormState, formData: FormData): Promise<FormState> {
  const result = await apiFetch<{ token: string }>('/auth/login', {
    method: 'POST',
    body: {
      email: String(formData.get('email') ?? ''),
      password: String(formData.get('password') ?? ''),
    },
  });

  if (!result.ok) {
    return { error: result.message };
  }

  const store = await cookies();
  store.set(SESSION_COOKIE, result.data.token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.COOKIE_SECURE === 'true',
    path: '/',
    maxAge: 60 * 60 * 8,
  });

  redirect('/');
}

export async function logout() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect('/login');
}

export async function createProduct(_state: FormState, formData: FormData): Promise<FormState> {
  const token = await requireToken();
  const result = await apiFetch<Product>('/admin/products', {
    method: 'POST',
    token,
    body: readProduct(formData),
  });

  if (!result.ok) {
    return handleError(result);
  }

  const uploaded = await uploadImage(result.data.id, formData, token);
  redirect(uploaded ? '/?aviso=creado' : `/productos/${result.data.id}?aviso=imagen-error`);
}

export async function updateProduct(
  id: number,
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const token = await requireToken();
  const result = await apiFetch<Product>(`/admin/products/${id}`, {
    method: 'PATCH',
    token,
    body: readProduct(formData),
  });

  if (!result.ok) {
    return handleError(result);
  }

  const uploaded = await uploadImage(id, formData, token);
  redirect(uploaded ? '/?aviso=guardado' : `/productos/${id}?aviso=imagen-error`);
}

export async function deleteProduct(id: number) {
  const token = await requireToken();
  const result = await apiFetch<void>(`/admin/products/${id}`, { method: 'DELETE', token });

  if (!result.ok && result.status === 401) {
    redirect('/login');
  }

  redirect(result.ok ? '/?aviso=eliminado' : '/?aviso=error');
}

function readProduct(formData: FormData) {
  return {
    name: String(formData.get('name') ?? ''),
    category: String(formData.get('category') ?? ''),
    price: Number(formData.get('price')),
    stock: Number(formData.get('stock')),
    description: String(formData.get('description') ?? ''),
    published: formData.get('published') === 'on',
  };
}

async function uploadImage(id: number, formData: FormData, token: string): Promise<boolean> {
  const image = formData.get('image');

  if (!(image instanceof File) || image.size === 0) {
    return true;
  }

  const upload = new FormData();
  upload.append('image', image, image.name);

  const result = await apiFetch<Product>(`/admin/products/${id}/image`, {
    method: 'POST',
    token,
    formData: upload,
  });

  return result.ok;
}

function handleError(result: { status: number; message: string }): FormState {
  if (result.status === 401) {
    redirect('/login');
  }
  return { error: result.message };
}
