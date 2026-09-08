import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { API_BASE_URL } from '../../../shared/config/api.config';
import { AjustesApiRepository } from './ajustes-api.repository';

describe('AjustesApiRepository', () => {
  let repository: AjustesApiRepository;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AjustesApiRepository, provideHttpClient(), provideHttpClientTesting()],
    });
    repository = TestBed.inject(AjustesApiRepository);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('consulta y convierte la fecha de auditoria', async () => {
    const resultado = firstValueFrom(repository.consultar());
    const request = http.expectOne(`${API_BASE_URL}/ajustes`);
    expect(request.request.method).toBe('GET');
    request.flush(responseDto());

    const ajustes = await resultado;
    expect(ajustes.actualizadoEn).toBeInstanceOf(Date);
    expect(ajustes.informacion.nombre).toBe('Panel del negocio');
    expect(ajustes.version).toBe(3);
  });

  it('actualiza enviando solo configuracion y version', async () => {
    const dto = responseDto();
    const actualizar = firstValueFrom(repository.actualizar({
      ...dto,
      actualizadoEn: new Date(dto.actualizadoEn),
    }));
    const request = http.expectOne(`${API_BASE_URL}/ajustes`);

    expect(request.request.method).toBe('PUT');
    expect(request.request.body.actualizadoEn).toBeUndefined();
    expect(request.request.body.actualizadoPor).toBeUndefined();
    expect(request.request.body.version).toBe(3);
    request.flush({ ...dto, version: 4 });

    expect((await actualizar).version).toBe(4);
  });

  it('solicita el reinicio de datos operativos con confirmacion', async () => {
    const resultado = firstValueFrom(repository.reiniciarDatosOperativos('REINICIAR'));
    const request = http.expectOne(`${API_BASE_URL}/ajustes/reiniciar-operacion`);

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ confirmacion: 'REINICIAR' });
    request.flush({ pedidosEliminados: 2, gastosEliminados: 1, turnosEliminados: 1 });

    expect(await resultado).toEqual({ pedidosEliminados: 2, gastosEliminados: 1, turnosEliminados: 1 });
  });
});

function responseDto() {
  return {
    informacion: { nombre: 'Panel del negocio', subtitulo: 'Sistema de ventas', icono: '🍟' },
    operativas: { moneda: 'CLP', impuestoPorcentaje: 0, tiempoEstimadoPreparacionMin: 10 },
    notificaciones: { sonidoNuevoPedido: true, alertaPedidoDemorado: true, minutosParaAlertaDemora: 10 },
    actualizadoEn: '2026-09-06T12:00:00-03:00',
    actualizadoPor: 'capilla',
    version: 3,
  };
}
