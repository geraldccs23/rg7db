import React, { useMemo } from "react";
import { BarChart3, Database, RefreshCw, Package } from "lucide-react";
import { SelectorSucursal } from "./components/SelectorSucursal";
import { DashboardCards } from "./components/DashboardCards";
import { VentasPorCategoriaChart } from "./components/VentasPorCategoriaChart";
import { ProductosTopChart } from "./components/ProductosTopChart";
import { TablaDetalleVentas } from "./components/TablaDetalleVentas";
import { StockPorSucursal } from "./components/StockPorSucursal";
import { useNocodbApi } from "./hooks/useNocodbApi";
import { useSucursalConfig } from "./hooks/useSucursalConfig";
import { mapCategoria } from "./utils/categoriaMapper";
import { Venta, VentaCategoria, ProductoTop } from "./types";

function App() {
  const { selectedSucursal } = useSucursalConfig();
  const [activeTab, setActiveTab] = React.useState<"ventas" | "stock">(
    "ventas"
  );

  // Configuración para la API de NocoDB
  const apiParams = selectedSucursal
    ? {
        baseId: selectedSucursal.baseId,
        tableId: selectedSucursal.tablaVentasId,
        viewId: selectedSucursal.vistaVentasId || undefined,
        limit: 1000,
      }
    : null;

  // Fetch de datos
  const {
    data: ventas,
    loading,
    error,
    refetch,
  } = useNocodbApi<Venta>(apiParams);

  // Procesamiento de datos para gráficos
  const ventasPorCategoria = useMemo(() => {
    const categorias: Record<string, VentaCategoria> = {};

    ventas.forEach((venta) => {
      const categoria = mapCategoria(venta.co_art);
      if (!categorias[categoria]) {
        categorias[categoria] = {
          categoria,
          total: 0,
          cantidad: 0,
        };
      }
      categorias[categoria].total += venta.total_usd || 0;
      categorias[categoria].cantidad += 1;
    });

    return Object.values(categorias).sort((a, b) => b.total - a.total);
  }, [ventas]);

  const productosTop = useMemo(() => {
    const productos: Record<string, ProductoTop> = {};

    ventas.forEach((venta) => {
      if (!productos[venta.co_art]) {
        productos[venta.co_art] = {
          co_art: venta.co_art,
          des_art: venta.des_art,
          cantidad: 0,
          total_usd: 0,
          categoria: mapCategoria(venta.co_art),
        };
      }
      productos[venta.co_art].cantidad += 1;
      productos[venta.co_art].total_usd += venta.total_usd || 0;
    });

    return Object.values(productos).sort((a, b) => b.cantidad - a.cantidad);
  }, [ventas]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Dashboard de Ventas
              </h1>
              <p className="text-gray-600">
                {selectedSucursal
                  ? `Sucursal: ${selectedSucursal.nombre}`
                  : "Selecciona una sucursal para ver los datos"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {selectedSucursal && (
              <div className="flex bg-white rounded-lg p-1 shadow-sm border">
                <button
                  onClick={() => setActiveTab("ventas")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                    activeTab === "ventas"
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  Ventas
                </button>
                <button
                  onClick={() => setActiveTab("stock")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                    activeTab === "stock"
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Package className="w-4 h-4" />
                  Stock
                </button>
              </div>
            )}
            <button
              onClick={() => refetch()}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              Actualizar
            </button>
          </div>
        </div>

        {/* Configurador de Sucursales */}
        <SelectorSucursal />

        {selectedSucursal && error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
            <h3 className="text-red-800 font-semibold mb-2">
              Error al cargar los datos
            </h3>
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => refetch()}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}

        {selectedSucursal ? (
          <>
            {activeTab === "ventas" ? (
              <>
                {/* Cards de Indicadores */}
                <DashboardCards
                  ventas={ventas}
                  productosTop={productosTop}
                  loading={loading}
                />

                {/* Gráficos */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
                  <VentasPorCategoriaChart
                    data={ventasPorCategoria}
                    loading={loading}
                  />
                  <ProductosTopChart data={productosTop} loading={loading} />
                </div>

                {/* Tabla Detallada */}
                <TablaDetalleVentas ventas={ventas} loading={loading} />
              </>
            ) : (
              <StockPorSucursal />
            )}
          </>
        ) : (
          <div className="bg-white rounded-xl p-12 shadow-lg text-center">
            <Database className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              ¡Bienvenido al Dashboard de Ventas!
            </h3>
            <p className="text-gray-600 mb-6">
              Para comenzar a visualizar los datos de ventas, configura tu
              primera sucursal usando el formulario de arriba.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left max-w-md mx-auto">
              <h4 className="font-medium text-blue-800 mb-2">
                Datos necesarios:
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Nombre de la sucursal (ej: BOLEITA)</li>
                <li>• ID de base de datos de NocoDB</li>
                <li>• ID de tabla de ventas</li>
                <li>• ID de vista (opcional)</li>
              </ul>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Dashboard de Ventas - NocoDB Integration</p>
          <p>Última actualización: {new Date().toLocaleString("es-ES")}</p>
        </div>
      </div>
    </div>
  );
}

export default App;
