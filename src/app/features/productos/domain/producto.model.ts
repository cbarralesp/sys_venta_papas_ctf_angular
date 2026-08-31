export const CATEGORIAS_PRODUCTO = ['Papas fritas', 'Handroll', 'Bebidas', 'Otros'] as const;
export type CategoriaProducto = string;

export interface Producto {
  id: number;
  nombre: string;
  categoria: CategoriaProducto;
  precioVenta: number;
  costo: number | null;
  disponible: boolean;
  icono: string;
}

export interface ProductoCommand {
  nombre: string;
  categoria: CategoriaProducto;
  precioVenta: number;
  disponible: boolean;
}
