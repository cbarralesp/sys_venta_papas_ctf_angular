import { Component, inject } from '@angular/core';

import { ReportesStore } from '../../application/reportes.store';
import { ReportesMemoryRepository } from '../../data-access/reportes-memory.repository';
import { FiltroRangoReporte } from '../../domain/reportes.model';
import { ReportesRepository } from '../../domain/reportes.repository';

@Component({
  selector: 'app-reportes',
  imports: [],
  providers: [ReportesStore, { provide: ReportesRepository, useClass: ReportesMemoryRepository }],
  templateUrl: './reportes-page.html',
  styleUrl: './reportes-page.scss',
})
export class Reportes {
  readonly reportesStore = inject(ReportesStore);

  readonly rangos = this.reportesStore.rangos;
  readonly rango = this.reportesStore.rango;
  readonly ventasEnRango = this.reportesStore.ventasEnRango;
  readonly totalVentas = this.reportesStore.totalVentas;
  readonly totalPedidos = this.reportesStore.totalPedidos;
  readonly promedioDiario = this.reportesStore.promedioDiario;
  readonly ticketPromedio = this.reportesStore.ticketPromedio;
  readonly mejorDia = this.reportesStore.mejorDia;
  readonly productosOrdenados = this.reportesStore.productosOrdenados;

  seleccionarRango(rango: FiltroRangoReporte): void {
    this.reportesStore.seleccionarRango(rango);
  }

  porcentajeDelMaximo(monto: number): number {
    return this.reportesStore.porcentajeDelMaximo(monto);
  }

  porcentajeDelTotalProductos(total: number): number {
    return this.reportesStore.porcentajeDelTotalProductos(total);
  }

  formatPrice(value: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(value);
  }

  formatearFecha(fecha: Date): string {
    return fecha.toLocaleDateString('es-CL', { weekday: 'short', day: '2-digit', month: 'short' });
  }
}
