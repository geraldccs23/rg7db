import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ProductoTop } from '../types';
import { getCategoriaColor } from '../utils/categoriaMapper';

interface ProductosTopChartProps {
  data: ProductoTop[];
  loading: boolean;
}

export function ProductosTopChart({ data, loading }: ProductosTopChartProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const chartData = data.slice(0, 10).map(item => ({
    ...item,
    nombre: item.des_art.length > 20 ? item.des_art.substring(0, 20) + '...' : item.des_art,
    color: getCategoriaColor(item.categoria)
  }));

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Top 10 Productos Más Vendidos</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico por Cantidad */}
        <div>
          <h4 className="text-sm font-medium text-gray-600 mb-2">Por Cantidad Vendida</h4>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="nombre" 
                angle={-45}
                textAnchor="end"
                height={100}
                fontSize={11}
              />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [value.toLocaleString(), 'Cantidad']}
                labelFormatter={(label) => {
                  const item = data.find(d => d.des_art.includes(label.replace('...', '')));
                  return item?.des_art || label;
                }}
              />
              <Bar dataKey="cantidad" fill="#16a34a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico por Monto */}
        <div>
          <h4 className="text-sm font-medium text-gray-600 mb-2">Por Monto Total (USD)</h4>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="nombre" 
                angle={-45}
                textAnchor="end"
                height={100}
                fontSize={11}
              />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [`$${value.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`, 'Total USD']}
                labelFormatter={(label) => {
                  const item = data.find(d => d.des_art.includes(label.replace('...', '')));
                  return item?.des_art || label;
                }}
              />
              <Bar dataKey="total_usd" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabla detallada */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-600 mb-3">Detalle Completo</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 font-medium text-gray-700">Posición</th>
                <th className="text-left py-2 px-3 font-medium text-gray-700">Producto</th>
                <th className="text-left py-2 px-3 font-medium text-gray-700">Categoría</th>
                <th className="text-right py-2 px-3 font-medium text-gray-700">Cantidad</th>
                <th className="text-right py-2 px-3 font-medium text-gray-700">Total USD</th>
                <th className="text-right py-2 px-3 font-medium text-gray-700">Precio Prom.</th>
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 10).map((item, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 px-3 font-medium text-gray-900">#{index + 1}</td>
                  <td className="py-2 px-3">
                    <div className="max-w-xs">
                      <div className="font-medium text-gray-900 truncate">{item.des_art}</div>
                      <div className="text-xs text-gray-500">{item.co_art}</div>
                    </div>
                  </td>
                  <td className="py-2 px-3">
                    <span 
                      className="inline-flex px-2 py-1 text-xs font-medium rounded-full text-white"
                      style={{ backgroundColor: getCategoriaColor(item.categoria) }}
                    >
                      {item.categoria}
                    </span>
                  </td>
                  <td className="text-right py-2 px-3 font-medium">{item.cantidad.toLocaleString()}</td>
                  <td className="text-right py-2 px-3 font-medium">
                    ${item.total_usd.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="text-right py-2 px-3">
                    ${(item.total_usd / item.cantidad).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}