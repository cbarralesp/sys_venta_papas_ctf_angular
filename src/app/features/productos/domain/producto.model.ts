export const CATEGORIAS_PRODUCTO = ['Papas fritas', 'Handroll', 'Bebidas', 'Otros'] as const;
export type CategoriaProducto = string;

/**
 * Modelo de dominio de Producto en el frontend.
 *
 * `categoriaId` se agrega para alinear el contrato con el backend
 * (donde la categoría es una entidad real con id propio, ver
 * `Categoria.java` y `Producto.java` en el backend hexagonal).
 * Se mantiene `categoria` (nombre) porque toda la UI actual
 * (tablas, formularios, filtros) ya trabaja con el nombre de la
 * categoría y no requiere el id para renderizar. `categoriaId` queda
 * disponible como `null` solo ante respuestas antiguas/incompletas,
 * aunque el flujo normal ya lo completa desde el adapter HTTP.
 */
export interface Producto {
  id: number;
  nombre: string;
  categoria: CategoriaProducto;
  categoriaId: number | null;
  precioVenta: number;
  costo: number | null;
  disponible: boolean;
  icono: string;
}

export interface ProductoCommand {
  costo?: number | null;
  nombre: string;
  categoria: CategoriaProducto;
  precioVenta: number;
  disponible: boolean;
}
