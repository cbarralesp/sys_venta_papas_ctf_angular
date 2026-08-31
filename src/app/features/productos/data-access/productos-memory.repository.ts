import { Injectable } from '@angular/core';

import { CATEGORIAS_PRODUCTO, CategoriaProducto, Producto } from '../domain/producto.model';
import { ProductosRepository } from '../domain/productos.repository';

@Injectable()
export class ProductosMemoryRepository implements ProductosRepository {
  obtenerCategoriasIniciales(): CategoriaProducto[] {
    return [...CATEGORIAS_PRODUCTO];
  }

  obtenerProductosIniciales(): Producto[] {
    return [
      { id: 1, nombre: 'Papas fritas chicas', categoria: 'Papas fritas', precioVenta: 2000, costo: 900, disponible: true, icono: '🍟' },
      { id: 2, nombre: 'Papas fritas medianas', categoria: 'Papas fritas', precioVenta: 3500, costo: 1500, disponible: true, icono: '🍟' },
      { id: 3, nombre: 'Papas fritas grandes', categoria: 'Papas fritas', precioVenta: 4000, costo: 1800, disponible: true, icono: '🍟' },
      { id: 4, nombre: 'Handroll pollo', categoria: 'Handroll', precioVenta: 4000, costo: 1800, disponible: true, icono: '🍙' },
      { id: 5, nombre: 'Handroll camarón', categoria: 'Handroll', precioVenta: 4500, costo: 2000, disponible: true, icono: '🍙' },
      { id: 6, nombre: 'Bebida', categoria: 'Bebidas', precioVenta: 1500, costo: 700, disponible: true, icono: '🥤' },
    ];
  }
}
