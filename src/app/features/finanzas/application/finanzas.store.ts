import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { CrearGastoCommand, FiltroPeriodo, ResumenFinanciero } from '../domain/finanzas.model';
import { FinanzasRepository } from '../domain/finanzas.repository';
import { apiErrorMessage } from '../../../shared/services/api-error-message';

const RESUMEN_VACIO: ResumenFinanciero = {
  desde: new Date(),
  hasta: new Date(),
  totalIngresos: 0,
  totalCostos: 0,
  totalGastos: 0,
  gananciaBruta: 0,
  gananciaNeta: 0,
  cantidadVentas: 0,
  movimientos: [],
  ventasPorCategoria: [],
  ventasPorFormaPago: [],
};

@Injectable()
export class FinanzasStore {
  private readonly repository = inject(FinanzasRepository);
  private readonly resumen = signal<ResumenFinanciero>(RESUMEN_VACIO);

  readonly periodo = signal<FiltroPeriodo>('Semana');
  readonly periodos: readonly FiltroPeriodo[] = ['Hoy', 'Semana', 'Mes'];
  readonly cargando = signal(false);
  readonly guardando = signal(false);
  readonly error = signal<string | null>(null);

  readonly movimientosFiltrados = computed(() => this.resumen().movimientos);
  readonly totalIngresos = computed(() => this.resumen().totalIngresos);
  readonly totalCostos = computed(() => this.resumen().totalCostos);
  readonly totalGastos = computed(() => this.resumen().totalGastos);
  readonly gananciaBruta = computed(() => this.resumen().gananciaBruta);
  readonly gananciaNeta = computed(() => this.resumen().gananciaNeta);
  readonly cantidadVentas = computed(() => this.resumen().cantidadVentas);
  readonly margenPorcentaje = computed(() => {
    const ingresos = this.totalIngresos();
    return ingresos === 0 ? 0 : Math.round((this.gananciaNeta() / ingresos) * 100);
  });
  readonly resumenPorCategoria = computed(() => this.resumen().ventasPorCategoria);
  readonly resumenPorFormaPago = computed(() => this.resumen().ventasPorFormaPago);

  constructor() {
    void this.cargar();
  }

  async seleccionarPeriodo(periodo: FiltroPeriodo): Promise<void> {
    if (periodo === this.periodo()) return;
    this.periodo.set(periodo);
    await this.cargar();
  }

  async cargar(): Promise<void> {
    if (this.cargando()) return;
    this.cargando.set(true);
    this.error.set(null);
    const { desde, hasta } = this.calcularRango(this.periodo());
    try {
      this.resumen.set(await firstValueFrom(this.repository.consultarResumen(desde, hasta)));
    } catch (error) {
      this.error.set(apiErrorMessage(error, 'No fue posible cargar el resumen financiero. Intenta nuevamente.'));
    } finally {
      this.cargando.set(false);
    }
  }

  async crearGasto(command: CrearGastoCommand): Promise<boolean> {
    if (this.guardando()) return false;
    this.guardando.set(true);
    this.error.set(null);
    try {
      await firstValueFrom(this.repository.crearGasto(command));
      await this.cargar();
      return true;
    } catch (error) {
      this.error.set(apiErrorMessage(
        error,
        'No fue posible registrar el gasto. Revisa los datos e intenta nuevamente.',
      ));
      return false;
    } finally {
      this.guardando.set(false);
    }
  }

  async eliminarGasto(id: number): Promise<boolean> {
    if (this.guardando()) return false;
    this.guardando.set(true);
    this.error.set(null);
    try {
      await firstValueFrom(this.repository.eliminarGasto(id));
      await this.cargar();
      return true;
    } catch (error) {
      this.error.set(apiErrorMessage(error, 'No fue posible eliminar el gasto. Intenta nuevamente.'));
      return false;
    } finally {
      this.guardando.set(false);
    }
  }

  private calcularRango(periodo: FiltroPeriodo): { desde: Date; hasta: Date } {
    const hasta = new Date();
    const desde = new Date(hasta);
    if (periodo === 'Semana') desde.setDate(desde.getDate() - 6);
    if (periodo === 'Mes') desde.setDate(desde.getDate() - 29);
    desde.setHours(0, 0, 0, 0);
    return { desde, hasta };
  }
}
