import { Observable } from 'rxjs';

import { PedidoGestion } from '../../pedidos/domain/pedido-gestion.model';
import { SesionCaja } from './sesion-caja.model';

export interface ReinicioSesionCaja {
  sesionCerrada: SesionCaja;
  sesionAbierta: SesionCaja;
}

export abstract class SesionCajaRepository {
  abstract consultarActual(): Observable<SesionCaja | null>;
  abstract listarHistorial(limite?: number): Observable<SesionCaja[]>;
  abstract consultarCerrada(id: number): Observable<SesionCaja>;
  abstract listarVentas(id: number): Observable<PedidoGestion[]>;
  abstract abrir(saldoInicial: number): Observable<SesionCaja>;
  abstract cerrar(id: number, efectivoDeclarado: number): Observable<SesionCaja>;
  abstract eliminar(id: number): Observable<void>;
  abstract reiniciar(
    id: number,
    efectivoDeclarado: number,
    saldoInicialNuevo: number,
    contrasenaActual: string,
  ): Observable<ReinicioSesionCaja>;
}
