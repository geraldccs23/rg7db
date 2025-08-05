import React, { useState, useMemo } from 'react';
import { Package, AlertTriangle, Search, Filter, Download, TrendingDown, TrendingUp, Warehouse } from 'lucide-react';
import { Producto, Stock } from '../types';
import { useNocodbApi } from '../hooks/useNocodbApi';
import { useSucursalConfig } from '../hooks/useSucursalConfig';
import { mapCategoria, getCategoriaColor } from '../utils/categoriaMapper';

interface StockConProducto extends Stock {
  des_art?: string;
  categoria?: string;
  des_alma?: string;
}

export function StockPorSucursal() {
  const { selectedSucursal } = useSucursalConfig();
  const [filtros, setFiltros] = useState({
    busqueda: '',
    categoria: '',
    almacen: '',
    soloStockBajo: false,
    soloSinStock: false
  });
  const [ordenamiento, setOrdenamiento] = useState({ campo: 'stock', direccion: 'asc' });

  // Configuración para Stock
  const stockParams = selectedSucursal?.tablaStockId ? {
    baseId: selectedSucursal.baseId,
    tableId: selectedSucursal.tablaStockId,
    viewId: selectedSucursal.vistaStockId || undefined,
    limit: 2000
  } : null;

  // Configuración para Productos
  const productosParams = selectedSucursal?.tablaProductosId ? {
    baseId: selectedSucursal.baseId,
    tableId: selectedSucursal.tablaProductosId,
    viewId: selectedSucursal.vistaProductosId || undefined,
    limit: 2000
  } : null;

  const { data: stockData, loading: loadingStock, error: errorStock } = useNocodbApi<Stock>(stockParams);
  const { data: productosData, loading: loadingProductos, error: errorProductos } = useNocodbApi<Producto>(productosParams);

  // Combinar datos de stock con información de productos
  const stockConProductos = useMemo(() => {
    if (!stockData.length) return [];

    return stockData.map(stock => {
      const producto = productosData.find(p => p.co_art === stock.co_art);
      return {
        ...stock,
        des_art: producto?.des_alma || `Producto ${stock.co_art}`,
        categoria: producto ? mapCategoria(producto.des_alma || '') : 'SIN CATEGORÍA',
        des_alma: producto?.des_alma || 'N/A'
      } as StockConProducto;
    });
  }, [stockData, productosData]);

  // Filtros y ordenamiento
  const stockFiltrado = useMemo(() => {
    let resultado = stockConProductos.filter(item => {
      const cumpleBusqueda = !filtros.busqueda || 
        item.des_art?.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
        item.co_art.toLowerCase().includes(filtros.busqueda.toLowerCase());

      const cumpleCategoria = !filtros.categoria || item.categoria === filtros.categoria;
      
      const cumpleAlmacen = !filtros.almacen || item.co_alma === filtros.almacen;
      
      const cumpleStockBajo = !filtros.soloStockBajo || item.stock <= 5;
      
      const cumpleSinStock = !filtros.soloSinStock || item.stock === 0;

      return cumpleBusqueda && cumpleCategoria && cumpleAlmacen && cumpleStockBajo && cumpleSinStock;
    });

    // Ordenamiento
    resultado.sort((a, b) => {
      let valorA: any = a[ordenamiento.campo as keyof StockConProducto];
      let valorB: any = b[ordenamiento.campo as keyof StockConProducto];

      if (typeof valorA === 'string') {
        valorA = valorA.toLowerCase();
        valorB = valorB.toLowerCase();
      }

      if (valorA < valorB) return ordenamiento.direccion === 'asc' ? -1 : 1;
      if (valorA > valorB) return ordenamiento.direccion === 'asc' ? 1 : -1;
      return 0;
    });

    return resultado;
  }, [stockConProductos, filtros, ordenamiento]);

  // Estadísticas
  const estadisticas = useMemo(() => {
    const totalProductos = stockConProductos.length;
    const sinStock = stockConProductos.filter(item => item.stock === 0).length;
    const stockBajo = stockConProductos.filter(item => item.stock > 0 && item.stock <= 5).length;
    const stockTotal = stockConProductos.reduce((sum, item) => sum + item.stock, 0);
    const valorTotal = stockConProductos.reduce((sum, item) => sum + (item.stock * (item.pza || 0)), 0);

    return {
      totalProductos,
      sinStock,
      stockBajo,
      stockTotal,
      valorTotal,
      porcentajeSinStock: totalProductos > 0 ? (sinStock / totalProductos) * 100 : 0,
      porcentajeStockBajo: totalProductos > 0 ? (stockBajo / totalProductos) * 100 : 0
    };
  }, [stockConProductos]);

  const categoriasUnicas = useMemo(() => {
    return [...new Set(stockConProductos.map(item => item.categoria))].sort();
  }, [stockConProductos]);

  const almacenesUnicos = useMemo(() => {
    return [...new Set(stockConProductos.map(item => item.co_alma))].sort();
  }, [stockConProductos]);

  const handleOrdenamiento = (campo: string) => {
    setOrdenamiento(prev => ({
      campo,
      direccion: prev.campo === campo && prev.direccion === 'asc' ? 'desc' : 'asc'
    }));
  };

  const exportarCSV = () => {
    const headers = ['Código', 'Producto', 'Almacén', 'Stock', 'Precio', 'Valor Total', 'Categoría'];
    const csvContent = [
      headers.join(','),
      ...stockFiltrado.map(item => [
        item.co_art,
        `"${item.des_art}"`,
        item.co_alma,
        item.stock,
        item.pza || 0,
        (item.stock * (item.pza || 0)).toFixed(2),
        `"${item.categoria}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `stock_${selectedSucursal?.nombre || 'sucursal'}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const loading = loadingStock || loadingProductos;
  const error = errorStock || errorProductos;

  if (!selectedSucursal) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-lg text-center">
        <Warehouse className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          Selecciona una Sucursal
        </h3>
        <p className="text-gray-600">
          Para ver el stock, primero configura y selecciona una sucursal con las tablas de stock y productos.
        </p>
      </div>
    );
  }

  if (!selectedSucursal.tablaStockId) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
        <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
        <h3 className="text-xl font-semibold text-yellow-800 mb-2">
          Configuración Incompleta
        </h3>
        <p className="text-yellow-700 mb-4">
          La sucursal <strong>{selectedSucursal.nombre}</strong> no tiene configurada la tabla de stock.
        </p>
        <p className="text-sm text-yellow-600">
          Edita la configuración de la sucursal para agregar los IDs de las tablas de stock y productos.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
        <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-500" />
        <h3 className="text-xl font-semibold text-red-800 mb-2">Error al Cargar Stock</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-blue-50">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">Total Productos</p>
            <p className="text-2xl font-bold text-gray-900">
              {loading ? '...' : estadisticas.totalProductos.toLocaleString()}
            </p>
            <p className="text-sm text-blue-600 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Stock Total: {estadisticas.stockTotal.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-red-50">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">Sin Stock</p>
            <p className="text-2xl font-bold text-gray-900">
              {loading ? '...' : estadisticas.sinStock.toLocaleString()}
            </p>
            <p className="text-sm text-red-600 flex items-center gap-1">
              <TrendingDown className="w-3 h-3" />
              {estadisticas.porcentajeSinStock.toFixed(1)}% del total
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-yellow-50">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">Stock Bajo (≤5)</p>
            <p className="text-2xl font-bold text-gray-900">
              {loading ? '...' : estadisticas.stockBajo.toLocaleString()}
            </p>
            <p className="text-sm text-yellow-600 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {estadisticas.porcentajeStockBajo.toFixed(1)}% del total
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-50">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">Valor Total Stock</p>
            <p className="text-2xl font-bold text-gray-900">
              {loading ? '...' : `$${estadisticas.valorTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`}
            </p>
            <p className="text-sm text-green-600 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Inventario valorizado
            </p>
          </div>
        </div>
      </div>

      {/* Filtros y Tabla */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">
            Stock por Producto - {selectedSucursal.nombre}
          </h3>
          <button
            onClick={exportarCSV}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar producto..."
              value={filtros.busqueda}
              onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={filtros.categoria}
            onChange={(e) => setFiltros({ ...filtros, categoria: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todas las categorías</option>
            {categoriasUnicas.map(categoria => (
              <option key={categoria} value={categoria}>{categoria}</option>
            ))}
          </select>

          <select
            value={filtros.almacen}
            onChange={(e) => setFiltros({ ...filtros, almacen: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos los almacenes</option>
            {almacenesUnicos.map(almacen => (
              <option key={almacen} value={almacen}>{almacen}</option>
            ))}
          </select>

          <label className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={filtros.soloStockBajo}
              onChange={(e) => setFiltros({ ...filtros, soloStockBajo: e.target.checked })}
              className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
            />
            <span className="text-sm">Stock Bajo</span>
          </label>

          <label className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={filtros.soloSinStock}
              onChange={(e) => setFiltros({ ...filtros, soloSinStock: e.target.checked })}
              className="rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
            <span className="text-sm">Sin Stock</span>
          </label>

          <button
            onClick={() => setFiltros({ busqueda: '', categoria: '', almacen: '', soloStockBajo: false, soloSinStock: false })}
            className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Limpiar
          </button>
        </div>

        {/* Tabla */}
        {loading ? (
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th 
                    className="text-left py-3 px-3 font-medium text-gray-700 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleOrdenamiento('co_art')}
                  >
                    Código {ordenamiento.campo === 'co_art' && (ordenamiento.direccion === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="text-left py-3 px-3 font-medium text-gray-700 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleOrdenamiento('des_art')}
                  >
                    Producto {ordenamiento.campo === 'des_art' && (ordenamiento.direccion === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="text-left py-3 px-3 font-medium text-gray-700">Categoría</th>
                  <th className="text-center py-3 px-3 font-medium text-gray-700">Almacén</th>
                  <th 
                    className="text-right py-3 px-3 font-medium text-gray-700 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleOrdenamiento('stock')}
                  >
                    Stock {ordenamiento.campo === 'stock' && (ordenamiento.direccion === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="text-right py-3 px-3 font-medium text-gray-700 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleOrdenamiento('pza')}
                  >
                    Precio {ordenamiento.campo === 'pza' && (ordenamiento.direccion === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="text-right py-3 px-3 font-medium text-gray-700">Valor Total</th>
                </tr>
              </thead>
              <tbody>
                {stockFiltrado.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-3 font-mono text-sm">{item.co_art}</td>
                    <td className="py-3 px-3">
                      <div className="max-w-sm truncate font-medium">
                        {item.des_art}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span 
                        className="inline-flex px-2 py-1 text-xs font-medium rounded-full text-white"
                        style={{ backgroundColor: getCategoriaColor(item.categoria || 'SIN CATEGORÍA') }}
                      >
                        {item.categoria}
                      </span>
                    </td>
                    <td className="text-center py-3 px-3 font-mono text-sm">{item.co_alma}</td>
                    <td className="text-right py-3 px-3">
                      <span className={`font-bold ${
                        item.stock === 0 ? 'text-red-600' : 
                        item.stock <= 5 ? 'text-yellow-600' : 
                        'text-green-600'
                      }`}>
                        {item.stock.toLocaleString()}
                      </span>
                    </td>
                    <td className="text-right py-3 px-3">
                      ${(item.pza || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="text-right py-3 px-3 font-medium">
                      ${(item.stock * (item.pza || 0)).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && stockFiltrado.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No se encontraron productos</h3>
            <p className="text-sm">Intenta ajustar los filtros o verifica la configuración de la sucursal.</p>
          </div>
        )}
      </div>
    </div>
  );
}