import { ShieldCheckIcon } from 'lucide-react';
import { LoginForm } from '@/components/login-form';
import { ThemeToggle } from '@/components/theme-toggle';

export default function LoginPage() {
  return (
    <main className="relative flex flex-1 items-center justify-center px-6 py-16">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm space-y-6 rounded-lg border p-6">
        <div className="space-y-1">
          <p className="text-primary flex items-center gap-2 text-sm font-medium">
            <ShieldCheckIcon className="size-4" aria-hidden="true" />
            Nexo Gamer · Admin
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">Inicia sesión</h1>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
