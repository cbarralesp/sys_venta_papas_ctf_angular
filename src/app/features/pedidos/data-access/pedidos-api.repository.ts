import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_BASE_URL } from '../../../shared/config/api.config';
import { CrearPedidoCommand, EstadoPedido, PedidoGestion } from '../domain/pedido-gestion.model';
import { PedidosRepository } from '../domain/pedidos.repository';
import { PedidoResponseDto } from './pedidos-api.dto';

@Injectable()
export class PedidosApiRepository implements PedidosRepository {
  private readonly http = inject(HttpClient);

  listar(): Observable<PedidoGestion[]> {
    return this.http
      .get<PedidoResponseDto[]>(API_BASE_URL + '/pedidos', { params: { limite: 200 } })
      .pipe(map((pedidos) => pedidos.map(toDomain)));
  }

  buscarPorId(id: number): Observable<PedidoGestion> {
    return this.http.get<PedidoResponseDto>(API_BASE_URL + '/pedidos/' + id).pipe(map(toDomain));
  }

  crear(command: CrearPedidoCommand): Observable<PedidoGestion> {
    return this.http
      .post<PedidoResponseDto>(API_BASE_URL + '/pedidos', command)
      .pipe(map(toDomain));
  }

  actualizarEstado(id: number, estado: EstadoPedido, version: number): Observable<PedidoGestion> {
    return this.http
      .patch<PedidoResponseDto>(API_BASE_URL + '/pedidos/' + id + '/estado', { estado, version })
      .pipe(map(toDomain));
  }

  cancelar(id: number, motivo: string, version: number): Observable<PedidoGestion> {
    return this.http
      .patch<PedidoResponseDto>(API_BASE_URL + '/pedidos/' + id + '/cancelar', { motivo, version })
      .pipe(map(toDomain));
  }
}

function toDomain(dto: PedidoResponseDto): PedidoGestion {
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
