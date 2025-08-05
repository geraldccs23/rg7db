export interface SucursalConfig {
  id: string;
  nombre: string;
  baseId: string;
  tablaVentasId: string;
  vistaVentasId: string;
  tablaStockId?: string;
  vistaStockId?: string;
  tablaProductosId?: string;
  vistaProductosId?: string;
}

export interface Venta {
  id_documento: string;
  fecha: string;
  nombre_cliente: string;
  des_art: string;
  co_art: string;
  total_usd: number;
  tasa: number;
  reng_neto: number;
  prec_vta: number;
  nombre_vendedor?: string;
  nombre_sucursal?: string;
}

export interface Producto {
  co_alma: string;
  des_alma: string;
  co_sucur: string;
  co_art: string;
  materiales?: string;
  produccion?: string;
}

export interface Stock {
  co_alma: string;
  co_art: string;
  stock: number;
  pza: number;
}

export interface VentaCategoria {
  categoria: string;
  total: number;
  cantidad: number;
}

export interface ProductoTop {
  co_art: string;
  des_art: string;
  cantidad: number;
  total_usd: number;
  categoria: string;
}