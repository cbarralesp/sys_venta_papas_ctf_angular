import { AjustesNegocio } from './ajustes.model';

export abstract class AjustesRepository {
  abstract obtenerAjustesIniciales(): AjustesNegocio;
}
