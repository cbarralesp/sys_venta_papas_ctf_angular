import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { AuthSessionService } from '../services/auth-session.service';
import { authInterceptor } from './auth.interceptor';
import { HttpClient } from '@angular/common/http';

describe('authInterceptor', () => {
  let http: HttpTestingController;
  let client: HttpClient;
  let session: AuthSessionService;
  let router: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    sessionStorage.clear();
    router = { navigate: vi.fn().mockResolvedValue(true) };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: Router, useValue: router },
      ],
    });

    http = TestBed.inject(HttpTestingController);
    client = TestBed.inject(HttpClient);
    session = TestBed.inject(AuthSessionService);
  });

  afterEach(() => {
    http.verify();
    sessionStorage.clear();
  });

  it('agrega el token bearer cuando existe sesion', () => {
    session.guardar({
      accessToken: 'token-admin',
      tokenType: 'Bearer',
      expiresIn: 3600,
      usuario: { id: 1, usuario: 'capilla', nombre: 'Administrador', rol: 'ADMIN' },
    });

    client.get('/api/productos').subscribe();

    const request = http.expectOne('/api/productos');
    expect(request.request.headers.get('Authorization')).toBe('Bearer token-admin');
    request.flush([]);
  });

  it('no agrega Authorization cuando no hay sesion', () => {
    client.get('/api/productos').subscribe();

    const request = http.expectOne('/api/productos');
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush([]);
  });

  it('limpia sesion y redirige a login ante 401 fuera del login', () => {
    session.guardar({
      accessToken: 'token-vencido',
      tokenType: 'Bearer',
      expiresIn: 3600,
      usuario: { id: 1, usuario: 'capilla', nombre: 'Administrador', rol: 'ADMIN' },
    });

    client.get('/api/usuarios').subscribe({ error: () => undefined });
    http.expectOne('/api/usuarios').flush({ message: 'No autorizado' }, { status: 401, statusText: 'Unauthorized' });

    expect(session.token()).toBeNull();
    expect(session.usuario()).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('no redirige cuando falla el login con 401', () => {
    client.post('/api/auth/login', { usuario: 'capilla', contrasena: 'mala' })
      .subscribe({ error: () => undefined });
    http.expectOne('/api/auth/login')
      .flush({ message: 'Credenciales invalidas' }, { status: 401, statusText: 'Unauthorized' });

    expect(router.navigate).not.toHaveBeenCalled();
  });
});
