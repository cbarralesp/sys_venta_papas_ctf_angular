export interface AjustesResponseDto {
  informacion: {
    nombre: string;
    subtitulo: string;
    icono: string;
  };
  operativas: {
    moneda: string;
    impuestoPorcentaje: number;
    tiempoEstimadoPreparacionMin: number;
  };
  notificaciones: {
    sonidoNuevoPedido: boolean;
    alertaPedidoDemorado: boolean;
    minutosParaAlertaDemora: number;
  };
  actualizadoEn: string;
  actualizadoPor: string;
  version: number;
}

export type ActualizarAjustesRequestDto = Omit<AjustesResponseDto, 'actualizadoEn' | 'actualizadoPor'>;
