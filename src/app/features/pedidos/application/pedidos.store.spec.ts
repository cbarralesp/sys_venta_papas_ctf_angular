import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MetricasDiariasService } from '../../../shared/services/metricas-diarias.service';
import { PedidosService } from '../../../shared/services/pedidos.service';
import { PedidoGestion } from '../domain/pedido-gestion.model';
import { PedidosStore } from './pedidos.store';

describe('PedidosStore', () => {
  const pedidos = signal<PedidoGestion[]>([]);
  const pedidosService = {
    pedidos: pedidos.asReadonly(),
    cargando: signal(false),
    guardando: signal(false),
    error: signal<string | null>(null),
    cargar: vi.fn(async () => true),
    buscarPorId: vi.fn(async () => true),
    actualizarEstado: vi.fn(async () => true),
    cancelar: vi.fn(async () => true),
  };
  const metricasService = {
    metricas: signal({
      fecha: new Date(),
      pedidosCreados: 2,
      pendientes: 1,
      enPreparacion: 0,
      listos: 0,
      entregados: 1,
      cancelados: 0,
      totalVentas: 2000,
      tiempoPromedioPreparacionMin: 5,
    }),
    error: signal<string | null>(null),
    cargar: vi.fn(async () => true),
  };

  beforeEach(() => {
    pedidos.set([]);
    pedidosService.cargar.mockReset();
    pedidosService.cargar.mockResolvedValue(true);
    pedidosService.actualizarEstado.mockReset();
    pedidosService.actualizarEstado.mockResolvedValue(true);
    metricasService.cargar.mockClear();
    TestBed.configureTestingModule({
      providers: [
        PedidosStore,
        { provide: PedidosService, useValue: pedidosService },
        { provide: MetricasDiariasService, useValue: metricasService },
      ],
    });
  });

  it('combina filtro de estado y busqueda por numero', () => {
    pedidos.set([
      pedido({ id: 1, numero: 'P-001', estado: 'Pendiente' }),
      pedido({ id: 2, numero: 'P-002', estado: 'Entregado' }),
    ]);
    const store = TestBed.inject(PedidosStore);

    store.seleccionarFiltro('Pendiente');
    store.buscar('001');

    expect(store.pedidosFiltrados().map((item) => item.id)).toEqual([1]);
    expect(store.contarPorEstado('Entregado')).toBe(1);
  });

  it('solo solicita la transicion siguiente permitida', async () => {
    pedidos.set([pedido({ id: 3, estado: 'En preparación' })]);
    const store = TestBed.inject(PedidosStore);

    expect(await store.avanzarEstado(3)).toBe(true);
    expect(pedidosService.actualizarEstado).toHaveBeenCalledWith(3, 'Listo');
    expect(store.etiquetaSiguienteEstado('Entregado')).toBeNull();
  });

  it('actualiza metricas solamente despues de sincronizar pedidos', async () => {
    const store = TestBed.inject(PedidosStore);
    metricasService.cargar.mockClear();

    pedidosService.cargar.mockResolvedValueOnce(false);
    expect(await store.sincronizar()).toBe(false);
    expect(metricasService.cargar).not.toHaveBeenCalled();

    pedidosService.cargar.mockResolvedValueOnce(true);
    expect(await store.sincronizar()).toBe(true);
    expect(metricasService.cargar).toHaveBeenCalledOnce();
  });
});

function pedido(overrides: Partial<PedidoGestion> = {}): PedidoGestion {
  return {
    id: 1,
    numero: 'P-001',
    items: [{ nombre: 'Papas', cantidad: 1, precioUnitario: 2000, costoUnitario: 900 }],
    formaPago: 'Efectivo',
    tipoEntrega: 'Para llevar',
    notas: '',
    subtotal: 2000,
    total: 2000,
    estado: 'Pendiente',
    creadoEn: new Date('2026-09-07T12:00:00Z'),
    version: 0,
    ...overrides,
  };
}
