export type FiltroCategoria = 'Todos' | string;

export interface CategoriaResumen {
  nombre: FiltroCategoria;
  totalProductos: number;
}
