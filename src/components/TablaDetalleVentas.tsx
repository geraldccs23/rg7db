// TablaDetalleVentas.tsx
import React, { useState, useMemo } from "react";
import { Search, Filter, Download, Calendar, User, Tag } from "lucide-react";
import { Venta } from "../types";
import { mapCategoria, getCategoriaColor } from "../utils/categoriaMapper";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface TablaDetalleVentasProps {
  ventas: Venta[];
  loading: boolean;
}

// ✅ Función segura para formatear fechas
function safeFormatDate(dateString: string | undefined | null) {
  if (!dateString) return "Fecha inválida";
  const parsed = new Date(dateString);
  return isNaN(parsed.getTime())
    ? "Fecha inválida"
    : format(parsed, "dd/MM/yyyy", { locale: es });
}

export function TablaDetalleVentas({
  ventas,
  loading,
}: TablaDetalleVentasProps) {
  const [filtros, setFiltros] = useState({
    busqueda: "",
    fechaInicio: "",
    fechaFin: "",
    vendedor: "",
    categoria: "",
  });
  const [ordenamiento, setOrdenamiento] = useState({
    campo: "fecha",
    direccion: "desc",
  });
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 20;

  const vendedoresUnicos = useMemo(() => {
    const vendedores = [
      ...new Set(ventas.map((v) => v.nombre_vendedor).filter(Boolean)),
    ];
    return vendedores.sort();
  }, [ventas]);

  const categoriasUnicas = useMemo(() => {
    const categorias = [...new Set(ventas.map((v) => mapCategoria(v.des_art)))];
    return categorias.sort();
  }, [ventas]);

  const ventasFiltradas = useMemo(() => {
    let resultado = ventas.filter((venta) => {
      const cumpleBusqueda =
        !filtros.busqueda ||
        venta.des_art.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
        venta.nombre_cliente
          .toLowerCase()
          .includes(filtros.busqueda.toLowerCase()) ||
        venta.co_art.toLowerCase().includes(filtros.busqueda.toLowerCase());

      const cumpleFechaInicio =
        !filtros.fechaInicio ||
        new Date(venta.fec_emis) >= new Date(filtros.fechaInicio);

      const cumpleFechaFin =
        !filtros.fechaFin ||
        new Date(venta.fec_emis) <= new Date(filtros.fechaFin);

      const cumpleVendedor =
        !filtros.vendedor || venta.nombre_vendedor === filtros.vendedor;

      const cumpleCategoria =
        !filtros.categoria || mapCategoria(venta.des_art) === filtros.categoria;

      return (
        cumpleBusqueda &&
        cumpleFechaInicio &&
        cumpleFechaFin &&
        cumpleVendedor &&
        cumpleCategoria
      );
    });

    resultado.sort((a, b) => {
      let valorA: any = a[ordenamiento.campo as keyof Venta];
      let valorB: any = b[ordenamiento.campo as keyof Venta];

      if (ordenamiento.campo === "fecha") {
        valorA = new Date(valorA);
        valorB = new Date(valorB);
      }

      if (typeof valorA === "string") {
        valorA = valorA.toLowerCase();
        valorB = valorB.toLowerCase();
      }

      if (valorA < valorB) return ordenamiento.direccion === "asc" ? -1 : 1;
      if (valorA > valorB) return ordenamiento.direccion === "asc" ? 1 : -1;
      return 0;
    });

    return resultado;
  }, [ventas, filtros, ordenamiento]);

  const ventasPaginadas = useMemo(() => {
    const inicio = (paginaActual - 1) * itemsPorPagina;
    return ventasFiltradas.slice(inicio, inicio + itemsPorPagina);
  }, [ventasFiltradas, paginaActual]);

  const totalPaginas = Math.ceil(ventasFiltradas.length / itemsPorPagina);

  const handleOrdenamiento = (campo: string) => {
    setOrdenamiento((prev) => ({
      campo,
      direccion:
        prev.campo === campo && prev.direccion === "asc" ? "desc" : "asc",
    }));
  };

  const exportarCSV = () => {
    const headers = [
      "Fecha",
      "Cliente",
      "Producto",
      "Código",
      "Cantidad",
      "Total USD",
      "Vendedor",
      "Categoría",
    ];
    const csvContent = [
      headers.join(","),
      ...ventasFiltradas.map((venta) =>
        [
          safeFormatDate(venta.fec_emis),
          `"${venta.nombre_cliente}"`,
          `"${venta.des_art}"`,
          venta.co_art,
          venta.reng_neto || 1,
          venta.total_usd,
          `"${venta.nombre_vendedor || ""}"`,
          `"${mapCategoria(venta.des_art)}"`,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `ventas_${format(new Date(), "yyyyMMdd")}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="space-y-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      {/* ... encabezado, filtros y tabla ... */}
      <table className="w-full text-sm">
        <thead>{/* ... */}</thead>
        <tbody>
          {ventasPaginadas.map((venta, index) => {
            const categoria = mapCategoria(venta.des_art);
            return (
              <tr
                key={index}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="py-3 px-3">{safeFormatDate(venta.fec_emis)}</td>
                <td className="py-3 px-3">{venta.nombre_cliente}</td>
                <td className="py-3 px-3">
                  {venta.des_art} <br />
                  <small>{venta.co_art}</small>
                </td>
                <td className="py-3 px-3">
                  <span
                    className="inline-flex px-2 py-1 text-xs font-medium rounded-full text-white"
                    style={{ backgroundColor: getCategoriaColor(categoria) }}
                  >
                    {categoria}
                  </span>
                </td>
                <td className="text-right py-3 px-3 font-medium">
                  $
                  {venta.total_usd.toLocaleString("es-ES", {
                    minimumFractionDigits: 2,
                  })}
                </td>
                <td className="py-3 px-3">{venta.nombre_vendedor || "-"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {/* ... paginación ... */}
    </div>
  );
}
