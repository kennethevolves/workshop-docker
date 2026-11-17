'use client';

import { useActionState } from 'react';
import { login, type FormState } from '@/app/actions';
import { FormError } from '@/components/form-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const INITIAL_STATE: FormState = { error: null };

export function LoginForm() {
  const [state, action, pending] = useActionState(login, INITIAL_STATE);

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Correo</Label>
        <Input id="email" name="email" type="email" autoComplete="username" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>

      <FormError message={state.error} />

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? 'Entrando…' : 'Iniciar sesión'}
      </Button>
    </form>
  );
}
