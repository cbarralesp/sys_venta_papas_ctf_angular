import { Observable } from 'rxjs';

import { AjustesNegocio } from './ajustes.model';

export interface ResultadoReinicioDatosOperativos {
  pedidosEliminados: number;
  gastosEliminados: number;
  turnosEliminados: number;
}

export abstract class AjustesRepository {
  abstract consultar(): Observable<AjustesNegocio>;
  abstract actualizar(ajustes: AjustesNegocio): Observable<AjustesNegocio>;
  abstract reiniciarDatosOperativos(confirmacion: string): Observable<ResultadoReinicioDatosOperativos>;
}
