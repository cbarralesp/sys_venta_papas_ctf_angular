import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthRepository } from '../../features/auth/domain/auth.repository';
import { AuthSession, AuthUser } from '../../features/auth/domain/auth.model';
import { AuthService } from './auth.service';

class AuthRepositoryStub implements AuthRepository {
  login(usuario: string, contrasena: string): Promise<AuthSession> {
    if (usuario !== 'caja' || contrasena !== 'caja123') {
      return Promise.reject(new HttpErrorResponse({
        status: 401,
        error: { message: 'Credenciales invalidas' },
      }));
    }
    return Promise.resolve({
      accessToken: 'token',
      tokenType: 'Bearer',
      expiresIn: 3600,
      usuario: { id: 2, usuario: 'caja', nombre: 'Operador', rol: 'CAJA' },
    });
  }

  usuarioActual(): Promise<AuthUser> {
    return Promise.reject(new Error('not needed'));
  }

  cambiarContrasena(): Promise<void> {
    return Promise.resolve();
  }
}

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [{ provide: AuthRepository, useClass: AuthRepositoryStub }],
    });
    service = TestBed.inject(AuthService);
  });

  afterEach(() => sessionStorage.clear());

  it('inicia y cierra una sesion con rol', async () => {
    expect(await service.login('caja', 'caja123')).toBe(true);
    expect(service.autenticado()).toBe(true);
    expect(service.tieneRol('CAJA')).toBe(true);
    service.logout();
    expect(service.autenticado()).toBe(false);
  });

  it('rechaza credenciales invalidas sin conservar sesion', async () => {
    expect(await service.login('caja', 'incorrecta')).toBe(false);
    expect(service.autenticado()).toBe(false);
    expect(service.error()).toBe('Credenciales invalidas');
  });

  it('limpia el error anterior al iniciar sesion correctamente', async () => {
    await service.login('caja', 'incorrecta');

    expect(await service.login('caja', 'caja123')).toBe(true);

    expect(service.error()).toBeNull();
  });
});
