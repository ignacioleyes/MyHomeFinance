import { Categoria } from "../types/gasto.types";
import { CategoriaIngreso } from "../types/ingreso.types";

interface CategoryColorScheme {
  bg: string;
  border: string;
  text: string;
  icon: string;
}

export const CATEGORY_COLORS: Record<Categoria, CategoryColorScheme> = {
  "Combustible": {
    bg: "#FFF3E0",
    border: "#FF9800",
    text: "#E65100",
    icon: "#FF9800",
  },
  "Cuota Colegios": {
    bg: "#E3F2FD",
    border: "#2196F3",
    text: "#1565C0",
    icon: "#2196F3",
  },
  "Deportes": {
    bg: "#E8F5E9",
    border: "#4CAF50",
    text: "#2E7D32",
    icon: "#4CAF50",
  },
  "Supermercado": {
    bg: "#FFEBEE",
    border: "#F44336",
    text: "#C62828",
    icon: "#F44336",
  },
  "Panadería": {
    bg: "#FFF8E1",
    border: "#FFC107",
    text: "#FF8F00",
    icon: "#FFC107",
  },
  "Verdulería": {
    bg: "#E8F5E9",
    border: "#8BC34A",
    text: "#558B2F",
    icon: "#8BC34A",
  },
  "Carnicería": {
    bg: "#FFEBEE",
    border: "#E91E63",
    text: "#AD1457",
    icon: "#E91E63",
  },
  "Pollería": {
    bg: "#FFF3E0",
    border: "#FF5722",
    text: "#D84315",
    icon: "#FF5722",
  },
  "Restaurantes": {
    bg: "#FCE4EC",
    border: "#E91E63",
    text: "#AD1457",
    icon: "#E91E63",
  },
  "Ropa": {
    bg: "#F3E5F5",
    border: "#9C27B0",
    text: "#6A1B9A",
    icon: "#9C27B0",
  },
  "Cafecito": {
    bg: "#EFEBE9",
    border: "#795548",
    text: "#4E342E",
    icon: "#795548",
  },
  "Tarjetas de Crédito": {
    bg: "#E8EAF6",
    border: "#3F51B5",
    text: "#283593",
    icon: "#3F51B5",
  },
  "Préstamos": {
    bg: "#ECEFF1",
    border: "#607D8B",
    text: "#37474F",
    icon: "#607D8B",
  },
  "Mascotas": {
    bg: "#FFF8E1",
    border: "#FFCA28",
    text: "#F57F17",
    icon: "#FFCA28",
  },
  "Servicios": {
    bg: "#E1F5FE",
    border: "#03A9F4",
    text: "#0277BD",
    icon: "#03A9F4",
  },
  "Farmacia": {
    bg: "#E0F2F1",
    border: "#009688",
    text: "#00695C",
    icon: "#009688",
  },
  "Entretenimiento": {
    bg: "#F3E5F5",
    border: "#7B1FA2",
    text: "#4A148C",
    icon: "#7B1FA2",
  },
  "Kiosco": {
    bg: "#FCE4EC",
    border: "#F48FB1",
    text: "#AD1457",
    icon: "#F48FB1",
  },
  "Alquiler": {
    bg: "#ECEFF1",
    border: "#546E7A",
    text: "#37474F",
    icon: "#546E7A",
  },
  "Otros": {
    bg: "#FAFAFA",
    border: "#9E9E9E",
    text: "#616161",
    icon: "#9E9E9E",
  },
};

// Colores para tipos de transacción (futuro: ingresos, ahorros)
export const TRANSACTION_TYPE_COLORS = {
  gastos: {
    bg: "#FFEBEE",
    border: "#EF5350",
    text: "#C62828",
    icon: "#EF5350",
  },
  ingresos: {
    bg: "#E8F5E9",
    border: "#66BB6A",
    text: "#2E7D32",
    icon: "#66BB6A",
  },
  ahorros: {
    bg: "#FFFDE7",
    border: "#FFEE58",
    text: "#F57F17",
    icon: "#FFEE58",
  },
};

// Helper function to get category colors
export function getCategoryColors(categoria: Categoria): CategoryColorScheme {
  return CATEGORY_COLORS[categoria] || CATEGORY_COLORS["Otros"];
}

// Colores para categorías de ingresos
export const INCOME_CATEGORY_COLORS: Record<CategoriaIngreso, CategoryColorScheme> = {
  "Sueldo": {
    bg: "#E8F5E9",
    border: "#4CAF50",
    text: "#2E7D32",
    icon: "#4CAF50",
  },
  "Freelance": {
    bg: "#E3F2FD",
    border: "#2196F3",
    text: "#1565C0",
    icon: "#2196F3",
  },
  "Alquiler": {
    bg: "#FFF3E0",
    border: "#FF9800",
    text: "#E65100",
    icon: "#FF9800",
  },
  "Venta": {
    bg: "#F3E5F5",
    border: "#9C27B0",
    text: "#6A1B9A",
    icon: "#9C27B0",
  },
  "Inversiones": {
    bg: "#E0F2F1",
    border: "#009688",
    text: "#00695C",
    icon: "#009688",
  },
  "Otros": {
    bg: "#FAFAFA",
    border: "#9E9E9E",
    text: "#616161",
    icon: "#9E9E9E",
  },
};

// Helper function to get income category colors
export function getIncomeCategoryColors(categoria: CategoriaIngreso): CategoryColorScheme {
  return INCOME_CATEGORY_COLORS[categoria] || INCOME_CATEGORY_COLORS["Otros"];
}
