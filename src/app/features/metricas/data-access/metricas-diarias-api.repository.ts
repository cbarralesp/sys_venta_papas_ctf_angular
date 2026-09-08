import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { API_BASE_URL } from '../../../shared/config/api.config';
import { MetricasDiarias } from '../domain/metricas-diarias.model';
import { MetricasDiariasRepository } from '../domain/metricas-diarias.repository';

type MetricasDiariasDto = Omit<MetricasDiarias, 'fecha'> & { fecha: string };

@Injectable()
export class MetricasDiariasApiRepository implements MetricasDiariasRepository {
  private readonly http = inject(HttpClient);

  consultarHoy(): Observable<MetricasDiarias> {
    return this.http.get<MetricasDiariasDto>(`${API_BASE_URL}/metricas/hoy`).pipe(
      map((dto) => ({ ...dto, fecha: parseLocalDate(dto.fecha) })),
    );
  }
}

function parseLocalDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}
