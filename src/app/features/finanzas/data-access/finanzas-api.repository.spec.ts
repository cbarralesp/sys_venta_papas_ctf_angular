import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { API_BASE_URL } from '../../../shared/config/api.config';
import { FinanzasApiRepository } from './finanzas-api.repository';

describe('FinanzasApiRepository', () => {
  let repository: FinanzasApiRepository;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FinanzasApiRepository, provideHttpClient(), provideHttpClientTesting()],
    });
    repository = TestBed.inject(FinanzasApiRepository);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('consulta el rango en ISO y convierte las fechas del servidor', async () => {
    const desde = new Date('2026-09-01T03:00:00.000Z');
    const hasta = new Date('2026-09-06T04:00:00.000Z');
    const resultado = firstValueFrom(repository.consultarResumen(desde, hasta));
    const request = http.expectOne((req) => req.url === `${API_BASE_URL}/finanzas/resumen`);

    expect(request.request.params.get('desde')).toBe(desde.toISOString());
    expect(request.request.params.get('hasta')).toBe(hasta.toISOString());
    request.flush({
      desde: desde.toISOString(),
      hasta: hasta.toISOString(),
      totalIngresos: 4000,
      totalCostos: 1800,
      totalGastos: 500,
      gananciaBruta: 2200,
      gananciaNeta: 1700,
      ticketPromedio: 4000,
      cantidadVentas: 1,
      movimientos: [{
        id: 'VENTA-1',
        descripcion: 'Pedido #001',
        fecha: '2026-09-05T23:00:00Z',
        formaPago: 'Efectivo',
        monto: 4000,
        costo: 1800,
        categoria: 'Venta entregada',
        tipo: 'Venta',
      }],
      ventasPorCategoria: [{ categoria: 'Papas fritas', ingresos: 4000, costos: 1800, ganancia: 2200 }],
      ventasPorFormaPago: [{ formaPago: 'Efectivo', total: 4000, cantidad: 1 }],
    });

    const resumen = await resultado;
    expect(resumen.movimientos[0].fecha).toBeInstanceOf(Date);
    expect(resumen.movimientos[0].tipo).toBe('Venta');
    expect(resumen.totalIngresos).toBe(4000);
    expect(resumen.gananciaNeta).toBe(1700);
  });

  it('crea y elimina un gasto mediante el contrato HTTP', async () => {
    const fecha = new Date('2026-09-06T16:00:00.000Z');
    const crear = firstValueFrom(repository.crearGasto({
      descripcion: 'Compra de aceite', categoria: 'Insumos', formaPago: 'Efectivo', monto: 12500, fecha,
    }));
    const post = http.expectOne(`${API_BASE_URL}/finanzas/gastos`);
    expect(post.request.method).toBe('POST');
    expect(post.request.body).toEqual({
      descripcion: 'Compra de aceite', categoria: 'Insumos', formaPago: 'Efectivo', monto: 12500,
      fecha: fecha.toISOString(),
    });
    post.flush({ id: 1 });
    await crear;

    const eliminar = firstValueFrom(repository.eliminarGasto(1));
    const del = http.expectOne(`${API_BASE_URL}/finanzas/gastos/1`);
    expect(del.request.method).toBe('DELETE');
    del.flush(null);
    await eliminar;
  });
});
