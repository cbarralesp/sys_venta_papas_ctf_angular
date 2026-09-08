import { Observable } from 'rxjs';

import { EventoAuditoria } from './evento-auditoria.model';

export abstract class AuditoriaRepository {
  abstract listarRecientes(limite: number): Observable<EventoAuditoria[]>;
}
