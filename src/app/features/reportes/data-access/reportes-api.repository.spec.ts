import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { API_BASE_URL } from '../../../shared/config/api.config';
import { ReportesApiRepository } from './reportes-api.repository';

describe('ReportesApiRepository', () => {
  let repository: ReportesApiRepository;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ReportesApiRepository, provideHttpClient(), provideHttpClientTesting()],
    });
    repository = TestBed.inject(ReportesApiRepository);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('consulta el rango y convierte las fechas diarias a horario local', async () => {
    const desde = new Date(2026, 8, 1, 0, 0, 0);
    const hasta = new Date(2026, 8, 6, 12, 0, 0);
    const resultado = firstValueFrom(repository.consultarVentas(desde, hasta));
    const request = http.expectOne((req) => req.url === `${API_BASE_URL}/reportes/ventas`);

    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('desde')).toBe(desde.toISOString());
    expect(request.request.params.get('hasta')).toBe(hasta.toISOString());
    request.flush({
      desde: desde.toISOString(),
      hasta: hasta.toISOString(),
      totalVentas: 4000,
      totalPedidos: 1,
      promedioDiario: 666.67,
      ticketPromedio: 4000,
      ventasDiarias: [{ fecha: '2026-09-06', totalVentas: 4000, cantidadPedidos: 1 }],
      productosVendidos: [{
        productoId: 1,
        nombre: 'Papas fritas chicas',
        categoria: 'Papas fritas',
        icono: '🍟',
        cantidadVendida: 2,
        totalGenerado: 4000,
      }],
    });

    const reporte = await resultado;
    expect(reporte.ventasDiarias[0].fecha).toBeInstanceOf(Date);
    expect(reporte.ventasDiarias[0].fecha.getFullYear()).toBe(2026);
    expect(reporte.ventasDiarias[0].fecha.getMonth()).toBe(8);
    expect(reporte.ventasDiarias[0].fecha.getDate()).toBe(6);
    expect(reporte.productosVendidos[0].cantidadVendida).toBe(2);
  });
});
