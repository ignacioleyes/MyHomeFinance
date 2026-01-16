import { FORMATO_MONEDA, MONEDA } from "./constants";

export const formatearMoneda = (importe: number): string => {
  return new Intl.NumberFormat(FORMATO_MONEDA, {
    style: "currency",
    currency: MONEDA,
    minimumFractionDigits: 2,
  }).format(importe);
};

export const formatearFecha = (fecha: string): string => {
  return new Date(fecha).toLocaleDateString(FORMATO_MONEDA, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const obtenerMesAnio = (fecha: string): string => {
  // Retorna formato "YYYY-MM"
  return fecha.substring(0, 7);
};

export const obtenerNombreMes = (mesAnio: string): string => {
  const [anio, mes] = mesAnio.split("-");
  const fecha = new Date(parseInt(anio), parseInt(mes) - 1);
  return fecha.toLocaleDateString(FORMATO_MONEDA, {
    year: "numeric",
    month: "long",
  });
};
