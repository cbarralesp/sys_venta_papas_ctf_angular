import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { API_BASE_URL } from '../../../shared/config/api.config';
import { AuditoriaApiRepository } from './auditoria-api.repository';

describe('AuditoriaApiRepository', () => {
  let repository: AuditoriaApiRepository;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuditoriaApiRepository, provideHttpClient(), provideHttpClientTesting()],
    });
    repository = TestBed.inject(AuditoriaApiRepository);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('consulta la actividad reciente con un limite explicito', async () => {
    const resultado = firstValueFrom(repository.listarRecientes(50));
    const request = http.expectOne(`${API_BASE_URL}/auditoria?limite=50`);
    expect(request.request.method).toBe('GET');
    request.flush([{
      id: 1,
      actor: 'capilla',
      accion: 'USUARIO_CREADO',
      recurso: 'USUARIO',
      recursoId: '4',
      detalle: 'Usuario creado con rol CAJA',
      fecha: '2026-09-06T19:00:00-03:00',
    }]);

    expect((await resultado)[0].actor).toBe('capilla');
  });
});
