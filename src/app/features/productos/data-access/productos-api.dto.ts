/**
 * DTOs que reflejan exactamente el contrato JSON expuesto por el backend
 * (ver ProductoResponse.java, CategoriaResponse.java, CrearProductoRequest.java
 * y GuardarCategoriaRequest.java en sys_venta_papas_ctf_backend).
 *
 * Se mantienen separados del modelo de dominio (`producto.model.ts`,
 * `categoria.model.ts`) a propósito: el dominio del frontend no debe
 * depender de la forma exacta en que el backend serializa sus datos.
 * El adapter (`productos-api.repository.ts`) es el único responsable
 * de traducir entre ambos mundos (mapper).
 */

export interface ProductoResponseDto {
  id: number;
  nombre: string;
  categoriaId: number;
  categoriaNombre: string;
  icono: string;
  precioVenta: number;
  costo: number | null;
  disponible: boolean;
}

export interface CategoriaResponseDto {
  id: number;
  nombre: string;
  icono: string;
  totalProductos: number;
}

export interface CrearProductoRequestDto {
  nombre: string;
  categoriaNombre: string;
  precioVenta: number;
  costo: number | null;
  disponible: boolean;
}

export interface GuardarCategoriaRequestDto {
  nombre: string;
}
