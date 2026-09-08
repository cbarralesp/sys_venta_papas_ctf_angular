import { Observable } from 'rxjs';

import { CrearGastoCommand, ResumenFinanciero } from './finanzas.model';

export abstract class FinanzasRepository {
  abstract consultarResumen(desde: Date, hasta: Date): Observable<ResumenFinanciero>;
  abstract crearGasto(command: CrearGastoCommand): Observable<void>;
  abstract eliminarGasto(id: number): Observable<void>;
}
