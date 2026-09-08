import { Injectable, inject, signal } from '@angular/core';

import { AjustesService } from '../../../shared/services/ajustes.service';
import { AjustesNegocio } from '../domain/ajustes.model';
import { ResultadoReinicioDatosOperativos } from '../domain/ajustes.repository';

@Injectable()
export class AjustesStore {
  private readonly ajustesService = inject(AjustesService);
  private temporizadorGuardado: ReturnType<typeof setTimeout> | null = null;

  readonly ajustes = this.ajustesService.ajustes;
  readonly cargando = this.ajustesService.cargando;
  readonly guardando = this.ajustesService.guardando;
  readonly error = this.ajustesService.error;
  readonly guardadoRecientemente = signal(false);
  readonly reinicioDatosReciente = signal<ResultadoReinicioDatosOperativos | null>(null);

  constructor() {
    void this.cargar();
  }

  cargar(): Promise<boolean> {
    return this.ajustesService.cargar();
  }

  async guardarCambios(borrador: AjustesNegocio): Promise<boolean> {
    const guardado = await this.ajustesService.guardar(borrador);
    if (!guardado) return false;
    this.guardadoRecientemente.set(true);
    if (this.temporizadorGuardado) clearTimeout(this.temporizadorGuardado);
    this.temporizadorGuardado = setTimeout(() => this.guardadoRecientemente.set(false), 2600);
    return true;
  }

  async reiniciarDatosOperativos(confirmacion: string): Promise<boolean> {
    const resultado = await this.ajustesService.reiniciarDatosOperativos(confirmacion);
    if (resultado === null) return false;
    this.reinicioDatosReciente.set(resultado);
    return true;
  }
}
