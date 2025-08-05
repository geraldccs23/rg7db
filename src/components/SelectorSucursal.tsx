import React, { useState } from 'react';
import { Plus, Settings, Trash2, Store, ChevronDown, Check } from 'lucide-react';
import { SucursalConfig } from '../types';
import { useSucursalConfig } from '../hooks/useSucursalConfig';

export function SelectorSucursal() {
  const { sucursales, selectedSucursal, setSelectedSucursal, addSucursal, removeSucursal } = useSucursalConfig();
  const [showForm, setShowForm] = useState(false);
  const [showSucursales, setShowSucursales] = useState(true);
  const [formData, setFormData] = useState({
    nombre: '',
    baseId: '',
    tablaVentasId: '',
    vistaVentasId: '',
    tablaStockId: '',
    vistaStockId: '',
    tablaProductosId: '',
    vistaProductosId: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre || !formData.baseId || !formData.tablaVentasId) return;

    const newSucursal: SucursalConfig = {
      id: Date.now().toString(),
      ...formData
    };

    addSucursal(newSucursal);
    setFormData({ 
      nombre: '', 
      baseId: '', 
      tablaVentasId: '', 
      vistaVentasId: '',
      tablaStockId: '',
      vistaStockId: '',
      tablaProductosId: '',
      vistaProductosId: ''
    });
    setShowForm(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Store className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-800">Configuración de Sucursales</h2>
          {sucursales.length > 0 && (
            <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
              {sucursales.length} configurada{sucursales.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {sucursales.length > 0 && (
            <button
              onClick={() => setShowSucursales(!showSucursales)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ChevronDown className={`w-4 h-4 transition-transform ${showSucursales ? 'rotate-180' : ''}`} />
              {showSucursales ? 'Ocultar' : 'Mostrar'} Sucursales
            </button>
          )}
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nueva Sucursal
          </button>
        </div>
      </div>

      {/* Selector de sucursal activa */}
      {sucursales.length > 0 && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <label className="block text-sm font-medium text-green-800 mb-3">
            🏢 Sucursal Activa para el Dashboard
          </label>
          <div className="flex items-center gap-3">
            <select
              value={selectedSucursal?.id || ''}
              onChange={(e) => {
                const sucursal = sucursales.find(s => s.id === e.target.value);
                setSelectedSucursal(sucursal || null);
              }}
              className="flex-1 px-4 py-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white font-medium"
            >
              {sucursales.map(sucursal => (
                <option key={sucursal.id} value={sucursal.id}>
                  {sucursal.nombre}
                </option>
              ))}
            </select>
            <div className="flex items-center text-green-700">
              <Check className="w-5 h-5 mr-1" />
              <span className="text-sm font-medium">Conectado</span>
            </div>
          </div>
          {selectedSucursal && (
            <div className="mt-2 text-sm text-green-600">
              Base: <code className="bg-green-100 px-1 rounded">{selectedSucursal.baseId}</code> | 
              Tabla: <code className="bg-green-100 px-1 rounded">{selectedSucursal.tablaVentasId}</code>
              {selectedSucursal.vistaVentasId && (
                <> | Vista: <code className="bg-green-100 px-1 rounded">{selectedSucursal.vistaVentasId}</code></>
              )}
              {selectedSucursal.tablaStockId && (
                <> | Stock: <code className="bg-green-100 px-1 rounded">{selectedSucursal.tablaStockId}</code></>
              )}
            </div>
          )}
        </div>
      )}

      {/* Lista de sucursales configuradas */}
      {sucursales.length > 0 && showSucursales && (
        <div className="mb-4">
          <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Store className="w-4 h-4" />
            Todas las Sucursales Configuradas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sucursales.map(sucursal => (
              <div 
                key={sucursal.id} 
                className={`relative p-4 rounded-lg border-2 transition-all ${
                  selectedSucursal?.id === sucursal.id 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                }`}
              >
                {selectedSucursal?.id === sucursal.id && (
                  <div className="absolute top-2 right-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                )}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900">{sucursal.nombre}</h4>
                      {selectedSucursal?.id === sucursal.id && (
                        <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                          ACTIVA
                        </span>
                      )}
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Base:</span> 
                        <code className="ml-1 bg-gray-200 px-1 rounded text-xs">{sucursal.baseId}</code>
                      </div>
                      <div>
                        <span className="font-medium">Tabla:</span> 
                        <code className="ml-1 bg-gray-200 px-1 rounded text-xs">{sucursal.tablaVentasId}</code>
                      </div>
                      {sucursal.vistaVentasId && (
                        <div>
                          <span className="font-medium">Vista:</span> 
                          <code className="ml-1 bg-gray-200 px-1 rounded text-xs">{sucursal.vistaVentasId}</code>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-3">
                    <button
                      onClick={() => setSelectedSucursal(sucursal)}
                      disabled={selectedSucursal?.id === sucursal.id}
                      className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                        selectedSucursal?.id === sucursal.id
                          ? 'bg-green-100 text-green-700 cursor-not-allowed'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                    >
                      {selectedSucursal?.id === sucursal.id ? 'Activa' : 'Activar'}
                    </button>
                    <button
                      onClick={() => removeSucursal(sucursal.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Eliminar sucursal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {sucursal.tablaStockId && (
                      <div>
                        <span className="font-medium">Stock:</span> 
                        <code className="ml-1 bg-gray-200 px-1 rounded text-xs">{sucursal.tablaStockId}</code>
                      </div>
                    )}
                    {sucursal.tablaProductosId && (
                      <div>
                        <span className="font-medium">Productos:</span> 
                        <code className="ml-1 bg-gray-200 px-1 rounded text-xs">{sucursal.tablaProductosId}</code>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Formulario para nueva sucursal */}
      {showForm && (
        <div className="border-t border-gray-200 pt-4">
          <h3 className="font-medium text-gray-700 mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Agregar Nueva Sucursal
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la Sucursal *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: BOLEITA, MARACAY, VALENCIA..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID de Base de Datos *
              </label>
              <input
                type="text"
                value={formData.baseId}
                onChange={(e) => setFormData({ ...formData, baseId: e.target.value })}
                placeholder="Ej: p12345678"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID de Tabla de Ventas *
              </label>
              <input
                type="text"
                value={formData.tablaVentasId}
                onChange={(e) => setFormData({ ...formData, tablaVentasId: e.target.value })}
                placeholder="Ej: mug3o9iepu2808m"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID de Vista de Ventas (Opcional)
              </label>
              <input
                type="text"
                value={formData.vistaVentasId}
                onChange={(e) => setFormData({ ...formData, vistaVentasId: e.target.value })}
                placeholder="ID de vista específica"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="border-t border-blue-200 pt-4">
              <h4 className="font-medium text-blue-800 mb-3">Configuración de Stock (Opcional)</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID de Tabla de Stock
                  </label>
                  <input
                    type="text"
                    value={formData.tablaStockId}
                    onChange={(e) => setFormData({ ...formData, tablaStockId: e.target.value })}
                    placeholder="Ej: m2i7mf3qrqfcbfm"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID de Vista de Stock
                  </label>
                  <input
                    type="text"
                    value={formData.vistaStockId}
                    onChange={(e) => setFormData({ ...formData, vistaStockId: e.target.value })}
                    placeholder="ID de vista específica"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID de Tabla de Productos
                  </label>
                  <input
                    type="text"
                    value={formData.tablaProductosId}
                    onChange={(e) => setFormData({ ...formData, tablaProductosId: e.target.value })}
                    placeholder="Ej: mqkv8umh5o9kwxe"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID de Vista de Productos
                  </label>
                  <input
                    type="text"
                    value={formData.vistaProductosId}
                    onChange={(e) => setFormData({ ...formData, vistaProductosId: e.target.value })}
                    placeholder="ID de vista específica"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Guardar Sucursal
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {sucursales.length === 0 && !showForm && (
        <div className="text-center py-12 text-gray-500">
          <Store className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">No hay sucursales configuradas</h3>
          <p className="text-sm mb-4">Configura tu primera sucursal para comenzar a ver los datos del dashboard</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left max-w-lg mx-auto mb-4">
            <h4 className="font-medium text-blue-800 mb-2">IDs de Tablas Sugeridos:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>Stock:</strong> m2i7mf3qrqfcbfm (dbo_saStockAlmacen)</li>
              <li>• <strong>Productos:</strong> mqkv8umh5o9kwxe (dbo_saArticulo)</li>
              <li>• <strong>Ventas:</strong> mug3o9iepu2808m (dbo_vw_ventas_detalladas)</li>
            </ul>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Configurar Primera Sucursal
          </button>
        </div>
      )}
    </div>
  );
}