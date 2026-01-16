export interface Gasto {
  id: string;
  importe: number;
  categoria: Categoria;
  descripcion?: string;
  fecha: string; // ISO 8601 format
  createdAt: number; // timestamp
}

export type Categoria =
  | "Combustible"
  | "Cuota Colegios"
  | "Deportes"
  | "Supermercado"
  | "Panadería"
  | "Verdulería"
  | "Carnicería"
  | "Pollería"
  | "Restaurantes"
  | "Ropa"
  | "Cafecito"
  | "Tarjetas de Crédito"
  | "Préstamos"
  | "Mascotas"
  | "Servicios"
  | "Farmacia"
  | "Entretenimiento"
  | "Depilación"
  | "Alquiler"
  | "Otros";

export interface GastoFormData {
  importe: string;
  categoria: Categoria | "";
  descripcion: string;
  fecha: string;
}

export interface ResumenMensual {
  mes: string; // formato "YYYY-MM"
  total: number;
  cantidad: number;
  gastos: Gasto[];
  porCategoria: Record<Categoria, number>;
}

export interface FiltrosGasto {
  mes?: string;
  categoria?: Categoria;
  fechaInicio?: string;
  fechaFin?: string;
}
