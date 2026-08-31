import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { AjustesStore } from '../../application/ajustes.store';

@Component({
  selector: 'app-ajustes',
  imports: [ReactiveFormsModule],
  providers: [AjustesStore],
  templateUrl: './ajustes-page.html',
  styleUrl: './ajustes-page.scss',
})
export class Ajustes {
  private readonly formBuilder = inject(FormBuilder);
  readonly ajustesStore = inject(AjustesStore);

  readonly guardadoRecientemente = this.ajustesStore.guardadoRecientemente;

  readonly informacionForm = this.formBuilder.nonNullable.group({
    nombre: [this.ajustesStore.ajustes().informacion.nombre],
    subtitulo: [this.ajustesStore.ajustes().informacion.subtitulo],
    icono: [this.ajustesStore.ajustes().informacion.icono],
  });

  readonly operativasForm = this.formBuilder.nonNullable.group({
    moneda: [this.ajustesStore.ajustes().operativas.moneda],
    impuestoPorcentaje: [this.ajustesStore.ajustes().operativas.impuestoPorcentaje],
    tiempoEstimadoPreparacionMin: [this.ajustesStore.ajustes().operativas.tiempoEstimadoPreparacionMin],
  });

  readonly notificacionesForm = this.formBuilder.nonNullable.group({
    sonidoNuevoPedido: [this.ajustesStore.ajustes().notificaciones.sonidoNuevoPedido],
    alertaPedidoDemorado: [this.ajustesStore.ajustes().notificaciones.alertaPedidoDemorado],
    minutosParaAlertaDemora: [this.ajustesStore.ajustes().notificaciones.minutosParaAlertaDemora],
  });

  constructor() {
    this.informacionForm.valueChanges.subscribe((valor) => this.ajustesStore.actualizarInformacion(valor));
    this.operativasForm.valueChanges.subscribe((valor) => this.ajustesStore.actualizarOperativas(valor));
    this.notificacionesForm.valueChanges.subscribe((valor) => this.ajustesStore.actualizarNotificaciones(valor));
  }

  guardarCambios(): void {
    this.ajustesStore.guardarCambios();
  }
}
