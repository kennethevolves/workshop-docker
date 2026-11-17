import { TriangleAlertIcon } from 'lucide-react';

export function FormError({ message }: { message: string | null }) {
  if (!message) {
    return null;
  }

  return (
    <p
      role="alert"
      className="border-destructive/30 text-destructive flex items-start gap-2 rounded-lg border px-3 py-2 text-sm"
    >
      <TriangleAlertIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}
