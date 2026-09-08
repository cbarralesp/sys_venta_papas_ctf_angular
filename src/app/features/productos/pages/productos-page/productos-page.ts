import { Component, HostListener, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ProductosStore } from '../../application/productos.store';
import { FiltroCategoria } from '../../domain/categoria.model';
import { CategoriaProducto, Producto } from '../../domain/producto.model';

@Component({
  selector: 'app-productos',
  imports: [ReactiveFormsModule],
  providers: [ProductosStore],
  templateUrl: './productos-page.html',
  styleUrl: './productos-page.scss',
})
export class Productos {
  private readonly formBuilder = inject(FormBuilder);
  readonly productosStore = inject(ProductosStore);

  readonly categorias = this.productosStore.categorias;
  readonly filtros = this.productosStore.filtros;
  readonly categoriaActiva = this.productosStore.categoriaActiva;
  readonly productos = this.productosStore.productos;
  readonly productosFiltrados = this.productosStore.productosFiltrados;
  readonly modalOpen = signal(false);
  readonly categoryModalOpen = signal(false);
  readonly categoryManagerOpen = signal(false);
  readonly editingCategory = signal<CategoriaProducto | null>(null);
  readonly categoryPendingDelete = signal<CategoriaProducto | null>(null);
  readonly duplicateCategory = signal(false);
  readonly editingId = signal<number | null>(null);

  readonly productForm = this.formBuilder.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    categoria: ['Papas fritas' as CategoriaProducto, Validators.required],
    precioVenta: [0, [Validators.required, Validators.min(1)]],
    disponible: [true],
  });

  readonly categoryForm = this.formBuilder.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
  });

  selectCategory(categoria: FiltroCategoria): void {
    this.productosStore.seleccionarCategoria(categoria);
  }

  categoryCount(categoria: FiltroCategoria): number {
    return this.productosStore.contarPorCategoria(categoria);
  }

  startNew(): void {
    this.editingId.set(null);
    const selectedCategory = this.categoriaActiva() === 'Todos' ? this.categorias()[0] : this.categoriaActiva();
    this.productForm.reset({ nombre: '', categoria: selectedCategory, precioVenta: 0, disponible: true });
    this.modalOpen.set(true);
  }

  openCategoryModal(): void {
    this.editingCategory.set(null);
    this.duplicateCategory.set(false);
    this.categoryForm.reset({ nombre: '' });
    this.categoryModalOpen.set(true);
  }

  openCategoryManager(): void {
    this.categoryManagerOpen.set(true);
  }

  closeCategoryManager(): void {
    this.categoryManagerOpen.set(false);
  }

  openCategoryFromManager(): void {
    this.editingCategory.set(null);
    this.duplicateCategory.set(false);
    this.categoryForm.reset({ nombre: '' });
    this.categoryModalOpen.set(true);
    this.categoryManagerOpen.set(false);
  }

  closeCategoryOverlay(): void {
    if (this.categoryPendingDelete() !== null) {
      this.cancelDeleteCategory();
    } else if (this.categoryModalOpen()) {
      this.closeCategoryModal();
    } else {
      this.closeCategoryManager();
    }
  }

  editCategory(categoria: CategoriaProducto): void {
    this.editingCategory.set(categoria);
    this.duplicateCategory.set(false);
    this.categoryForm.reset({ nombre: categoria });
    this.categoryModalOpen.set(true);
    this.categoryManagerOpen.set(false);
  }

  canDeleteCategory(categoria: CategoriaProducto): boolean {
    return this.productosStore.categoriaDisponibleParaEliminar(categoria);
  }

  requestDeleteCategory(categoria: CategoriaProducto): void {
    if (!this.canDeleteCategory(categoria)) return;
    this.categoryPendingDelete.set(categoria);
    this.categoryManagerOpen.set(false);
  }

  cancelDeleteCategory(): void {
    this.categoryManagerOpen.set(true);
    this.categoryPendingDelete.set(null);
  }

  async confirmDeleteCategory(): Promise<void> {
    const categoria = this.categoryPendingDelete();
    if (categoria === null || !this.canDeleteCategory(categoria)) return;

    if (!await this.productosStore.eliminarCategoria(categoria)) return;
    this.categoryManagerOpen.set(true);
    this.categoryPendingDelete.set(null);
  }

  closeCategoryModal(): void {
    this.categoryModalOpen.set(false);
    this.editingCategory.set(null);
    this.duplicateCategory.set(false);
    this.categoryForm.reset({ nombre: '' });
  }

  async saveCategory(): Promise<void> {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    const categoryName = this.categoryForm.controls.nombre.value.trim();
    const currentCategory = this.editingCategory();
    const alreadyExists = this.productosStore.existeCategoria(categoryName, currentCategory);

    if (alreadyExists) {
      this.duplicateCategory.set(true);
      return;
    }

    if (currentCategory === null) {
      if (!await this.productosStore.crearCategoria(categoryName)) return;
    } else {
      if (!await this.productosStore.editarCategoria(currentCategory, categoryName)) return;
    }
    this.closeCategoryModal();
  }

  editProduct(producto: Producto): void {
    this.editingId.set(producto.id);
    this.productForm.setValue({
      nombre: producto.nombre,
      categoria: producto.categoria,
      precioVenta: producto.precioVenta,
      disponible: producto.disponible,
    });
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
    this.editingId.set(null);
    this.productForm.reset({ nombre: '', categoria: 'Papas fritas', precioVenta: 0, disponible: true });
  }

  async saveProduct(): Promise<void> {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const value = this.productForm.getRawValue();
    const id = this.editingId();

    if (id === null) {
      if (!await this.productosStore.crearProducto(value)) return;
    } else {
      if (!await this.productosStore.editarProducto(id, value)) return;
    }

    this.closeModal();
  }

  deleteProduct(producto: Producto): void {
    if (!window.confirm(`¿Eliminar “${producto.nombre}”?`)) return;
    this.productosStore.eliminarProducto(producto.id);
  }

  formatPrice(value: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(value);
  }

  @HostListener('document:keydown.escape')
  handleEscape(): void {
    if (this.categoryPendingDelete() !== null) {
      this.cancelDeleteCategory();
    } else if (this.categoryModalOpen()) {
      this.closeCategoryModal();
    } else if (this.categoryManagerOpen()) {
      this.closeCategoryManager();
    } else if (this.modalOpen()) {
      this.closeModal();
    }
  }

}
