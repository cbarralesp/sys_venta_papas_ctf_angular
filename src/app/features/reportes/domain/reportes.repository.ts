import { Observable } from 'rxjs';

import { ReporteVentas } from './reportes.model';

export abstract class ReportesRepository {
  abstract consultarVentas(desde: Date, hasta: Date): Observable<ReporteVentas>;
}
