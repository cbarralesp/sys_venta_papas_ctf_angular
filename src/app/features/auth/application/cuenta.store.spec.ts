import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthRepository } from '../domain/auth.repository';
import { CuentaStore } from './cuenta.store';

describe('CuentaStore', () => {
  const repository = {
    login: vi.fn(),
    usuarioActual: vi.fn(),
    cambiarContrasena: vi.fn(async () => undefined),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    repository.cambiarContrasena.mockResolvedValue(undefined);
    TestBed.configureTestingModule({
      providers: [CuentaStore, { provide: AuthRepository, useValue: repository }],
    });
  });

  it('confirma el cambio de contraseña', async () => {
    const store = TestBed.inject(CuentaStore);
    expect(await store.cambiarContrasena('actual', 'nueva-segura')).toBe(true);
    expect(repository.cambiarContrasena).toHaveBeenCalledWith('actual', 'nueva-segura');
    expect(store.actualizado()).toBe(true);
  });

  it('mantiene la sesión e informa credenciales incorrectas', async () => {
    repository.cambiarContrasena.mockRejectedValue(new Error('no autorizada'));
    const store = TestBed.inject(CuentaStore);
    expect(await store.cambiarContrasena('incorrecta', 'nueva-segura')).toBe(false);
    expect(store.error()).toContain('contraseña actual');
  });
});
