import { Injectable } from '@angular/core';

import { ProductoVendido, VentaDiaria } from '../domain/reportes.model';
import { ReportesRepository } from '../domain/reportes.repository';

@Injectable()
export class ReportesMemoryRepository implements ReportesRepository {
  obtenerVentasDiarias(): VentaDiaria[] {
    const hoy = new Date();
    const haceDias = (dias: number) => {
      const fecha = new Date(hoy);
      fecha.setDate(fecha.getDate() - dias);
      fecha.setHours(0, 0, 0, 0);
      return fecha;
    };

    const totales = [
      42000, 38500, 51000, 47500, 63000, 71500, 58000, 36000, 44500, 52500, 60000, 39000, 48000, 55500,
    ];
    const pedidos = [8, 7, 10, 9, 12, 14, 11, 6, 8, 10, 12, 7, 9, 11];

    return totales.map((totalVentas, indice) => ({
      fecha: haceDias(totales.length - 1 - indice),
      totalVentas,
      cantidadPedidos: pedidos[indice],
    }));
  }

  obtenerProductosVendidos(): ProductoVendido[] {
    return [
      {
        nombre: 'Papas fritas medianas',
        categoria: 'Papas fritas',
        icono: '🍟',
        cantidadVendida: 86,
        totalGenerado: 301000,
      },
      {
        nombre: 'Papas fritas grandes',
        categoria: 'Papas fritas',
        icono: '🍟',
        cantidadVendida: 64,
        totalGenerado: 256000,
      },
      {
        nombre: 'Handroll pollo',
        categoria: 'Handroll',
        icono: '🍙',
        cantidadVendida: 58,
        totalGenerado: 232000,
      },
      {
        nombre: 'Bebida',
        categoria: 'Bebidas',
        icono: '🥤',
        cantidadVendida: 91,
        totalGenerado: 136500,
      },
      {
        nombre: 'Handroll camarón',
        categoria: 'Handroll',
        icono: '🍙',
        cantidadVendida: 39,
        totalGenerado: 175500,
      },
      {
        nombre: 'Papas fritas chicas',
        categoria: 'Papas fritas',
        icono: '🍟',
        cantidadVendida: 47,
        totalGenerado: 94000,
      },
    ];
  }
}
