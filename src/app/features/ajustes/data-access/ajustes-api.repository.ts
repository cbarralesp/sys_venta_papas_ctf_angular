import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { API_BASE_URL } from '../../../shared/config/api.config';
import { AjustesNegocio } from '../domain/ajustes.model';
import { AjustesRepository, ResultadoReinicioDatosOperativos } from '../domain/ajustes.repository';
import { ActualizarAjustesRequestDto, AjustesResponseDto } from './ajustes-api.dto';

@Injectable()
export class AjustesApiRepository implements AjustesRepository {
  private readonly http = inject(HttpClient);

  consultar(): Observable<AjustesNegocio> {
    return this.http.get<AjustesResponseDto>(`${API_BASE_URL}/ajustes`).pipe(map(toDomain));
  }

  actualizar(ajustes: AjustesNegocio): Observable<AjustesNegocio> {
    const request: ActualizarAjustesRequestDto = {
      informacion: ajustes.informacion,
      operativas: ajustes.operativas,
      notificaciones: ajustes.notificaciones,
      version: ajustes.version,
    };
    return this.http.put<AjustesResponseDto>(`${API_BASE_URL}/ajustes`, request).pipe(map(toDomain));
  }

  reiniciarDatosOperativos(confirmacion: string): Observable<ResultadoReinicioDatosOperativos> {
    return this.http.post<ResultadoReinicioDatosOperativos>(
      `${API_BASE_URL}/ajustes/reiniciar-operacion`,
      { confirmacion },
    );
  }
}

function toDomain(dto: AjustesResponseDto): AjustesNegocio {
  return { ...dto, actualizadoEn: new Date(dto.actualizadoEn) };
}
