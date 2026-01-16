import { GastoFormData, Categoria } from "../types/gasto.types";
import { CATEGORIAS } from "./constants";

export interface ValidationResult {
  isValid: boolean;
  errors: Partial<Record<keyof GastoFormData, string>>;
}

export const validarFormularioGasto = (
  data: GastoFormData
): ValidationResult => {
  const errors: Partial<Record<keyof GastoFormData, string>> = {};

  // Validar importe
  if (!data.importe || data.importe.trim() === "") {
    errors.importe = "El importe es obligatorio";
  } else {
    const importeNum = parseFloat(data.importe);
    if (isNaN(importeNum)) {
      errors.importe = "El importe debe ser un número válido";
    } else if (importeNum <= 0) {
      errors.importe = "El importe debe ser mayor a cero";
    } else if (importeNum > 999999999) {
      errors.importe = "El importe es demasiado grande";
    }
  }

  // Validar categoría
  if (!data.categoria) {
    errors.categoria = "La categoría es obligatoria";
  } else if (!CATEGORIAS.includes(data.categoria as Categoria)) {
    errors.categoria = "La categoría seleccionada no es válida";
  }

  // Validar fecha
  if (!data.fecha || data.fecha.trim() === "") {
    errors.fecha = "La fecha es obligatoria";
  } else {
    const fecha = new Date(data.fecha);
    if (isNaN(fecha.getTime())) {
      errors.fecha = "La fecha no es válida";
    } else if (fecha > new Date()) {
      errors.fecha = "La fecha no puede ser futura";
    }
  }

  // Validar descripción (opcional, pero con límite)
  if (data.descripcion && data.descripcion.length > 500) {
    errors.descripcion = "La descripción no puede exceder 500 caracteres";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
