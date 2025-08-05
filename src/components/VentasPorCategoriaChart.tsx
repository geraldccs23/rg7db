import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { VentaCategoria } from '../types';
import { getCategoriaColor } from '../utils/categoriaMapper';

interface VentasPorCategoriaChartProps {
  data: VentaCategoria[];
  loading: boolean;
}

export function VentasPorCategoriaChart({ data, loading }: VentasPorCategoriaChartProps) {
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

  const chartData = data.map(item => ({
    ...item,
    color: getCategoriaColor(item.categoria)
  }));

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Ventas por Categoría</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Torta */}
        <div>
          <h4 className="text-sm font-medium text-gray-600 mb-2">Distribución por Monto</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="total"
                label={({ categoria, percent }) => `${categoria} ${(percent * 100).toFixed(1)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`$${value.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`, 'Total']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Barras */}
        <div>
          <h4 className="text-sm font-medium text-gray-600 mb-2">Cantidad de Productos</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="categoria" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [value.toLocaleString(), 'Cantidad']}
              />
              <Bar dataKey="cantidad" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabla resumen */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-600 mb-3">Resumen Detallado</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 font-medium text-gray-700">Categoría</th>
                <th className="text-right py-2 px-3 font-medium text-gray-700">Cantidad</th>
                <th className="text-right py-2 px-3 font-medium text-gray-700">Total USD</th>
                <th className="text-right py-2 px-3 font-medium text-gray-700">Promedio</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((item, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 px-3 flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    {item.categoria}
                  </td>
                  <td className="text-right py-2 px-3">{item.cantidad.toLocaleString()}</td>
                  <td className="text-right py-2 px-3">
                    ${item.total.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="text-right py-2 px-3">
                    ${(item.total / item.cantidad).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
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