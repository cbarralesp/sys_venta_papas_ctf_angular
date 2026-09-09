import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { FinanzasStore } from '../../application/finanzas.store';
import { FiltroPeriodo, MovimientoFinanciero } from '../../domain/finanzas.model';

@Component({
  selector: 'app-finanzas',
  imports: [ReactiveFormsModule],
  providers: [FinanzasStore],
  templateUrl: './finanzas-page.html',
  styleUrl: './finanzas-page.scss',
})
export class Finanzas {
  readonly finanzasStore = inject(FinanzasStore);
  private readonly formBuilder = inject(FormBuilder);

  readonly gastoModalOpen = signal(false);
  readonly categoriasGasto = ['Insumos', 'Servicios', 'Arriendo', 'Transporte', 'Otros'] as const;
  readonly gastoForm = this.formBuilder.nonNullable.group({
    descripcion: ['', [Validators.required, Validators.maxLength(120)]],
    categoria: ['Insumos', Validators.required],
    formaPago: ['Efectivo' as const, Validators.required],
    monto: [0, [Validators.required, Validators.min(1)]],
    fecha: [this.fechaLocalActual(), Validators.required],
  });

  readonly periodos = this.finanzasStore.periodos;
  readonly periodo = this.finanzasStore.periodo;
  readonly movimientosFiltrados = this.finanzasStore.movimientosFiltrados;
  readonly totalIngresos = this.finanzasStore.totalIngresos;
  readonly totalGastos = this.finanzasStore.totalGastos;
  readonly gananciaBruta = this.finanzasStore.gananciaBruta;
  readonly gananciaNeta = this.finanzasStore.gananciaNeta;
  readonly cantidadVentas = this.finanzasStore.cantidadVentas;
  readonly margenPorcentaje = this.finanzasStore.margenPorcentaje;
  readonly resumenPorCategoria = this.finanzasStore.resumenPorCategoria;
  readonly resumenPorFormaPago = this.finanzasStore.resumenPorFormaPago;

  async seleccionarPeriodo(periodo: FiltroPeriodo): Promise<void> {
    await this.finanzasStore.seleccionarPeriodo(periodo);
  }

  abrirGasto(): void {
    this.gastoForm.reset({
      descripcion: '', categoria: 'Insumos', formaPago: 'Efectivo', monto: 0,
      fecha: this.fechaLocalActual(),
    });
    this.gastoModalOpen.set(true);
  }

  cerrarGasto(): void {
    if (!this.finanzasStore.guardando()) this.gastoModalOpen.set(false);
  }

  async guardarGasto(): Promise<void> {
    if (this.gastoForm.invalid) {
      this.gastoForm.markAllAsTouched();
      return;
    }
    const value = this.gastoForm.getRawValue();
    const guardado = await this.finanzasStore.crearGasto({
      ...value,
      formaPago: value.formaPago as 'Efectivo' | 'Transferencia',
      fecha: new Date(`${value.fecha}T12:00:00`),
    });
    if (guardado) this.gastoModalOpen.set(false);
  }

  async eliminarGasto(movimiento: MovimientoFinanciero): Promise<void> {
    if (movimiento.tipo !== 'Gasto') return;
    const id = Number(movimiento.id.replace('GASTO-', ''));
    if (!Number.isInteger(id) || !window.confirm(`¿Eliminar el gasto “${movimiento.descripcion}”?`)) return;
    await this.finanzasStore.eliminarGasto(id);
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

  private fechaLocalActual(): string {
    const ahora = new Date();
    const offset = ahora.getTimezoneOffset() * 60_000;
    return new Date(ahora.getTime() - offset).toISOString().slice(0, 10);
  }
}
