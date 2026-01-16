import { Categoria } from "../types/gasto.types";

export const CATEGORIAS: readonly Categoria[] = [
  "Combustible",
  "Cuota Colegios",
  "Deportes",
  "Supermercado",
  "Panadería",
  "Verdulería",
  "Carnicería",
  "Pollería",
  "Restaurantes",
  "Ropa",
  "Cafecito",
  "Tarjetas de Crédito",
  "Préstamos",
  "Mascotas",
  "Servicios",
  "Farmacia",
  "Entretenimiento",
  "Depilación",
  "Alquiler",
  "Otros"
] as const;

export const STORAGE_KEY = "gastoshogar_gastos";

export const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
] as const;

export const FORMATO_FECHA = "YYYY-MM-DD";
export const FORMATO_MONEDA = "es-AR";
export const MONEDA = "ARS";
