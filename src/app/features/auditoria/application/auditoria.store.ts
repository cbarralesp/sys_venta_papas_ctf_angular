import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { AuditoriaRepository } from '../domain/auditoria.repository';
import { EventoAuditoria } from '../domain/evento-auditoria.model';
import { apiErrorMessage } from '../../../shared/services/api-error-message';

@Injectable()
export class AuditoriaStore {
  private readonly repository = inject(AuditoriaRepository);

  readonly eventos = signal<EventoAuditoria[]>([]);
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);

  constructor() {
    void this.cargar();
  }

  async cargar(): Promise<void> {
    if (this.cargando()) return;
    this.cargando.set(true);
    this.error.set(null);
    try {
      this.eventos.set(await firstValueFrom(this.repository.listarRecientes(50)));
    } catch (error) {
      this.error.set(apiErrorMessage(error, 'No fue posible cargar la actividad reciente.'));
    } finally {
      this.cargando.set(false);
    }
  }
}
