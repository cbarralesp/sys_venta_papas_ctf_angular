import { Injectable, computed, inject, signal } from '@angular/core';

import { PedidosService } from '../../../shared/services/pedidos.service';
import {
  FiltroPeriodo,
  FormaPagoFinanzas,
  MovimientoFinanciero,
  ResumenPorCategoria,
  ResumenPorFormaPago,
} from '../domain/finanzas.model';
import { FinanzasRepository } from '../domain/finanzas.repository';

const HORAS_POR_PERIODO: Record<FiltroPeriodo, number> = {
  Hoy: 24,
  Semana: 24 * 7,
  Mes: 24 * 30,
};

@Injectable()
export class FinanzasStore {
  private readonly repository = inject(FinanzasRepository);
  private readonly pedidosService = inject(PedidosService);

  readonly periodo = signal<FiltroPeriodo>('Semana');
  readonly periodos: readonly FiltroPeriodo[] = ['Hoy', 'Semana', 'Mes'];

  /**
   * Gastos históricos del seed (tipo Gasto) — representan insumos, arriendo, etc.
   * Se mantienen independientes del flujo de pedidos.
   */
  private readonly gastosSeed = computed(() =>
    this.repository.obtenerMovimientosIniciales().filter((m) => m.tipo === 'Gasto'),
  );

  /**
   * Ventas derivadas en tiempo real desde PedidosService.
   * Solo pedidos en estado "Entregado" se contabilizan como ingreso.
   */
  private readonly ventasDesdeServicio = computed<MovimientoFinanciero[]>(() => {
    return this.pedidosService
      .pedidos()
      .filter((p) => p.estado === 'Entregado')
      .map((p, index) => ({
        id: 1000 + index,
        fecha: p.creadoEn,
        descripcion: `Pedido #${p.numero}`,
        categoria: this.categoriaDesdeItems(p.items.map((i) => i.nombre)),
        tipo: 'Venta' as const,
        formaPago: p.formaPago as FormaPagoFinanzas,
        monto: p.total,
        costo: p.items.reduce((acc, i) => acc + i.costoUnitario * i.cantidad, 0),
      }));
  });

  /** Todos los movimientos financieros: ventas en vivo + gastos del seed */
  readonly movimientos = computed<MovimientoFinanciero[]>(() => [
    ...this.ventasDesdeServicio(),
    ...this.gastosSeed(),
  ]);

  readonly movimientosFiltrados = computed(() => {
    const horasLimite = HORAS_POR_PERIODO[this.periodo()];
    const ahora = Date.now();

    return this.movimientos()
      .filter((movimiento) => ahora - movimiento.fecha.getTime() <= horasLimite * 60 * 60_000)
      .sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
  });

  readonly ventas = computed(() => this.movimientosFiltrados().filter((m) => m.tipo === 'Venta'));
  readonly gastos = computed(() => this.movimientosFiltrados().filter((m) => m.tipo === 'Gasto'));

  readonly totalIngresos = computed(() => this.ventas().reduce((total, v) => total + v.monto, 0));
  readonly totalCostos = computed(() => this.ventas().reduce((total, v) => total + v.costo, 0));
  readonly totalGastos = computed(() => this.gastos().reduce((total, g) => total + g.monto, 0));
  readonly gananciaBruta = computed(() => this.totalIngresos() - this.totalCostos());
  readonly gananciaNeta = computed(() => this.gananciaBruta() - this.totalGastos());
  readonly cantidadVentas = computed(() => this.ventas().length);

  readonly ticketPromedio = computed(() => {
    const cantidad = this.cantidadVentas();
    return cantidad === 0 ? 0 : Math.round(this.totalIngresos() / cantidad);
  });

  readonly margenPorcentaje = computed(() => {
    const ingresos = this.totalIngresos();
    return ingresos === 0 ? 0 : Math.round((this.gananciaNeta() / ingresos) * 100);
  });

  readonly resumenPorCategoria = computed<ResumenPorCategoria[]>(() => {
    const mapa = new Map<string, ResumenPorCategoria>();

    for (const venta of this.ventas()) {
      const actual = mapa.get(venta.categoria) ?? { categoria: venta.categoria, ingresos: 0, costos: 0, ganancia: 0 };
      actual.ingresos += venta.monto;
      actual.costos += venta.costo;
      actual.ganancia = actual.ingresos - actual.costos;
      mapa.set(venta.categoria, actual);
    }

    return [...mapa.values()].sort((a, b) => b.ingresos - a.ingresos);
  });

  readonly resumenPorFormaPago = computed<ResumenPorFormaPago[]>(() => {
    const mapa = new Map<string, ResumenPorFormaPago>();

    for (const venta of this.ventas()) {
      const actual = mapa.get(venta.formaPago) ?? { formaPago: venta.formaPago, total: 0, cantidad: 0 };
      actual.total += venta.monto;
      actual.cantidad += 1;
      mapa.set(venta.formaPago, actual);
    }

    return [...mapa.values()].sort((a, b) => b.total - a.total);
  });

  seleccionarPeriodo(periodo: FiltroPeriodo): void {
    this.periodo.set(periodo);
  }

  /** Infiere la categoría de una venta a partir de los nombres de sus ítems */
  private categoriaDesdeItems(nombres: string[]): string {
    const texto = nombres.join(' ').toLowerCase();
    if (texto.includes('papa')) return 'Papas fritas';
    if (texto.includes('handroll')) return 'Handroll';
    if (texto.includes('bebida')) return 'Bebidas';
    return 'Otros';
  }
}
