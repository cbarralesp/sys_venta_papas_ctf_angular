export interface InformacionNegocio {
  nombre: string;
  subtitulo: string;
  icono: string;
}

export interface PreferenciasOperativas {
  moneda: string;
  impuestoPorcentaje: number;
  tiempoEstimadoPreparacionMin: number;
}

export interface PreferenciasNotificaciones {
  sonidoNuevoPedido: boolean;
  alertaPedidoDemorado: boolean;
  minutosParaAlertaDemora: number;
}

export interface AjustesNegocio {
  informacion: InformacionNegocio;
  operativas: PreferenciasOperativas;
  notificaciones: PreferenciasNotificaciones;
  actualizadoEn: Date;
  actualizadoPor: string;
  version: number;
}
