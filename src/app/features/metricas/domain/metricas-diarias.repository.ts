import { Observable } from 'rxjs';

import { MetricasDiarias } from './metricas-diarias.model';

export abstract class MetricasDiariasRepository {
  abstract consultarHoy(): Observable<MetricasDiarias>;
}
