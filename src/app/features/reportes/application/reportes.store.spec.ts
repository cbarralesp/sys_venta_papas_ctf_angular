import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ReporteVentas } from '../domain/reportes.model';
import { ReportesRepository } from '../domain/reportes.repository';
import { ReportesStore } from './reportes.store';

describe('ReportesStore', () => {
  const reporte: ReporteVentas = {
    desde: new Date(),
    hasta: new Date(),
    totalVentas: 6000,
    totalPedidos: 2,
    promedioDiario: 3000,
    ventasDiarias: [
      { fecha: new Date('2026-09-06'), totalVentas: 2000, cantidadPedidos: 1 },
      { fecha: new Date('2026-09-07'), totalVentas: 4000, cantidadPedidos: 1 },
    ],
    productosVendidos: [
      {
        productoId: 1,
        nombre: 'Papas',
        categoria: 'Papas',
        icono: '',
        cantidadVendida: 2,
        totalGenerado: 4000,
      },
      {
        productoId: 2,
        nombre: 'Bebida',
        categoria: 'Bebidas',
        icono: '',
        cantidadVendida: 1,
        totalGenerado: 2000,
      },
    ],
  };
  const repository = { consultarVentas: vi.fn(() => of(reporte)) };

  beforeEach(() => {
    vi.clearAllMocks();
    repository.consultarVentas.mockReturnValue(of(reporte));
    TestBed.configureTestingModule({
      providers: [ReportesStore, { provide: ReportesRepository, useValue: repository }],
    });
  });

  it('calcula mejor día y porcentajes usando la respuesta del backend', async () => {
    const store = TestBed.inject(ReportesStore);
    await Promise.resolve();
    expect(store.mejorDia()?.totalVentas).toBe(4000);
    expect(store.porcentajeDelMaximo(2000)).toBe(50);
    expect(store.porcentajeDelTotalProductos(4000)).toBe(67);
  });

  it('consulta nuevamente al cambiar a mes', async () => {
    const store = TestBed.inject(ReportesStore);
    await Promise.resolve();
    await store.seleccionarRango('Mes');
    expect(repository.consultarVentas).toHaveBeenCalledTimes(2);
  });
});
