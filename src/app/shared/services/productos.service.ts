import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, firstValueFrom, forkJoin } from 'rxjs';
import { Categoria } from '../../features/productos/domain/categoria.model';
import { ProductosRepository } from '../../features/productos/domain/productos.repository';
import { CategoriaProducto, Producto, ProductoCommand } from '../../features/productos/domain/producto.model';
import { apiErrorMessage } from './api-error-message';

@Injectable({ providedIn: 'root' })
export class ProductosService {
  private readonly repository = inject(ProductosRepository);
  private readonly catalogoCategorias = signal<Categoria[]>([]);
  readonly categorias = computed(() => this.catalogoCategorias().map((c) => c.nombre));
  readonly productos = signal<Producto[]>([]);
  readonly cargando = signal(false);
  readonly guardando = signal(false);
  readonly error = signal<string | null>(null);

  constructor() {
    void this.recargar();
  }

  private async cargarCatalogo(): Promise<void> {
    const catalogo = await firstValueFrom(forkJoin({
      categorias: this.repository.listarCategorias(),
      productos: this.repository.listarProductos(),
    }));
    this.catalogoCategorias.set(catalogo.categorias);
    this.productos.set(catalogo.productos);
  }

  async recargar(): Promise<void> {
    if (this.cargando() || this.guardando()) return;
    this.cargando.set(true);
    this.error.set(null);
    try {
      await this.cargarCatalogo();
    } catch (error) {
      this.error.set(apiErrorMessage(
        error,
        'No se pudo cargar el catalogo. Verifica la conexion y reintenta.',
      ));
    } finally {
      this.cargando.set(false);
    }
  }

  crearCategoria(nombre: CategoriaProducto): Promise<boolean> {
    return this.ejecutar(() => this.repository.crearCategoria(nombre), () => this.cargarCatalogo());
  }

  editarCategoria(actual: CategoriaProducto, nombre: CategoriaProducto): Promise<boolean> {
    const categoria = this.catalogoCategorias().find((c) => c.nombre === actual);
    if (!categoria) return this.categoriaNoEncontrada();
    return this.ejecutar(() => this.repository.editarCategoria(categoria.id, nombre), () => this.cargarCatalogo());
  }

  eliminarCategoria(nombre: CategoriaProducto): Promise<boolean> {
    const categoria = this.catalogoCategorias().find((c) => c.nombre === nombre);
    if (!categoria) return this.categoriaNoEncontrada();
    return this.ejecutar(() => this.repository.eliminarCategoria(categoria.id), () => {
      this.catalogoCategorias.update((lista) => lista.filter((c) => c.id !== categoria.id));
    });
  }

  crearProducto(comando: ProductoCommand): Promise<boolean> {
    return this.ejecutar(() => this.repository.crearProducto(comando), (producto) => {
      this.productos.update((lista) => [...lista, producto]);
    });
  }

  editarProducto(id: number, comando: ProductoCommand): Promise<boolean> {
    const cambios = { ...comando, costo: comando.costo === undefined
      ? this.productos().find((p) => p.id === id)?.costo ?? null
      : comando.costo };
    return this.ejecutar(() => this.repository.editarProducto(id, cambios), (producto) => {
      this.productos.update((lista) => lista.map((p) => p.id === id ? producto : p));
    });
  }

  eliminarProducto(id: number): Promise<boolean> {
    return this.ejecutar(() => this.repository.eliminarProducto(id), () => {
      this.productos.update((lista) => lista.filter((p) => p.id !== id));
    });
  }

  private categoriaNoEncontrada(): Promise<boolean> {
    this.error.set('Categoria no encontrada. Recarga el catalogo.');
    return Promise.resolve(false);
  }

  private async ejecutar<T>(operacion: () => Observable<T>, aplicar: (valor: T) => void | Promise<void>): Promise<boolean> {
    if (this.guardando() || this.cargando()) return false;
    this.guardando.set(true);
    this.error.set(null);
    let confirmado = false;
    try {
      const resultado = await firstValueFrom(operacion());
      confirmado = true;
      await aplicar(resultado);
      return true;
    } catch (error) {
      this.error.set(confirmado
        ? 'Cambio guardado, pero no se pudo actualizar la lista. Recarga el catalogo antes de continuar.'
        : apiErrorMessage(error, 'No se pudo guardar el cambio. Verifica los datos y la conexion.'));
      return confirmado;
    } finally {
      this.guardando.set(false);
    }
  }
}
