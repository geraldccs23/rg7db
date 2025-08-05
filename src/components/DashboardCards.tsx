import React from "react";
import {
  DollarSign,
  Package,
  TrendingUp,
  AlertTriangle,
  ShoppingCart,
  Users,
} from "lucide-react";
import { Venta, ProductoTop } from "../types";

interface DashboardCardsProps {
  ventas: Venta[];
  productosTop: ProductoTop[];
  loading: boolean;
}

export function DashboardCards({
  ventas,
  productosTop,
  loading,
}: DashboardCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl p-6 shadow-lg animate-pulse"
          >
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  const totalVentas = ventas.reduce((sum, venta) => {
    const usd = Number(venta.total_usd);
    if (!isNaN(usd) && usd > 0) return sum + usd;

    const neto = Number(venta.reng_neto);
    const tasa = Number(venta.tasa);
    const calculado = neto && tasa ? neto / tasa : 0;

    return sum + calculado;
  }, 0);
  console.log(
    "Ventas con total_usd > 0:",
    ventas.filter((v) => v.total_usd > 0).length
  );
  const totalProductos = ventas.length;
  const promedioVenta = totalProductos > 0 ? totalVentas / totalProductos : 0;
  const ventasHoy = ventas.filter((v) => {
    const fecha = new Date(v.fecha);
    const hoy = new Date();
    return fecha.toDateString() === hoy.toDateString();
  }).length;
  const clientesUnicos = new Set(ventas.map((v) => v.nombre_cliente)).size;
  const vendedoresActivos = new Set(
    ventas.map((v) => v.nombre_vendedor).filter(Boolean)
  ).size;

  const cards = [
    {
      title: "Ventas Totales",
      value: `$${totalVentas.toLocaleString("es-ES", {
        minimumFractionDigits: 2,
      })}`,
      change: "+12.5%",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
      changeColor: "text-green-600",
    },
    {
      title: "Productos Vendidos",
      value: totalProductos.toLocaleString(),
      change: "+8.2%",
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      changeColor: "text-blue-600",
    },
    {
      title: "Promedio por Venta",
      value: `$${promedioVenta.toLocaleString("es-ES", {
        minimumFractionDigits: 2,
      })}`,
      change: "+5.1%",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      changeColor: "text-purple-600",
    },
    {
      title: "Ventas Hoy",
      value: ventasHoy.toString(),
      change: "vs ayer",
      icon: ShoppingCart,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      changeColor: "text-orange-600",
    },
    {
      title: "Clientes Únicos",
      value: clientesUnicos.toString(),
      change: "+3.7%",
      icon: Users,
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      changeColor: "text-teal-600",
    },
    {
      title: "Vendedores Activos",
      value: vendedoresActivos.toString(),
      change: "este mes",
      icon: AlertTriangle,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      changeColor: "text-indigo-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${card.bgColor}`}>
              <card.icon className={`w-6 h-6 ${card.color}`} />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">{card.title}</p>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p
              className={`text-sm ${card.changeColor} flex items-center gap-1`}
            >
              <TrendingUp className="w-3 h-3" />
              {card.change}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
