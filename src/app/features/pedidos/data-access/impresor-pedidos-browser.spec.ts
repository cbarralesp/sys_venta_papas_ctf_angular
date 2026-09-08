import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ImpresorPedidosBrowser } from './impresor-pedidos-browser';
import { PedidoGestion } from '../domain/pedido-gestion.model';

describe('ImpresorPedidosBrowser', () => {
  const pedido: PedidoGestion = {
    id: 1,
    numero: 'P-001',
    items: [{ nombre: 'Papas <grandes>', cantidad: 2, precioUnitario: 2000, costoUnitario: 800 }],
    formaPago: 'Efectivo',
    tipoEntrega: 'Para llevar',
    notas: 'Sin sal & extra',
    subtotal: 4000,
    total: 4000,
    estado: 'Pendiente',
    creadoEn: new Date('2026-09-07T12:00:00-03:00'),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ImpresorPedidosBrowser] });
  });

  afterEach(() => vi.restoreAllMocks());

  it('genera e imprime un comprobante escapando el contenido del pedido', () => {
    const write = vi.fn();
    const ventana = {
      document: { write, close: vi.fn() },
      focus: vi.fn(),
      print: vi.fn(),
    } as unknown as Window;
    vi.spyOn(window, 'open').mockReturnValue(ventana);
    const impresor = TestBed.inject(ImpresorPedidosBrowser);

    expect(
      impresor.imprimir(pedido, {
        nombreNegocio: 'Capilla & Torre',
        subtituloNegocio: 'Papas',
        moneda: 'CLP',
      }),
    ).toBe(true);

    const comprobante = write.mock.calls[0][0] as string;
    expect(comprobante).toContain('Capilla &amp; Torre');
    expect(comprobante).toContain('Papas &lt;grandes&gt;');
    expect(comprobante).toContain('Sin sal &amp; extra');
    expect(comprobante).toContain('$4.000');
    expect(ventana.print).toHaveBeenCalledOnce();
  });

  it('informa cuando el navegador bloquea la ventana de impresion', () => {
    vi.spyOn(window, 'open').mockReturnValue(null);
    const impresor = TestBed.inject(ImpresorPedidosBrowser);

    expect(
      impresor.imprimir(pedido, {
        nombreNegocio: 'Capilla',
        subtituloNegocio: 'Papas',
        moneda: 'CLP',
      }),
    ).toBe(false);
  });
});
