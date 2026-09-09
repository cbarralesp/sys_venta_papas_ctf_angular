import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MetricasDiariasRepository } from '../../features/metricas/domain/metricas-diarias.repository';
import { MetricasDiariasService } from './metricas-diarias.service';

describe('MetricasDiariasService', () => {
  const metricas = {
    fecha: new Date('2026-09-07T00:00:00'),
    pedidosCreados: 2,
    pendientes: 1,
    enPreparacion: 0,
    listos: 0,
    entregados: 1,
    cancelados: 0,
    totalVentas: 4000,
    tiempoPromedioPreparacionMin: 8,
  };
  const repository = {
    consultarHoy: vi.fn(() => of(metricas)),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    repository.consultarHoy.mockReturnValue(of(metricas));
    TestBed.configureTestingModule({
      providers: [
        MetricasDiariasService,
        { provide: MetricasDiariasRepository, useValue: repository },
      ],
    });
  });

  it('carga las metricas del backend y limpia errores anteriores', async () => {
    const service = TestBed.inject(MetricasDiariasService);

    expect(await service.cargar()).toBe(true);

    expect(service.metricas().totalVentas).toBe(4000);
    expect(service.error()).toBeNull();
  });

  it('muestra el mensaje del backend cuando falla la lectura', async () => {
    repository.consultarHoy.mockReturnValue(throwError(() => new HttpErrorResponse({
      status: 500,
      error: { message: 'No se pudo calcular metricas' },
    })));
    const service = TestBed.inject(MetricasDiariasService);

    expect(await service.cargar()).toBe(false);

    expect(service.error()).toBe('No se pudo calcular metricas');
  });
});
