import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { FiltroRangoReporte, ReporteVentas } from '../domain/reportes.model';
import { ReportesRepository } from '../domain/reportes.repository';
import { apiErrorMessage } from '../../../shared/services/api-error-message';

const REPORTE_VACIO: ReporteVentas = {
  desde: new Date(),
  hasta: new Date(),
  totalVentas: 0,
  totalPedidos: 0,
  promedioDiario: 0,
  ventasDiarias: [],
  productosVendidos: [],
};

@Injectable()
export class ReportesStore {
  private readonly repository = inject(ReportesRepository);
  private readonly reporte = signal<ReporteVentas>(REPORTE_VACIO);

  readonly rango = signal<FiltroRangoReporte>('Semana');
  readonly rangos: readonly FiltroRangoReporte[] = ['Semana', 'Mes'];
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);

  readonly ventasEnRango = computed(() => this.reporte().ventasDiarias);
  readonly totalVentas = computed(() => this.reporte().totalVentas);
  readonly totalPedidos = computed(() => this.reporte().totalPedidos);
  readonly promedioDiario = computed(() => this.reporte().promedioDiario);
  readonly mejorDia = computed(() => {
    const ventas = this.ventasEnRango();
    if (ventas.length === 0 || ventas.every((venta) => venta.totalVentas === 0)) return null;
    return ventas.reduce((mejor, actual) => (actual.totalVentas > mejor.totalVentas ? actual : mejor));
  });
  readonly montoMaximoDiario = computed(() =>
    this.ventasEnRango().reduce((maximo, venta) => Math.max(maximo, venta.totalVentas), 0),
  );
  readonly productosOrdenados = computed(() => this.reporte().productosVendidos);
  readonly totalGeneradoProductos = computed(() =>
    this.productosOrdenados().reduce((total, producto) => total + producto.totalGenerado, 0),
  );

  constructor() {
    void this.cargar();
  }

  async seleccionarRango(rango: FiltroRangoReporte): Promise<void> {
    if (rango === this.rango()) return;
    this.rango.set(rango);
    await this.cargar();
  }

  async cargar(): Promise<void> {
    if (this.cargando()) return;
    this.cargando.set(true);
    this.error.set(null);
    const { desde, hasta } = this.calcularRango(this.rango());
    try {
      this.reporte.set(await firstValueFrom(this.repository.consultarVentas(desde, hasta)));
    } catch (error) {
      this.error.set(apiErrorMessage(error, 'No fue posible cargar el reporte de ventas. Intenta nuevamente.'));
    } finally {
      this.cargando.set(false);
    }
  }

  porcentajeDelMaximo(monto: number): number {
    const maximo = this.montoMaximoDiario();
    return maximo === 0 ? 0 : Math.round((monto / maximo) * 100);
  }

  porcentajeDelTotalProductos(total: number): number {
    const totalGeneral = this.totalGeneradoProductos();
    return totalGeneral === 0 ? 0 : Math.round((total / totalGeneral) * 100);
  }

  private calcularRango(rango: FiltroRangoReporte): { desde: Date; hasta: Date } {
    const hasta = new Date();
    const desde = new Date(hasta);
    desde.setDate(desde.getDate() - (rango === 'Semana' ? 6 : 29));
    desde.setHours(0, 0, 0, 0);
    return { desde, hasta };
  }
}
