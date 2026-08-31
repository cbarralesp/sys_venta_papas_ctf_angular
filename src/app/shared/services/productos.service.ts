import { Injectable, signal } from '@angular/core';

import { CATEGORIAS_PRODUCTO, CategoriaProducto, Producto, ProductoCommand } from '../../features/productos/domain/producto.model';

/**
 * Servicio raíz singleton para el catálogo de productos.
 * Permite que Caja vea en tiempo real los productos creados/editados
 * en el módulo Productos y viceversa.
 */
@Injectable({ providedIn: 'root' })
export class ProductosService {
  readonly categorias = signal<CategoriaProducto[]>([...CATEGORIAS_PRODUCTO]);

  readonly productos = signal<Producto[]>([
    { id: 1, nombre: 'Papas fritas chicas',   categoria: 'Papas fritas', precioVenta: 2000, costo: 900,  disponible: true, icono: '🍟' },
    { id: 2, nombre: 'Papas fritas medianas',  categoria: 'Papas fritas', precioVenta: 3500, costo: 1500, disponible: true, icono: '🍟' },
    { id: 3, nombre: 'Papas fritas grandes',   categoria: 'Papas fritas', precioVenta: 4000, costo: 1800, disponible: true, icono: '🍟' },
    { id: 4, nombre: 'Handroll pollo',         categoria: 'Handroll',     precioVenta: 4000, costo: 1800, disponible: true, icono: '🍙' },
    { id: 5, nombre: 'Handroll camarón',       categoria: 'Handroll',     precioVenta: 4500, costo: 2000, disponible: true, icono: '🍙' },
    { id: 6, nombre: 'Bebida',                 categoria: 'Bebidas',      precioVenta: 1500, costo: 700,  disponible: true, icono: '🥤' },
  ]);

  // ── Categorías ─────────────────────────────────────────────────────────────

  crearCategoria(nombre: CategoriaProducto): void {
    this.categorias.update((lista) => [...lista, nombre]);
  }

  editarCategoria(categoriaActual: CategoriaProducto, nuevoNombre: CategoriaProducto): void {
    this.categorias.update((lista) =>
      lista.map((c) => (c === categoriaActual ? nuevoNombre : c)),
    );
    this.productos.update((lista) =>
      lista.map((p) =>
        p.categoria === categoriaActual ? { ...p, categoria: nuevoNombre } : p,
      ),
    );
  }

  eliminarCategoria(categoria: CategoriaProducto): void {
    this.categorias.update((lista) => lista.filter((c) => c !== categoria));
  }

  // ── Productos ──────────────────────────────────────────────────────────────

  crearProducto(comando: ProductoCommand): void {
    const nextId = Math.max(0, ...this.productos().map((p) => p.id)) + 1;
    this.productos.update((lista) => [
      ...lista,
      {
        id: nextId,
        nombre: comando.nombre.trim(),
        categoria: comando.categoria,
        precioVenta: Number(comando.precioVenta),
        costo: null,
        disponible: comando.disponible,
        icono: this.iconoPorCategoria(comando.categoria),
      },
    ]);
  }

  editarProducto(id: number, cambios: ProductoCommand): void {
    this.productos.update((lista) =>
      lista.map((p) =>
        p.id === id
          ? {
              ...p,
              nombre: cambios.nombre.trim(),
              categoria: cambios.categoria,
              precioVenta: Number(cambios.precioVenta),
              disponible: cambios.disponible,
              icono: this.iconoPorCategoria(cambios.categoria),
            }
          : p,
      ),
    );
  }

  eliminarProducto(id: number): void {
    this.productos.update((lista) => lista.filter((p) => p.id !== id));
  }

  private iconoPorCategoria(categoria: CategoriaProducto): string {
    const iconos: Record<string, string> = {
      'Papas fritas': '🍟',
      Handroll: '🍙',
      Bebidas: '🥤',
    };
    return iconos[categoria] ?? '🍽️';
  }
}
