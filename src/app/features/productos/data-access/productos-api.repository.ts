import { Categoria } from '../domain/categoria.model';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { API_BASE_URL } from '../../../shared/config/api.config';
import { CategoriaProducto, Producto, ProductoCommand } from '../domain/producto.model';
import { ProductosRepository } from '../domain/productos.repository';
import {
  CategoriaResponseDto,
  CrearProductoRequestDto,
  GuardarCategoriaRequestDto,
  ProductoResponseDto,
} from './productos-api.dto';

/**
 * Adapter HTTP real del repositorio de Productos/Categorías.
 *
 * Consume el backend Spring Boot (arquitectura hexagonal) expuesto en `/api/productos` y
 * `/api/categorias` (ver ProductoController.java, CategoriaController.java).
 */
@Injectable()
export class ProductosApiRepository implements ProductosRepository {
  private readonly http = inject(HttpClient);

  listarProductos(): Observable<Producto[]> {
    return this.http
      .get<ProductoResponseDto[]>(`${API_BASE_URL}/productos`)
      .pipe(map((productos) => productos.map(toProducto)));
  }

  crearProducto(comando: ProductoCommand): Observable<Producto> {
    const body: CrearProductoRequestDto = {
      nombre: comando.nombre,
      categoriaNombre: comando.categoria,
      costo: comando.costo ?? null,
      precioVenta: comando.precioVenta,
      disponible: comando.disponible,
    };
    return this.http
      .post<ProductoResponseDto>(`${API_BASE_URL}/productos`, body)
      .pipe(map(toProducto));
  }

  editarProducto(id: number, comando: ProductoCommand): Observable<Producto> {
    const body: CrearProductoRequestDto = {
      nombre: comando.nombre,
      categoriaNombre: comando.categoria,
      costo: comando.costo ?? null,
      precioVenta: comando.precioVenta,
      disponible: comando.disponible,
    };
    return this.http
      .put<ProductoResponseDto>(`${API_BASE_URL}/productos/${id}`, body)
      .pipe(map(toProducto));
  }

  eliminarProducto(id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/productos/${id}`);
  }

  listarCategorias(): Observable<Categoria[]> {
    return this.http
      .get<CategoriaResponseDto[]>(`${API_BASE_URL}/categorias`)
      .pipe(map((categorias) => categorias.map((c) => ({ id: c.id, nombre: c.nombre }))));
  }

  crearCategoria(nombre: CategoriaProducto): Observable<CategoriaProducto> {
    const body: GuardarCategoriaRequestDto = { nombre };
    return this.http
      .post<CategoriaResponseDto>(`${API_BASE_URL}/categorias`, body)
      .pipe(map((categoria) => categoria.nombre));
  }

  editarCategoria(id: number, nuevoNombre: CategoriaProducto): Observable<CategoriaProducto> {
    const body: GuardarCategoriaRequestDto = { nombre: nuevoNombre };
    return this.http
      .put<CategoriaResponseDto>(`${API_BASE_URL}/categorias/${id}`, body)
      .pipe(map((categoria) => categoria.nombre));
  }

  eliminarCategoria(id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/categorias/${id}`);
  }
}

function toProducto(dto: ProductoResponseDto): Producto {
  return {
    id: dto.id,
    nombre: dto.nombre,
    categoria: dto.categoriaNombre,
    categoriaId: dto.categoriaId,
    precioVenta: dto.precioVenta,
    costo: dto.costo,
    disponible: dto.disponible,
    icono: dto.icono,
  };
}
