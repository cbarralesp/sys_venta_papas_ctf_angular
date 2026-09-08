import { TestBed } from '@angular/core/testing';

import { AuthSession } from '../../features/auth/domain/auth.model';
import { AuthSessionService } from './auth-session.service';

describe('AuthSessionService', () => {
  const session: AuthSession = {
    accessToken: 'token-admin',
    tokenType: 'Bearer',
    expiresIn: 3600,
    usuario: { id: 1, usuario: 'capilla', nombre: 'Administrador', rol: 'ADMIN' },
  };

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({});
  });

  afterEach(() => sessionStorage.clear());

  it('guarda token y usuario en memoria y sessionStorage', () => {
    const service = TestBed.inject(AuthSessionService);

    service.guardar(session);

    expect(service.token()).toBe('token-admin');
    expect(service.usuario()?.usuario).toBe('capilla');
    expect(sessionStorage.getItem('venta-papas-auth')).toContain('token-admin');
  });

  it('restaura la sesion almacenada al crearse', () => {
    sessionStorage.setItem('venta-papas-auth', JSON.stringify(session));
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});

    const service = TestBed.inject(AuthSessionService);

    expect(service.token()).toBe('token-admin');
    expect(service.usuario()?.rol).toBe('ADMIN');
  });

  it('limpia token, usuario y storage persistido', () => {
    const service = TestBed.inject(AuthSessionService);
    service.guardar(session);

    service.limpiar();

    expect(service.token()).toBeNull();
    expect(service.usuario()).toBeNull();
    expect(sessionStorage.getItem('venta-papas-auth')).toBeNull();
  });

  it('ignora contenido corrupto almacenado', () => {
    sessionStorage.setItem('venta-papas-auth', '{no-es-json');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});

    const service = TestBed.inject(AuthSessionService);

    expect(service.token()).toBeNull();
    expect(service.usuario()).toBeNull();
  });
});
