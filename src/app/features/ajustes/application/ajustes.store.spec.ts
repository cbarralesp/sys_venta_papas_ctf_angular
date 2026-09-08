import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AjustesService } from '../../../shared/services/ajustes.service';
import { AjustesNegocio } from '../domain/ajustes.model';
import { AjustesStore } from './ajustes.store';

describe('AjustesStore', () => {
  const ajustes: AjustesNegocio = {
    informacion: { nombre: 'Capilla', subtitulo: 'Ventas', icono: '' },
    operativas: { moneda: 'CLP', impuestoPorcentaje: 0, tiempoEstimadoPreparacionMin: 10 },
    notificaciones: {
      sonidoNuevoPedido: true,
      alertaPedidoDemorado: true,
      minutosParaAlertaDemora: 10,
    },
    actualizadoEn: new Date(),
    actualizadoPor: 'capilla',
    version: 1,
  };
  const service = {
    ajustes: signal(ajustes),
    cargando: signal(false),
    guardando: signal(false),
    error: signal<string | null>(null),
    cargar: vi.fn(async () => true),
    guardar: vi.fn(async () => true),
    reiniciarDatosOperativos: vi.fn(async () => ({
      pedidosEliminados: 2,
      gastosEliminados: 1,
      turnosEliminados: 1,
    })),
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    service.guardar.mockResolvedValue(true);
    service.reiniciarDatosOperativos.mockResolvedValue({
      pedidosEliminados: 2,
      gastosEliminados: 1,
      turnosEliminados: 1,
    });
    TestBed.configureTestingModule({
      providers: [AjustesStore, { provide: AjustesService, useValue: service }],
    });
  });

  afterEach(() => vi.useRealTimers());

  it('muestra confirmación temporal después de guardar', async () => {
    const store = TestBed.inject(AjustesStore);
    expect(await store.guardarCambios(ajustes)).toBe(true);
    expect(store.guardadoRecientemente()).toBe(true);
    vi.advanceTimersByTime(2600);
    expect(store.guardadoRecientemente()).toBe(false);
  });

  it('no muestra confirmación cuando el backend rechaza el cambio', async () => {
    service.guardar.mockResolvedValue(false);
    const store = TestBed.inject(AjustesStore);
    expect(await store.guardarCambios(ajustes)).toBe(false);
    expect(store.guardadoRecientemente()).toBe(false);
  });

  it('guarda el resultado del reinicio operativo', async () => {
    const store = TestBed.inject(AjustesStore);

    expect(await store.reiniciarDatosOperativos('REINICIAR')).toBe(true);

    expect(service.reiniciarDatosOperativos).toHaveBeenCalledWith('REINICIAR');
    expect(store.reinicioDatosReciente()).toEqual({
      pedidosEliminados: 2,
      gastosEliminados: 1,
      turnosEliminados: 1,
    });
  });
});
