import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../../../shared/config/api.config';
import { AuditoriaRepository } from '../domain/auditoria.repository';
import { EventoAuditoria } from '../domain/evento-auditoria.model';

@Injectable()
export class AuditoriaApiRepository implements AuditoriaRepository {
  private readonly http = inject(HttpClient);

  listarRecientes(limite: number): Observable<EventoAuditoria[]> {
    const params = new HttpParams().set('limite', limite);
    return this.http.get<EventoAuditoria[]>(`${API_BASE_URL}/auditoria`, { params });
  }
}
