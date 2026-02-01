export interface Ingreso {
  id: string;
  importe: number;
  categoria: CategoriaIngreso;
  descripcion?: string;
  fecha: string; // ISO 8601 format
  createdAt: number; // timestamp
}

export type CategoriaIngreso =
  | "Sueldo"
  | "Freelance"
  | "Alquiler"
  | "Venta"
  | "Inversiones"
  | "Otros";

export interface IngresoFormData {
  importe: string;
  categoria: CategoriaIngreso | "";
  descripcion: string;
  fecha: string;
}

export interface ResumenMensualIngresos {
  mes: string; // formato "YYYY-MM"
  total: number;
  cantidad: number;
  ingresos: Ingreso[];
  porCategoria: Record<CategoriaIngreso, number>;
}

export interface FiltrosIngreso {
  mes?: string;
  categoria?: CategoriaIngreso;
  fechaInicio?: string;
  fechaFin?: string;
}
