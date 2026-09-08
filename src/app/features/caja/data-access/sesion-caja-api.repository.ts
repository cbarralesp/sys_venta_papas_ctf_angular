import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { API_BASE_URL } from '../../../shared/config/api.config';
import { PedidoGestion } from '../../pedidos/domain/pedido-gestion.model';
import { PedidoResponseDto } from '../../pedidos/data-access/pedidos-api.dto';
import { SesionCaja } from '../domain/sesion-caja.model';
import { ReinicioSesionCaja, SesionCajaRepository } from '../domain/sesion-caja.repository';
import { SesionCajaResponseDto } from './sesion-caja-api.dto';

@Injectable()
export class SesionCajaApiRepository implements SesionCajaRepository {
  private readonly http = inject(HttpClient);

  consultarActual(): Observable<SesionCaja | null> {
    return this.http
      .get<SesionCajaResponseDto | null>(`${API_BASE_URL}/caja/sesion/actual`)
      .pipe(map((response) => (response === null ? null : toDomain(response))));
  }

  listarHistorial(limite = 20): Observable<SesionCaja[]> {
    return this.http
      .get<SesionCajaResponseDto[]>(`${API_BASE_URL}/caja/sesion/historial`, {
        params: { limite },
      })
      .pipe(map((response) => response.map(toDomain)));
  }

  consultarCerrada(id: number): Observable<SesionCaja> {
    return this.http
      .get<SesionCajaResponseDto>(`${API_BASE_URL}/caja/sesion/historial/${id}`)
      .pipe(map(toDomain));
  }

  listarVentas(id: number): Observable<PedidoGestion[]> {
    return this.http
      .get<PedidoResponseDto[]>(`${API_BASE_URL}/caja/sesion/${id}/ventas`)
      .pipe(map((response) => response.map(toPedidoDomain)));
  }

  abrir(saldoInicial: number): Observable<SesionCaja> {
    return this.http
      .post<SesionCajaResponseDto>(`${API_BASE_URL}/caja/sesion/abrir`, { saldoInicial })
      .pipe(map(toDomain));
  }

  cerrar(id: number, efectivoDeclarado: number): Observable<SesionCaja> {
    return this.http
      .post<SesionCajaResponseDto>(`${API_BASE_URL}/caja/sesion/${id}/cerrar`, {
        efectivoDeclarado,
      })
      .pipe(map(toDomain));
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/caja/sesion/${id}`);
  }

  reiniciar(
    id: number,
    efectivoDeclarado: number,
    saldoInicialNuevo: number,
    contrasenaActual: string,
  ): Observable<ReinicioSesionCaja> {
    return this.http
      .post<{ sesionCerrada: SesionCajaResponseDto; sesionAbierta: SesionCajaResponseDto }>(
        `${API_BASE_URL}/caja/sesion/${id}/reiniciar`,
        { efectivoDeclarado, saldoInicialNuevo, contrasenaActual },
      )
      .pipe(map((response) => ({
        sesionCerrada: toDomain(response.sesionCerrada),
        sesionAbierta: toDomain(response.sesionAbierta),
      })));
  }
}

function toDomain(dto: SesionCajaResponseDto): SesionCaja {
  return {
    ...dto,
    abiertaEn: new Date(dto.abiertaEn),
    cerradaEn: dto.cerradaEn ? new Date(dto.cerradaEn) : null,
  };
}

function toPedidoDomain(dto: PedidoResponseDto): PedidoGestion {
  return {
    ...dto,
    creadoEn: new Date(dto.creadoEn),
    iniciadoPreparacionEn: dto.iniciadoPreparacionEn ? new Date(dto.iniciadoPreparacionEn) : null,
    listoEn: dto.listoEn ? new Date(dto.listoEn) : null,
    entregadoEn: dto.entregadoEn ? new Date(dto.entregadoEn) : null,
    canceladoEn: dto.canceladoEn ? new Date(dto.canceladoEn) : null,
    items: dto.items.map((item) => ({
      productoId: item.productoId,
      nombre: item.nombre,
      categoria: item.categoria,
      icono: item.icono,
      cantidad: item.cantidad,
      precioUnitario: item.precioUnitario,
      costoUnitario: item.costoUnitario,
    })),
  };
}
