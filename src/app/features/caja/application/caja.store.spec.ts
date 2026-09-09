import { signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MetricasDiariasService } from '../../../shared/services/metricas-diarias.service';
import { PedidosService } from '../../../shared/services/pedidos.service';
import { ProductosService } from '../../../shared/services/productos.service';
import { Producto } from '../../productos/domain/producto.model';
import { SesionCaja } from '../domain/sesion-caja.model';
import { SesionCajaRepository } from '../domain/sesion-caja.repository';
import { CajaStore } from './caja.store';

describe('CajaStore', () => {
  const productos = signal<Producto[]>([]);
  const categorias = signal<string[]>([]);
  const metricas = signal({
    fecha: new Date(),
    pedidosCreados: 0,
    pendientes: 0,
    enPreparacion: 0,
    listos: 0,
    entregados: 0,
    cancelados: 0,
    totalVentas: 0,
    tiempoPromedioPreparacionMin: 0,
  });
  const repository = {
    consultarActual: vi.fn(() => of(null as SesionCaja | null)),
    listarHistorial: vi.fn(() => of([] as SesionCaja[])),
    consultarCerrada: vi.fn(() => of(sesionCerrada())),
    listarVentas: vi.fn(() => of([])),
    abrir: vi.fn(() => of(sesionAbierta())),
    cerrar: vi.fn(() => of(sesionCerrada())),
    eliminar: vi.fn(() => of(void 0)),
    reiniciar: vi.fn(() => of({ sesionCerrada: sesionCerrada(), sesionAbierta: sesionAbierta({ id: 2 }) })),
  };
  const pedidosService = {
    guardando: signal(false),
    error: signal<string | null>(null),
    crear: vi.fn(async () => true),
  };
  const metricasService = {
    metricas,
    error: signal<string | null>(null),
    cargar: vi.fn(async () => true),
  };

  beforeEach(() => {
    productos.set([]);
    categorias.set([]);
    repository.consultarActual.mockReturnValue(of(null as SesionCaja | null));
    repository.listarHistorial.mockReturnValue(of([] as SesionCaja[]));
    repository.consultarCerrada.mockReturnValue(of(sesionCerrada()));
    repository.listarVentas.mockReturnValue(of([]));
    repository.abrir.mockReturnValue(of(sesionAbierta()));
    repository.cerrar.mockReturnValue(of(sesionCerrada()));
    repository.eliminar.mockReturnValue(of(void 0));
    repository.reiniciar.mockReturnValue(of({
      sesionCerrada: sesionCerrada(),
      sesionAbierta: sesionAbierta({ id: 2 }),
    }));
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        CajaStore,
        { provide: ProductosService, useValue: { productos, categorias } },
        { provide: PedidosService, useValue: pedidosService },
        { provide: MetricasDiariasService, useValue: metricasService },
        { provide: SesionCajaRepository, useValue: repository },
      ],
    });
  });

  it('mantiene el precio final al calcular carrito y cantidades', () => {
    const store = TestBed.inject(CajaStore);
    const producto: Producto = {
      id: 1,
      nombre: 'Papas',
      categoria: 'Papas fritas',
      categoriaId: 1,
      precioVenta: 2000,
      costo: 900,
      disponible: true,
      icono: '🍟',
    };

    store.agregarProducto(producto);
    store.agregarProducto(producto);

    expect(store.totalItems()).toBe(2);
    expect(store.subtotal()).toBe(4000);
    expect(store.carrito()[0].precioUnitario).toBe(2000);
  });

  it('limita cada producto a 99 unidades', () => {
    const store = TestBed.inject(CajaStore);
    const producto: Producto = {
      id: 1,
      nombre: 'Papas',
      categoria: 'Papas fritas',
      categoriaId: 1,
      precioVenta: 2000,
      costo: 900,
      disponible: true,
      icono: '🍟',
    };
    store.carrito.set([
      {
        productoId: 1,
        nombre: producto.nombre,
        icono: producto.icono,
        precioUnitario: producto.precioVenta,
        costoUnitario: producto.costo ?? 0,
        cantidad: 99,
      },
    ]);

    store.agregarProducto(producto);
    store.incrementarItem(producto.id);

    expect(store.cantidadEnCarrito(producto.id)).toBe(99);
    expect(store.avisoCarrito()).toContain('99');
  });

  it('envia el tipo de entrega predeterminado al confirmar', async () => {
    repository.consultarActual.mockReturnValue(of(sesionAbierta({
      ventasEfectivo: 2000,
      efectivoEsperado: 17000,
    })));
    const store = TestBed.inject(CajaStore);
    store.sesionCaja.set(sesionAbierta());
    store.carrito.set([
      {
        productoId: 1,
        nombre: 'Papas',
        icono: '🍟',
        precioUnitario: 2000,
        costoUnitario: 900,
        cantidad: 1,
      },
    ]);

    expect(await store.crearPedido()).toBe(true);
    expect(pedidosService.crear).toHaveBeenCalledWith(
      expect.objectContaining({ tipoEntrega: 'Para llevar' }),
    );
    expect(metricasService.cargar).toHaveBeenCalled();
    expect(repository.consultarActual).toHaveBeenCalledTimes(2);
    expect(store.sesionCaja()?.efectivoEsperado).toBe(17000);
  });

  it('bloquea ventas cuando el turno abierto pertenece a otro dia', async () => {
    const store = TestBed.inject(CajaStore);
    const ayer = new Date();
    ayer.setDate(ayer.getDate() - 1);
    store.sesionCaja.set(sesionAbierta({ abiertaEn: ayer }));
    store.carrito.set([
      {
        productoId: 1,
        nombre: 'Papas',
        icono: '🍟',
        precioUnitario: 2000,
        costoUnitario: 900,
        cantidad: 1,
      },
    ]);

    expect(await store.crearPedido()).toBe(false);

    expect(pedidosService.crear).not.toHaveBeenCalled();
    expect(store.errorCaja()).toBe('El turno abierto pertenece a otro día. Reinicia la caja antes de vender.');
  });

  it('carga y selecciona una sesion cerrada mediante el puerto', async () => {
    const cerrada = sesionCerrada();
    repository.listarHistorial.mockReturnValue(of([cerrada]));
    repository.consultarCerrada.mockReturnValue(of(cerrada));
    const store = TestBed.inject(CajaStore);

    expect(await store.cargarHistorial()).toBe(true);
    expect(await store.seleccionarSesionHistorial(cerrada.id)).toBe(true);
    expect(store.historialCaja()).toEqual([cerrada]);
    expect(store.sesionHistorial()?.diferencia).toBe(-300);
    expect(repository.listarVentas).toHaveBeenCalledWith(cerrada.id);
  });

  it('incorpora el cierre al historial sin recalcular la conciliacion', async () => {
    const store = TestBed.inject(CajaStore);
    store.sesionCaja.set(sesionAbierta());

    expect(await store.cerrarCaja(14700)).toBe(true);
    expect(store.sesionCaja()).toBeNull();
    expect(store.historialCaja()[0].efectivoDeclarado).toBe(14700);
    expect(store.historialCaja()[0].diferencia).toBe(-300);
  });

  it('muestra la regla de negocio del backend cuando el cierre es rechazado', async () => {
    repository.consultarActual.mockReturnValue(of(sesionAbierta()));
    repository.cerrar.mockReturnValue(throwError(() => new HttpErrorResponse({
      status: 409,
      error: { message: 'No puedes cerrar la caja mientras existan pedidos pendientes' },
    })));
    const store = TestBed.inject(CajaStore);
    await Promise.resolve();

    expect(await store.cerrarCaja(15000)).toBe(false);

    expect(store.errorCaja()).toBe('No puedes cerrar la caja mientras existan pedidos pendientes');
  });

  it('reinicia el turno con clave y limpia el pedido local', async () => {
    const store = TestBed.inject(CajaStore);
    store.sesionCaja.set(sesionAbierta());
    store.carrito.set([{
      productoId: 1,
      nombre: 'Papas',
      icono: '🍟',
      precioUnitario: 2000,
      costoUnitario: 900,
      cantidad: 1,
    }]);

    expect(await store.reiniciarCaja(15000, 1000, 'torrefuerte')).toBe(true);

    expect(repository.reiniciar).toHaveBeenCalledWith(1, 15000, 1000, 'torrefuerte');
    expect(store.sesionCaja()?.id).toBe(2);
    expect(store.historialCaja()[0].estado).toBe('CERRADA');
    expect(store.carrito()).toEqual([]);
  });

  it('elimina un turno del historial cuando no tiene movimientos', async () => {
    const cerrada = sesionCerrada();
    const store = TestBed.inject(CajaStore);
    store.historialCaja.set([cerrada]);
    store.sesionHistorial.set(cerrada);

    expect(await store.eliminarTurno(cerrada.id)).toBe(true);

    expect(repository.eliminar).toHaveBeenCalledWith(cerrada.id);
    expect(store.historialCaja()).toEqual([]);
    expect(store.sesionHistorial()).toBeNull();
  });
});

function sesionAbierta(overrides: Partial<SesionCaja> = {}): SesionCaja {
  return {
    id: 1,
    estado: 'ABIERTA',
    abiertaPor: 'caja',
    abiertaEn: new Date(),
    saldoInicial: 15000,
    cerradaEn: null,
    cerradaPor: null,
    ventasEfectivo: 0,
    ventasTransferencia: 0,
    gastosEfectivo: 0,
    efectivoEsperado: 15000,
    efectivoDeclarado: null,
    diferencia: null,
    ...overrides,
  };
}

function sesionCerrada(): SesionCaja {
  return {
    ...sesionAbierta(),
    estado: 'CERRADA',
    cerradaEn: new Date('2026-09-07T20:00:00Z'),
    cerradaPor: 'caja',
    efectivoDeclarado: 14700,
    diferencia: -300,
  };
}
