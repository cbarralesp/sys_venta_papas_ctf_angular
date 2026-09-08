import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { API_BASE_URL } from '../../../shared/config/api.config';
import { MetricasDiariasApiRepository } from './metricas-diarias-api.repository';

describe('MetricasDiariasApiRepository', () => {
  let repository: MetricasDiariasApiRepository;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MetricasDiariasApiRepository, provideHttpClient(), provideHttpClientTesting()],
    });
    repository = TestBed.inject(MetricasDiariasApiRepository);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('consulta metricas y convierte la fecha como dia local', async () => {
    const resultado = firstValueFrom(repository.consultarHoy());
    const request = http.expectOne(`${API_BASE_URL}/metricas/hoy`);
    expect(request.request.method).toBe('GET');
    request.flush({
      fecha: '2026-09-06',
      pedidosCreados: 5,
      pendientes: 1,
      enPreparacion: 1,
      listos: 1,
      entregados: 2,
      cancelados: 0,
      totalVentas: 8000,
      ticketPromedio: 4000,
      tiempoPromedioPreparacionMin: 7,
    });

    const metricas = await resultado;
    expect(metricas.fecha.getFullYear()).toBe(2026);
    expect(metricas.fecha.getMonth()).toBe(8);
    expect(metricas.fecha.getDate()).toBe(6);
    expect(metricas.totalVentas).toBe(8000);
  });
});
