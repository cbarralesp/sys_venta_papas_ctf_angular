import { HttpErrorResponse } from '@angular/common/http';

type ApiErrorPayload = {
  message?: unknown;
};

const CONNECTION_ERROR =
  'No hay conexión con el backend. Verifica que Java esté levantado y vuelve a intentar.';

export function apiErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof HttpErrorResponse)) return fallback;
  if (error.status === 0) return CONNECTION_ERROR;

  const payload = error.error as ApiErrorPayload | null;
  if (payload && typeof payload === 'object' && typeof payload.message === 'string') {
    const message = payload.message.trim();
    if (message.length > 0) return message;
  }

  return fallback;
}
