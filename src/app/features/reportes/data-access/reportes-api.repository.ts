import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { API_BASE_URL } from '../../../shared/config/api.config';
import { ReporteVentas } from '../domain/reportes.model';
import { ReportesRepository } from '../domain/reportes.repository';
import { ReporteVentasResponseDto } from './reportes-api.dto';

@Injectable()
export class ReportesApiRepository implements ReportesRepository {
  private readonly http = inject(HttpClient);

  consultarVentas(desde: Date, hasta: Date): Observable<ReporteVentas> {
    const params = new HttpParams()
      .set('desde', desde.toISOString())
      .set('hasta', hasta.toISOString());
    return this.http
      .get<ReporteVentasResponseDto>(`${API_BASE_URL}/reportes/ventas`, { params })
      .pipe(map(toDomain));
  }
}

function toDomain(dto: ReporteVentasResponseDto): ReporteVentas {
  return {
    ...dto,
    desde: new Date(dto.desde),
    hasta: new Date(dto.hasta),
    ventasDiarias: dto.ventasDiarias.map((venta) => ({
      ...venta,
      fecha: parseLocalDate(venta.fecha),
    })),
  };
}

function parseLocalDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}
