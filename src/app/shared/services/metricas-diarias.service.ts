import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { MetricasDiarias } from '../../features/metricas/domain/metricas-diarias.model';
import { MetricasDiariasRepository } from '../../features/metricas/domain/metricas-diarias.repository';
import { apiErrorMessage } from './api-error-message';

const METRICAS_VACIAS: MetricasDiarias = {
  fecha: new Date(),
  pedidosCreados: 0,
  pendientes: 0,
  enPreparacion: 0,
  listos: 0,
  entregados: 0,
  cancelados: 0,
  totalVentas: 0,
  ticketPromedio: 0,
  tiempoPromedioPreparacionMin: 0,
};

@Injectable({ providedIn: 'root' })
export class MetricasDiariasService {
  private readonly repository = inject(MetricasDiariasRepository);

  readonly metricas = signal<MetricasDiarias>(METRICAS_VACIAS);
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);

  async cargar(): Promise<boolean> {
    if (this.cargando()) return false;
    this.cargando.set(true);
    this.error.set(null);
    try {
      this.metricas.set(await firstValueFrom(this.repository.consultarHoy()));
      return true;
    } catch (error) {
      this.error.set(apiErrorMessage(error, 'No fue posible cargar las metricas del dia.'));
      return false;
    } finally {
      this.cargando.set(false);
    }
  }
}
