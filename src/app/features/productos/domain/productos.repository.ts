import { CategoriaProducto, Producto } from './producto.model';

export abstract class ProductosRepository {
  abstract obtenerCategoriasIniciales(): CategoriaProducto[];
  abstract obtenerProductosIniciales(): Producto[];
}
