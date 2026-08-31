import { Injectable } from '@angular/core';

import { AjustesNegocio } from '../domain/ajustes.model';
import { AjustesRepository } from '../domain/ajustes.repository';

@Injectable()
export class AjustesMemoryRepository implements AjustesRepository {
  obtenerAjustesIniciales(): AjustesNegocio {
    return {
      informacion: {
        nombre: 'Panel del negocio',
        subtitulo: 'Sistema de ventas',
        icono: '🍟',
      },
      operativas: {
        moneda: 'CLP',
        impuestoPorcentaje: 0,
        tiempoEstimadoPreparacionMin: 8,
      },
      notificaciones: {
        sonidoNuevoPedido: true,
        alertaPedidoDemorado: true,
        minutosParaAlertaDemora: 10,
      },
    };
  }
}
