export type AccionAuditoria =
  | 'USUARIO_CREADO'
  | 'USUARIO_ACTUALIZADO'
  | 'CONTRASENA_RESTABLECIDA'
  | 'CONTRASENA_CAMBIADA'
  | 'AJUSTES_ACTUALIZADOS'
  | 'DATOS_OPERATIVOS_REINICIADOS'
  | 'GASTO_CREADO'
  | 'GASTO_ELIMINADO'
  | 'CAJA_ABIERTA'
  | 'CAJA_CERRADA'
  | 'CAJA_ELIMINADA'
  | 'PEDIDO_CANCELADO'
  | 'PRODUCTO_CREADO'
  | 'PRODUCTO_ACTUALIZADO'
  | 'PRODUCTO_ELIMINADO'
  | 'CATEGORIA_CREADA'
  | 'CATEGORIA_ACTUALIZADA'
  | 'CATEGORIA_ELIMINADA';

export interface EventoAuditoria {
  id: number;
  actor: string;
  accion: AccionAuditoria;
  recurso: string;
  recursoId: string | null;
  detalle: string;
  fecha: string;
}
