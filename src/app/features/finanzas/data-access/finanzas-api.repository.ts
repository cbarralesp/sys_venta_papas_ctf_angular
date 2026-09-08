import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, mapTo } from 'rxjs';

import { API_BASE_URL } from '../../../shared/config/api.config';
import { CrearGastoCommand, ResumenFinanciero } from '../domain/finanzas.model';
import { FinanzasRepository } from '../domain/finanzas.repository';
import { CrearGastoRequestDto, ResumenFinancieroResponseDto } from './finanzas-api.dto';

@Injectable()
export class FinanzasApiRepository implements FinanzasRepository {
  private readonly http = inject(HttpClient);

  consultarResumen(desde: Date, hasta: Date): Observable<ResumenFinanciero> {
    const params = new HttpParams()
      .set('desde', desde.toISOString())
      .set('hasta', hasta.toISOString());
    return this.http
      .get<ResumenFinancieroResponseDto>(`${API_BASE_URL}/finanzas/resumen`, { params })
      .pipe(map(toDomain));
  }

  crearGasto(command: CrearGastoCommand): Observable<void> {
    const request: CrearGastoRequestDto = { ...command, fecha: command.fecha.toISOString() };
    return this.http.post(`${API_BASE_URL}/finanzas/gastos`, request).pipe(mapTo(undefined));
  }

  eliminarGasto(id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/finanzas/gastos/${id}`);
  }
}

function toDomain(dto: ResumenFinancieroResponseDto): ResumenFinanciero {
  return {
    ...dto,
    desde: new Date(dto.desde),
    hasta: new Date(dto.hasta),
    movimientos: dto.movimientos.map((movimiento) => ({
      ...movimiento,
      fecha: new Date(movimiento.fecha),
    })),
  };
}
