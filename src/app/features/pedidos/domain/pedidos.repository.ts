import { Observable } from 'rxjs';
import { CrearPedidoCommand, EstadoPedido, PedidoGestion } from './pedido-gestion.model';

export abstract class PedidosRepository {
  abstract listar(): Observable<PedidoGestion[]>;
  abstract buscarPorId(id: number): Observable<PedidoGestion>;
  abstract crear(command: CrearPedidoCommand): Observable<PedidoGestion>;
  abstract actualizarEstado(
    id: number,
    estado: EstadoPedido,
    version: number,
  ): Observable<PedidoGestion>;
  abstract cancelar(id: number, motivo: string, version: number): Observable<PedidoGestion>;
}
