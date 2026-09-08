import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../config/api.config';
import { PedidosApiRepository } from '../../features/pedidos/data-access/pedidos-api.repository';
import { PedidosRepository } from '../../features/pedidos/domain/pedidos.repository';
import { PedidosService } from './pedidos.service';

describe('Pedidos HTTP', () => {
  let service: PedidosService;
  let http: HttpTestingController;
  const response = {
    id: 1,
    numero: '001',
    formaPago: 'Efectivo',
    tipoEntrega: 'Para llevar',
    notas: '',
    subtotal: 4000,
    total: 4000,
    estado: 'Pendiente',
    creadoEn: '2026-09-05T20:00:00-04:00',
    iniciadoPreparacionEn: null,
    listoEn: null,
    version: 1,
    entregadoEn: null,
    canceladoEn: null,
    canceladoPor: null,
    motivoCancelacion: null,
    items: [
      {
        productoId: 1,
        nombre: 'Papas',
        icono: '',
        cantidad: 2,
        precioUnitario: 2000,
        costoUnitario: 900,
        subtotal: 4000,
      },
    ],
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PedidosRepository, useClass: PedidosApiRepository },
      ],
    });
    service = TestBed.inject(PedidosService);
    http = TestBed.inject(HttpTestingController);
    http.expectOne(API_BASE_URL + '/pedidos?limite=200').flush([]);
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  afterEach(() => http.verify());

  it('crea un pedido y usa la respuesta calculada por Java', async () => {
    const command = {
      idempotencyKey: 'key-1',
      formaPago: 'Efectivo' as const,
      tipoEntrega: 'Para llevar' as const,
      notas: '',
      items: [{ productoId: 1, cantidad: 2 }],
    };
    const resultado = service.crear(command);
    await Promise.resolve();
    const request = http.expectOne(API_BASE_URL + '/pedidos');
    expect(request.request.body).toEqual(command);
    request.flush(response);
    expect(await resultado).toBe(true);
    expect(service.pedidos()[0].subtotal).toBe(4000);
    expect(service.pedidos()[0].creadoEn).toBeInstanceOf(Date);
  });

  it('no agrega un pedido cuando falla la escritura', async () => {
    const resultado = service.crear({
      idempotencyKey: 'key-2',
      formaPago: 'Efectivo',
      tipoEntrega: 'Para llevar',
      notas: '',
      items: [{ productoId: 99, cantidad: 1 }],
    });
    await Promise.resolve();
    http.expectOne(API_BASE_URL + '/pedidos').flush(
      { message: 'Producto no encontrado' },
      { status: 404, statusText: 'Not Found' },
    );
    expect(await resultado).toBe(false);
    expect(service.pedidos()).toEqual([]);
    expect(service.error()).toBe('Producto no encontrado');
  });

  it('actualiza un estado enviando la version vigente', async () => {
    const crear = service.crear({
      idempotencyKey: 'key-3',
      formaPago: 'Efectivo',
      tipoEntrega: 'Para llevar',
      notas: '',
      items: [{ productoId: 1, cantidad: 1 }],
    });
    await Promise.resolve();
    http.expectOne(API_BASE_URL + '/pedidos').flush(response);
    await crear;
    const resultado = service.actualizarEstado(1, 'En preparación');
    await Promise.resolve();
    const request = http.expectOne(API_BASE_URL + '/pedidos/1/estado');
    expect(request.request.body).toEqual({ estado: 'En preparación', version: 1 });
    request.flush({
      ...response,
      estado: 'En preparación',
      version: 2,
      iniciadoPreparacionEn: '2026-09-05T20:01:00-04:00',
    });
    expect(await resultado).toBe(true);
    expect(service.pedidos()[0].version).toBe(2);
    expect(service.pedidos()[0].iniciadoPreparacionEn).toBeInstanceOf(Date);
  });

  it('recarga el pedido cuando otra pantalla modifico su version', async () => {
    const crear = service.crear({
      idempotencyKey: 'key-4',
      formaPago: 'Efectivo',
      tipoEntrega: 'Para llevar',
      notas: '',
      items: [{ productoId: 1, cantidad: 1 }],
    });
    await Promise.resolve();
    http.expectOne(API_BASE_URL + '/pedidos').flush(response);
    await crear;
    const resultado = service.actualizarEstado(1, 'En preparación');
    await Promise.resolve();
    http
      .expectOne(API_BASE_URL + '/pedidos/1/estado')
      .flush({}, { status: 409, statusText: 'Conflict' });
    await Promise.resolve();
    http
      .expectOne(API_BASE_URL + '/pedidos?limite=200')
      .flush([
        {
          ...response,
          estado: 'Listo',
          version: 3,
          iniciadoPreparacionEn: '2026-09-05T20:01:00-04:00',
          listoEn: '2026-09-05T20:02:00-04:00',
        },
      ]);
    expect(await resultado).toBe(false);
    expect(service.pedidos()[0].estado).toBe('Listo');
    expect(service.error()).toContain('otra pantalla');
  });

  it('anula enviando motivo y version vigente', async () => {
    const crear = service.crear({
      idempotencyKey: 'key-5',
      formaPago: 'Efectivo',
      tipoEntrega: 'Para llevar',
      notas: '',
      items: [{ productoId: 1, cantidad: 1 }],
    });
    await Promise.resolve();
    http.expectOne(API_BASE_URL + '/pedidos').flush(response);
    await crear;

    const resultado = service.cancelar(1, 'Cliente desistió');
    await Promise.resolve();
    const request = http.expectOne(API_BASE_URL + '/pedidos/1/cancelar');
    expect(request.request.body).toEqual({ motivo: 'Cliente desistió', version: 1 });
    request.flush({
      ...response,
      estado: 'Cancelado',
      version: 2,
      canceladoEn: '2026-09-05T20:02:00-04:00',
      canceladoPor: 'caja',
      motivoCancelacion: 'Cliente desistió',
    });

    expect(await resultado).toBe(true);
    expect(service.pedidos()[0].estado).toBe('Cancelado');
    expect(service.pedidos()[0].canceladoEn).toBeInstanceOf(Date);
  });
});
