export function mapCategoria(co_art: string): string {
  const cat_map: Record<string, string> = {
    P: "PEUGEOT",
    CE: "CENTAURO",
    C: "CENTAURO",
    L: "LUBRICANTES",
    A: "ACCESORIOS",
    V: "VOLSKWAGEN",
    F: "FERRETERIA",
    D: "DONG FENG",
    B: "BATERIAS",
    LU: "LUBRICANTES",
    CI: "CITROEN",
    R: "RENAULT",
    I: "ILUMINACION",
    T: "TECNOLOGIA",
    G: "GRIFERIA",
    M: "MULTIMARCA",
    SERVI2: "DELIVERY",
    SERVI: "DELIVERY",
    NULL: "CON ERROR",
    "1149": "CORREGIR",
    "721069": "CORREGIR",
    "210420163": "ACCESORIOS",
    BC025: "LUBRICANTES",
    BC026: "LUBRICANTES",
    "15W40": "LUBRICANTES",
    "20W50": "LUBRICANTES",
    "80W90": "LUBRICANTES",
  };

  if (!co_art) return "SIN CATEGORÍA";

  const prefijo = co_art.split("-")[0].toUpperCase().trim();
  return cat_map[prefijo] || "SIN CATEGORÍA";
}

export function getCategoriaColor(categoria: string): string {
  const colors: Record<string, string> = {
    PEUGEOT: "#3b82f6",
    CENTAURO: "#8b5cf6",
    LUBRICANTES: "#10b981",
    ACCESORIOS: "#f59e0b",
    VOLSKWAGEN: "#6366f1",
    FERRETERIA: "#84cc16",
    "DONG FENG": "#ec4899",
    BATERIAS: "#ef4444",
    CITROEN: "#06b6d4",
    RENAULT: "#f97316",
    ILUMINACION: "#eab308",
    TECNOLOGIA: "#a855f7",
    DELIVERY: "#14b8a6",
    MULTIMARCA: "#64748b",
    "CON ERROR": "#ef4444",
    "SIN CATEGORÍA": "#9ca3af",
  };

  return colors[categoria] || "#9ca3af";
}
