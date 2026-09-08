import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { AjustesNegocio } from '../../ajustes/domain/ajustes.model';
import { PedidoGestion } from '../../pedidos/domain/pedido-gestion.model';
import { AjustesService } from '../../../shared/services/ajustes.service';
import { PedidosService } from '../../../shared/services/pedidos.service';
import { MetricasDiariasService } from '../../../shared/services/metricas-diarias.service';
import { NotificadorCocina } from '../domain/notificador-cocina';
import { CocinaStore } from './cocina.store';

describe('CocinaStore', () => {
  const ahora = new Date('2026-09-06T15:00:00.000Z');
  const pedidos = signal<PedidoGestion[]>([]);
  const ajustes = signal<AjustesNegocio>(ajustesBase());
  const notificar = vi.fn();
  const metricasService = {
    metricas: signal({
      fecha: new Date('2026-09-06T00:00:00'), pedidosCreados: 0, pendientes: 0, enPreparacion: 0,
      listos: 0, entregados: 0, cancelados: 0, totalVentas: 0, ticketPromedio: 0,
      tiempoPromedioPreparacionMin: 0,
    }),
    error: signal<string | null>(null),
    cargar: vi.fn(async () => true),
  };
  const pedidosService = {
    pedidos: pedidos.asReadonly(),
    guardando: signal(false),
    error: signal<string | null>(null),
    cargar: vi.fn(async () => true),
    actualizarEstado: vi.fn(async () => true),
  };

  beforeEach(() => {
    pedidos.set([]);
    ajustes.set(ajustesBase());
    notificar.mockClear();
    pedidosService.cargar.mockReset();
    pedidosService.cargar.mockResolvedValue(true);
    metricasService.cargar.mockClear();
    TestBed.configureTestingModule({
      providers: [
        CocinaStore,
        { provide: PedidosService, useValue: pedidosService },
        { provide: AjustesService, useValue: { ajustes: ajustes.asReadonly() } },
        { provide: NotificadorCocina, useValue: { notificarNuevoPedido: notificar } },
        { provide: MetricasDiariasService, useValue: metricasService },
      ],
    });
  });

  it('marca demora usando el umbral persistido', () => {
    pedidos.set([pedido({ creadoEn: new Date(ahora.getTime() - 11 * 60_000) })]);
    const store = TestBed.inject(CocinaStore);
    store.ahora.set(ahora);

    expect(store.esDemorado(store.pedidos()[0])).toBe(true);
    ajustes.update((actual) => ({
      ...actual,
      notificaciones: { ...actual.notificaciones, alertaPedidoDemorado: false },
    }));
    expect(store.esDemorado(store.pedidos()[0])).toBe(false);
  });

  it('calcula progreso contra el tiempo estimado persistido', () => {
    pedidos.set([pedido({
      estado: 'En preparación',
      iniciadoPreparacionEn: new Date(ahora.getTime() - 4 * 60_000),
    })]);
    const store = TestBed.inject(CocinaStore);
    store.ahora.set(ahora);

    expect(store.tiempoEstimadoPreparacionMin()).toBe(10);
    expect(store.porcentajeTiempoEstimado(store.pedidos()[0])).toBe(40);
  });

  it('notifica cuando la sincronizacion incorpora un pedido pendiente nuevo', async () => {
    pedidos.set([pedido({ id: 1 })]);
    pedidosService.cargar.mockImplementationOnce(async () => {
      pedidos.set([pedido({ id: 2 }), pedido({ id: 1 })]);
      return true;
    });
    const store = TestBed.inject(CocinaStore);

    expect(await store.sincronizar()).toBe(true);
    expect(notificar).toHaveBeenCalledTimes(1);
  });
});

function ajustesBase(): AjustesNegocio {
  return {
    informacion: { nombre: 'Panel del negocio', subtitulo: 'Sistema de ventas', icono: '🍟' },
    operativas: { moneda: 'CLP', impuestoPorcentaje: 0, tiempoEstimadoPreparacionMin: 10 },
    notificaciones: { sonidoNuevoPedido: true, alertaPedidoDemorado: true, minutosParaAlertaDemora: 10 },
    actualizadoEn: new Date(),
    actualizadoPor: 'capilla',
    version: 1,
  };
}

function pedido(overrides: Partial<PedidoGestion> = {}): PedidoGestion {
  return {
    id: 1,
    numero: '001',
    items: [{ nombre: 'Papas fritas', cantidad: 1, precioUnitario: 2000, costoUnitario: 900 }],
    formaPago: 'Efectivo',
    tipoEntrega: 'Para llevar',
    notas: '',
    subtotal: 2000,
    total: 2000,
    estado: 'Pendiente',
    creadoEn: new Date('2026-09-06T14:55:00.000Z'),
    iniciadoPreparacionEn: null,
    listoEn: null,
    version: 0,
    ...overrides,
  };
}
