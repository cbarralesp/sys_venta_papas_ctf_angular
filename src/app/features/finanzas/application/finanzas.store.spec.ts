import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CrearGastoCommand, ResumenFinanciero } from '../domain/finanzas.model';
import { FinanzasRepository } from '../domain/finanzas.repository';
import { FinanzasStore } from './finanzas.store';

describe('FinanzasStore', () => {
  const resumen: ResumenFinanciero = {
    desde: new Date('2026-09-01T00:00:00-04:00'),
    hasta: new Date('2026-09-07T12:00:00-04:00'),
    totalIngresos: 10000,
    totalCostos: 4000,
    totalGastos: 1000,
    gananciaBruta: 6000,
    gananciaNeta: 5000,
    ticketPromedio: 5000,
    cantidadVentas: 2,
    movimientos: [],
    ventasPorCategoria: [],
    ventasPorFormaPago: [],
  };
  const repository = {
    consultarResumen: vi.fn(() => of(resumen)),
    crearGasto: vi.fn(() => of(undefined)),
    eliminarGasto: vi.fn(() => of(undefined)),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    repository.consultarResumen.mockReturnValue(of(resumen));
    repository.crearGasto.mockReturnValue(of(undefined));
    repository.eliminarGasto.mockReturnValue(of(undefined));
    TestBed.configureTestingModule({
      providers: [FinanzasStore, { provide: FinanzasRepository, useValue: repository }],
    });
  });

  it('carga el resumen y calcula el margen neto', async () => {
    const store = TestBed.inject(FinanzasStore);
    await Promise.resolve();
    expect(store.totalIngresos()).toBe(10000);
    expect(store.margenPorcentaje()).toBe(50);
  });

  it('registra un gasto y vuelve a consultar el resumen', async () => {
    const store = TestBed.inject(FinanzasStore);
    await Promise.resolve();
    const command: CrearGastoCommand = {
      descripcion: 'Aceite',
      categoria: 'Insumos',
      formaPago: 'Efectivo',
      monto: 1000,
      fecha: new Date(),
    };
    expect(await store.crearGasto(command)).toBe(true);
    expect(repository.crearGasto).toHaveBeenCalledWith(command);
    expect(repository.consultarResumen).toHaveBeenCalledTimes(2);
  });

  it('informa el error cuando no puede eliminar un gasto', async () => {
    const store = TestBed.inject(FinanzasStore);
    await Promise.resolve();
    repository.eliminarGasto.mockReturnValue(throwError(() => new Error('fallo')));
    expect(await store.eliminarGasto(7)).toBe(false);
    expect(store.error()).toContain('eliminar');
  });
});
