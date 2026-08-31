import { Component, inject } from '@angular/core';

import { FinanzasStore } from '../../application/finanzas.store';
import { FinanzasMemoryRepository } from '../../data-access/finanzas-memory.repository';
import { FiltroPeriodo, MovimientoFinanciero } from '../../domain/finanzas.model';
import { FinanzasRepository } from '../../domain/finanzas.repository';

@Component({
  selector: 'app-finanzas',
  imports: [],
  providers: [FinanzasStore, { provide: FinanzasRepository, useClass: FinanzasMemoryRepository }],
  templateUrl: './finanzas-page.html',
  styleUrl: './finanzas-page.scss',
})
export class Finanzas {
  readonly finanzasStore = inject(FinanzasStore);

  readonly periodos = this.finanzasStore.periodos;
  readonly periodo = this.finanzasStore.periodo;
  readonly movimientosFiltrados = this.finanzasStore.movimientosFiltrados;
  readonly totalIngresos = this.finanzasStore.totalIngresos;
  readonly totalGastos = this.finanzasStore.totalGastos;
  readonly gananciaBruta = this.finanzasStore.gananciaBruta;
  readonly gananciaNeta = this.finanzasStore.gananciaNeta;
  readonly cantidadVentas = this.finanzasStore.cantidadVentas;
  readonly ticketPromedio = this.finanzasStore.ticketPromedio;
  readonly margenPorcentaje = this.finanzasStore.margenPorcentaje;
  readonly resumenPorCategoria = this.finanzasStore.resumenPorCategoria;
  readonly resumenPorFormaPago = this.finanzasStore.resumenPorFormaPago;

  seleccionarPeriodo(periodo: FiltroPeriodo): void {
    this.finanzasStore.seleccionarPeriodo(periodo);
  }

  porcentajeCategoria(ingresos: number): number {
    const total = this.totalIngresos();
    return total === 0 ? 0 : Math.round((ingresos / total) * 100);
  }

  iconoMovimiento(movimiento: MovimientoFinanciero): string {
    return movimiento.tipo === 'Venta' ? '⬆️' : '⬇️';
  }

  iconoFormaPago(formaPago: string): string {
    return formaPago === 'Efectivo' ? '💵' : '🔁';
  }

  formatPrice(value: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(value);
  }

  formatearFecha(fecha: Date): string {
    return fecha.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' }) + ' · ' +
      fecha.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  }
}
