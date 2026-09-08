import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { AjustesNegocio } from '../../features/ajustes/domain/ajustes.model';
import {
  AjustesRepository,
  ResultadoReinicioDatosOperativos,
} from '../../features/ajustes/domain/ajustes.repository';
import { apiErrorMessage } from './api-error-message';

const AJUSTES_PREDETERMINADOS: AjustesNegocio = {
  informacion: { nombre: 'Panel del negocio', subtitulo: 'Sistema de ventas', icono: '🍟' },
  operativas: { moneda: 'CLP', impuestoPorcentaje: 0, tiempoEstimadoPreparacionMin: 10 },
  notificaciones: { sonidoNuevoPedido: true, alertaPedidoDemorado: true, minutosParaAlertaDemora: 10 },
  actualizadoEn: new Date(0),
  actualizadoPor: 'sistema',
  version: 0,
};

@Injectable({ providedIn: 'root' })
export class AjustesService {
  private readonly repository = inject(AjustesRepository);

  readonly ajustes = signal<AjustesNegocio>(AJUSTES_PREDETERMINADOS);
  readonly cargando = signal(false);
  readonly guardando = signal(false);
  readonly error = signal<string | null>(null);

  async cargar(): Promise<boolean> {
    if (this.cargando()) return false;
    this.cargando.set(true);
    this.error.set(null);
    try {
      this.ajustes.set(await firstValueFrom(this.repository.consultar()));
      return true;
    } catch (error) {
      this.error.set(apiErrorMessage(error, 'No fue posible cargar los ajustes del negocio.'));
      return false;
    } finally {
      this.cargando.set(false);
    }
  }

  async guardar(borrador: AjustesNegocio): Promise<boolean> {
    if (this.guardando()) return false;
    this.guardando.set(true);
    this.error.set(null);
    try {
      this.ajustes.set(await firstValueFrom(this.repository.actualizar(borrador)));
      return true;
    } catch (error) {
      this.error.set(apiErrorMessage(
        error,
        'No fue posible guardar los ajustes. Recarga la pantalla e intenta nuevamente.',
      ));
      return false;
    } finally {
      this.guardando.set(false);
    }
  }

  async reiniciarDatosOperativos(confirmacion: string): Promise<ResultadoReinicioDatosOperativos | null> {
    if (this.guardando()) return null;
    this.guardando.set(true);
    this.error.set(null);
    try {
      return await firstValueFrom(this.repository.reiniciarDatosOperativos(confirmacion));
    } catch (error) {
      this.error.set(apiErrorMessage(
        error,
        'No fue posible reiniciar los datos operativos.',
      ));
      return null;
    } finally {
      this.guardando.set(false);
    }
  }
}
