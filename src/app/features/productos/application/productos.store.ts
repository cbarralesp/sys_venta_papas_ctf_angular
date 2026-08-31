import { Injectable, computed, inject, signal } from '@angular/core';

import { ProductosService } from '../../../shared/services/productos.service';
import { FiltroCategoria } from '../domain/categoria.model';
import { CategoriaProducto, Producto, ProductoCommand } from '../domain/producto.model';

@Injectable()
export class ProductosStore {
  private readonly productosService = inject(ProductosService);

  /** Alias reactivos al servicio compartido */
  readonly categorias = this.productosService.categorias;
  readonly productos = this.productosService.productos;
  readonly categoriaActiva = signal<FiltroCategoria>('Todos');

  readonly filtros = computed<readonly FiltroCategoria[]>(() => [
    'Todos' as FiltroCategoria,
    ...this.categorias(),
  ]);

  readonly productosFiltrados = computed(() => {
    const categoria = this.categoriaActiva();
    return categoria === 'Todos'
      ? this.productos()
      : this.productos().filter((p) => p.categoria === categoria);
  });

  // ── Filtro ─────────────────────────────────────────────────────────────────

  seleccionarCategoria(categoria: FiltroCategoria): void {
    this.categoriaActiva.set(categoria);
  }

  contarPorCategoria(categoria: FiltroCategoria): number {
    return categoria === 'Todos'
      ? this.productos().length
      : this.productos().filter((p) => p.categoria === categoria).length;
  }

  // ── Validaciones ───────────────────────────────────────────────────────────

  categoriaDisponibleParaEliminar(categoria: CategoriaProducto): boolean {
    return this.categorias().length > 1 && this.contarPorCategoria(categoria) === 0;
  }

  existeCategoria(nombre: CategoriaProducto, categoriaActual: CategoriaProducto | null = null): boolean {
    return this.categorias().some(
      (c) =>
        c !== categoriaActual &&
        c.toLocaleLowerCase('es-CL') === nombre.toLocaleLowerCase('es-CL'),
    );
  }

  // ── Categorías (delegadas al servicio) ─────────────────────────────────────

  crearCategoria(nombre: CategoriaProducto): void {
    this.productosService.crearCategoria(nombre);
    this.categoriaActiva.set(nombre);
  }

  editarCategoria(categoriaActual: CategoriaProducto, nuevoNombre: CategoriaProducto): void {
    this.productosService.editarCategoria(categoriaActual, nuevoNombre);
    this.categoriaActiva.set(nuevoNombre);
  }

  eliminarCategoria(categoria: CategoriaProducto): void {
    if (!this.categoriaDisponibleParaEliminar(categoria)) return;
    this.productosService.eliminarCategoria(categoria);
    if (this.categoriaActiva() === categoria) this.categoriaActiva.set('Todos');
  }

  // ── Productos (delegados al servicio) ──────────────────────────────────────

  crearProducto(comando: ProductoCommand): void {
    this.productosService.crearProducto(comando);
  }

  editarProducto(id: number, cambios: ProductoCommand): void {
    this.productosService.editarProducto(id, cambios);
  }

  eliminarProducto(id: number): void {
    this.productosService.eliminarProducto(id);
  }
}
