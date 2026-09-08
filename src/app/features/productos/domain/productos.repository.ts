import { Categoria } from './categoria.model';
import { Observable } from 'rxjs';

import { CategoriaProducto, Producto, ProductoCommand } from './producto.model';

/**
 * Contrato del repositorio de Productos/Categorías.
 *
 * Mantiene las operaciones asincronas independientes del transporte;
 * el adapter HTTP es la implementacion configurada en la aplicacion.
 */
export abstract class ProductosRepository {
  abstract listarProductos(): Observable<Producto[]>;
  abstract crearProducto(comando: ProductoCommand): Observable<Producto>;
  abstract editarProducto(id: number, comando: ProductoCommand): Observable<Producto>;
  abstract eliminarProducto(id: number): Observable<void>;

  abstract listarCategorias(): Observable<Categoria[]>;
  abstract crearCategoria(nombre: CategoriaProducto): Observable<CategoriaProducto>;
  abstract editarCategoria(id: number, nuevoNombre: CategoriaProducto): Observable<CategoriaProducto>;
  abstract eliminarCategoria(id: number): Observable<void>;
}
