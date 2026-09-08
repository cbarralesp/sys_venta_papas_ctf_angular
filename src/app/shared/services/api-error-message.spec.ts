import { HttpErrorResponse } from '@angular/common/http';
import { describe, expect, it } from 'vitest';

import { apiErrorMessage } from './api-error-message';

describe('apiErrorMessage', () => {
  it('usa el mensaje del contrato JSON del backend', () => {
    const error = new HttpErrorResponse({
      status: 409,
      error: {
        code: 'BUSINESS_RULE_VIOLATION',
        message: 'No puedes cerrar la caja con pedidos pendientes',
      },
    });

    expect(apiErrorMessage(error, 'Mensaje generico')).toBe(
      'No puedes cerrar la caja con pedidos pendientes',
    );
  });

  it('usa un mensaje claro cuando el backend no responde', () => {
    const error = new HttpErrorResponse({ status: 0 });

    expect(apiErrorMessage(error, 'Mensaje generico')).toContain('Java esté levantado');
  });

  it('mantiene el fallback si el error no trae mensaje utilizable', () => {
    const error = new HttpErrorResponse({ status: 500, error: { code: 'ERROR' } });

    expect(apiErrorMessage(error, 'Mensaje generico')).toBe('Mensaje generico');
  });
});
