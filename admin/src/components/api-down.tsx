import { TriangleAlertIcon } from 'lucide-react';

export function ApiDown() {
  return (
    <div
      role="alert"
      className="border-destructive/30 text-destructive flex items-start gap-3 rounded-lg border p-4"
    >
      <TriangleAlertIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div className="space-y-1 text-sm">
        <p className="font-medium">No se pudo conectar con el API</p>
        <p>
          Revisa que el API esté corriendo y que la variable{' '}
          <code className="font-mono">API_URL</code> sea correcta.
        </p>
      </div>
    </div>
  );
}
