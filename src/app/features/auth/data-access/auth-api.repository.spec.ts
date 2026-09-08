import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '../../../shared/config/api.config';
import { AuthApiRepository } from './auth-api.repository';

describe('AuthApiRepository', () => {
  let repository: AuthApiRepository;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthApiRepository, provideHttpClient(), provideHttpClientTesting()],
    });
    repository = TestBed.inject(AuthApiRepository);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('envia credenciales al login y devuelve la sesion del backend', async () => {
    const result = repository.login('capilla', 'torrefuerte');
    const request = http.expectOne(`${API_BASE_URL}/auth/login`);

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ usuario: 'capilla', contrasena: 'torrefuerte' });
    request.flush({
      accessToken: 'token-admin',
      tokenType: 'Bearer',
      expiresIn: 3600,
      usuario: { id: 1, usuario: 'capilla', nombre: 'Administrador', rol: 'ADMIN' },
    });

    await expect(result).resolves.toMatchObject({
      accessToken: 'token-admin',
      usuario: { usuario: 'capilla', rol: 'ADMIN' },
    });
  });

  it('consulta el usuario autenticado', async () => {
    const result = repository.usuarioActual();
    const request = http.expectOne(`${API_BASE_URL}/auth/me`);

    expect(request.request.method).toBe('GET');
    request.flush({ id: 1, usuario: 'capilla', nombre: 'Administrador', rol: 'ADMIN' });

    await expect(result).resolves.toEqual({
      id: 1,
      usuario: 'capilla',
      nombre: 'Administrador',
      rol: 'ADMIN',
    });
  });

  it('envia la contraseña actual y la nueva al endpoint autenticado', async () => {
    const result = repository.cambiarContrasena('actual123', 'nueva1234');
    const request = http.expectOne(`${API_BASE_URL}/auth/contrasena`);

    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({ contrasenaActual: 'actual123', nuevaContrasena: 'nueva1234' });
    request.flush(null);

    await expect(result).resolves.toBeNull();
  });
});
