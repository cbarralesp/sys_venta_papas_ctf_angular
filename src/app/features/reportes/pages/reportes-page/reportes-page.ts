import { Component, inject } from '@angular/core';

import { ReportesStore } from '../../application/reportes.store';
import { FiltroRangoReporte } from '../../domain/reportes.model';

@Component({
  selector: 'app-reportes',
  imports: [],
  providers: [ReportesStore],
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
  readonly mejorDia = this.reportesStore.mejorDia;
  readonly productosOrdenados = this.reportesStore.productosOrdenados;
  readonly cargando = this.reportesStore.cargando;
  readonly error = this.reportesStore.error;

  seleccionarRango(rango: FiltroRangoReporte): void {
    void this.reportesStore.seleccionarRango(rango);
  }

  recargar(): void {
    void this.reportesStore.cargar();
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
