import { Injectable, computed, inject, signal } from '@angular/core';

import { ProductosService } from '../../../shared/services/productos.service';
import { FiltroCategoria } from '../domain/categoria.model';
import { CategoriaProducto, Producto, ProductoCommand } from '../domain/producto.model';

@Injectable()
export class ProductosStore {
  private readonly productosService = inject(ProductosService);

  /** Alias reactivos al servicio compartido */
  readonly error = this.productosService.error;
  readonly cargando = this.productosService.cargando;
  readonly guardando = this.productosService.guardando;
  recargar(): Promise<void> { return this.productosService.recargar(); }

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

  async crearCategoria(nombre: CategoriaProducto): Promise<boolean> {
    const ok = await this.productosService.crearCategoria(nombre);
    if (ok) this.categoriaActiva.set(nombre);
    return ok;
  }

  async editarCategoria(categoriaActual: CategoriaProducto, nuevoNombre: CategoriaProducto): Promise<boolean> {
    const ok = await this.productosService.editarCategoria(categoriaActual, nuevoNombre);
    if (ok) this.categoriaActiva.set(nuevoNombre);
    return ok;
  }

  async eliminarCategoria(categoria: CategoriaProducto): Promise<boolean> {
    if (!this.categoriaDisponibleParaEliminar(categoria)) return false;
    const ok = await this.productosService.eliminarCategoria(categoria);
    if (ok && this.categoriaActiva() === categoria) this.categoriaActiva.set('Todos');
    return ok;
  }

  // ── Productos (delegados al servicio) ──────────────────────────────────────

  crearProducto(comando: ProductoCommand): Promise<boolean> {
    return this.productosService.crearProducto(comando);
  }

  editarProducto(id: number, cambios: ProductoCommand): Promise<boolean> {
    return this.productosService.editarProducto(id, cambios);
  }

  eliminarProducto(id: number): Promise<boolean> {
    return this.productosService.eliminarProducto(id);
  }
}
