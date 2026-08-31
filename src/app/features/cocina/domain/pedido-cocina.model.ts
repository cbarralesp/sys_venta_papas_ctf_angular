export type EstadoCocina = 'Pendiente' | 'En preparación' | 'Listo';

export interface ItemPedidoCocina {
  nombre: string;
  cantidad: number;
  icono: string;
}

export interface PedidoCocina {
  id: number;
  numero: string;
  items: ItemPedidoCocina[];
  solicitadoPor: string;
  estado: EstadoCocina;
  horaSolicitud: Date;
  horaInicioPreparacion: Date | null;
  horaListo: Date | null;
}
