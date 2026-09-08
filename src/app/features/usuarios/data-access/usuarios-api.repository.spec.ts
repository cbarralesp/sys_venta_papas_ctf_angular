import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { API_BASE_URL } from '../../../shared/config/api.config';
import { UsuariosApiRepository } from './usuarios-api.repository';

describe('UsuariosApiRepository', () => {
  let repository: UsuariosApiRepository;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UsuariosApiRepository, provideHttpClient(), provideHttpClientTesting()],
    });
    repository = TestBed.inject(UsuariosApiRepository);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lista y crea usuarios sin exponer contrasenas', async () => {
    const listado = firstValueFrom(repository.listar());
    http.expectOne(`${API_BASE_URL}/usuarios`).flush([]);
    expect(await listado).toEqual([]);

    const creado = firstValueFrom(repository.crear({
      nombreUsuario: 'caja2', nombreVisible: 'Caja 2', contrasena: 'clave1234', rol: 'CAJA',
    }));
    const request = http.expectOne(`${API_BASE_URL}/usuarios`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body.contrasena).toBe('clave1234');
    request.flush({
      id: 4, nombreUsuario: 'caja2', nombreVisible: 'Caja 2', rol: 'CAJA', activo: true,
      bloqueadoHasta: null,
    });
    expect((await creado).activo).toBe(true);
  });

  it('actualiza y restablece contrasena', async () => {
    const actualizar = firstValueFrom(repository.actualizar(2,
      { nombreVisible: 'Caja', rol: 'CAJA', activo: false }));
    const updateRequest = http.expectOne(`${API_BASE_URL}/usuarios/2`);
    expect(updateRequest.request.method).toBe('PUT');
    updateRequest.flush({
      id: 2, nombreUsuario: 'caja', nombreVisible: 'Caja', rol: 'CAJA', activo: false,
      bloqueadoHasta: null,
    });
    await actualizar;

    const reset = firstValueFrom(repository.restablecerContrasena(2, 'nuevaClave'));
    const resetRequest = http.expectOne(`${API_BASE_URL}/usuarios/2/contrasena`);
    expect(resetRequest.request.body).toEqual({ nuevaContrasena: 'nuevaClave' });
    resetRequest.flush(null);
    await reset;
  });
});
