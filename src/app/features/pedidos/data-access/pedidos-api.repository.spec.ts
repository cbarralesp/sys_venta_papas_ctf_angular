import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { API_BASE_URL } from '../../../shared/config/api.config';
import { PedidosApiRepository } from './pedidos-api.repository';

describe('PedidosApiRepository', () => {
  let repository: PedidosApiRepository;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PedidosApiRepository, provideHttpClient(), provideHttpClientTesting()],
    });
    repository = TestBed.inject(PedidosApiRepository);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('convierte fechas e items al listar pedidos', async () => {
    const resultado = firstValueFrom(repository.listar());
    const request = http.expectOne(
      (candidate) =>
        candidate.url === `${API_BASE_URL}/pedidos` && candidate.params.get('limite') === '200',
    );
    request.flush([pedidoDto()]);

    const pedido = (await resultado)[0];
    expect(pedido.creadoEn).toBeInstanceOf(Date);
    expect(pedido.iniciadoPreparacionEn).toBeInstanceOf(Date);
    expect(pedido.items[0]).toMatchObject({
      productoId: 1,
      nombre: 'Papas',
      categoria: 'Papas fritas',
      precioUnitario: 2000,
    });
  });

  it('envia completa la creacion con su clave idempotente', async () => {
    const command = {
      idempotencyKey: 'pedido-prueba-1',
      items: [{ productoId: 1, cantidad: 2 }],
      formaPago: 'Efectivo' as const,
      tipoEntrega: 'Para llevar' as const,
      notas: 'Sin sal',
    };
    const resultado = firstValueFrom(repository.crear(command));
    const request = http.expectOne(`${API_BASE_URL}/pedidos`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(command);
    request.flush(pedidoDto());

    expect((await resultado).numero).toBe('P-001');
  });

  it('envia version optimista al avanzar y anular', async () => {
    const avanzar = firstValueFrom(repository.actualizarEstado(1, 'Listo', 4));
    const patchEstado = http.expectOne(`${API_BASE_URL}/pedidos/1/estado`);
    expect(patchEstado.request.method).toBe('PATCH');
    expect(patchEstado.request.body).toEqual({ estado: 'Listo', version: 4 });
    patchEstado.flush({ ...pedidoDto(), estado: 'Listo', version: 5 });
    await avanzar;

    const cancelar = firstValueFrom(repository.cancelar(1, 'Cliente desistio', 5));
    const patchCancelar = http.expectOne(`${API_BASE_URL}/pedidos/1/cancelar`);
    expect(patchCancelar.request.body).toEqual({ motivo: 'Cliente desistio', version: 5 });
    patchCancelar.flush({ ...pedidoDto(), estado: 'Cancelado', version: 6 });
    expect((await cancelar).estado).toBe('Cancelado');
  });
});

function pedidoDto() {
  return {
    id: 1,
    numero: 'P-001',
    sesionCajaId: 1,
    items: [
      {
        productoId: 1,
        nombre: 'Papas',
        categoria: 'Papas fritas',
        icono: '🍟',
        cantidad: 1,
        precioUnitario: 2000,
        costoUnitario: 900,
        subtotal: 2000,
      },
    ],
    formaPago: 'Efectivo',
    tipoEntrega: 'Para llevar',
    notas: '',
    subtotal: 2000,
    total: 2000,
    estado: 'En preparación',
    creadoEn: '2026-09-07T12:00:00Z',
    iniciadoPreparacionEn: '2026-09-07T12:01:00Z',
    listoEn: null,
    entregadoEn: null,
    canceladoEn: null,
    canceladoPor: null,
    motivoCancelacion: null,
    version: 4,
  } as const;
}
