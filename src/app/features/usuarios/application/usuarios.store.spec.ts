import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { UsuarioAdministracion } from '../domain/usuario-administracion.model';
import { UsuariosRepository } from '../domain/usuarios.repository';
import { UsuariosStore } from './usuarios.store';

describe('UsuariosStore', () => {
  const usuario: UsuarioAdministracion = {
    id: 1,
    nombreUsuario: 'capilla',
    nombreVisible: 'Administrador',
    rol: 'ADMIN',
    activo: true,
    bloqueadoHasta: null,
  };
  const repository = {
    listar: vi.fn(() => of([usuario])),
    crear: vi.fn(() => of(usuario)),
    actualizar: vi.fn(() => of(usuario)),
    restablecerContrasena: vi.fn(() => of(undefined)),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    repository.listar.mockReturnValue(of([usuario]));
    repository.crear.mockReturnValue(of(usuario));
    repository.actualizar.mockReturnValue(of(usuario));
    repository.restablecerContrasena.mockReturnValue(of(undefined));
    TestBed.configureTestingModule({
      providers: [UsuariosStore, { provide: UsuariosRepository, useValue: repository }],
    });
  });

  it('carga los usuarios desde el puerto', async () => {
    const store = TestBed.inject(UsuariosStore);
    await Promise.resolve();
    expect(store.usuarios()).toEqual([usuario]);
  });

  it('crea y recarga la lista confirmada por el backend', async () => {
    const store = TestBed.inject(UsuariosStore);
    await Promise.resolve();
    const command = {
      nombreUsuario: 'caja',
      nombreVisible: 'Caja',
      contrasena: 'segura123',
      rol: 'CAJA' as const,
    };
    expect(await store.crear(command)).toBe(true);
    expect(repository.crear).toHaveBeenCalledWith(command);
    expect(repository.listar).toHaveBeenCalledTimes(2);
  });

  it('propaga un mensaje de negocio cuando una actualización es rechazada', async () => {
    const store = TestBed.inject(UsuariosStore);
    await Promise.resolve();
    repository.actualizar.mockReturnValue(throwError(() => new HttpErrorResponse({
      status: 409,
      error: { message: 'Debe existir al menos un administrador activo' },
    })));
    expect(await store.actualizar(1, { nombreVisible: 'Admin', rol: 'ADMIN', activo: false })).toBe(
      false,
    );
    expect(store.error()).toBe('Debe existir al menos un administrador activo');
  });
});
