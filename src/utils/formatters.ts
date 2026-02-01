import { FORMATO_MONEDA, MONEDA } from "./constants";

export const formatearMoneda = (importe: number): string => {
  return new Intl.NumberFormat(FORMATO_MONEDA, {
    style: "currency",
    currency: MONEDA,
    minimumFractionDigits: 2,
  }).format(importe);
};

export const formatearFecha = (fecha: string): string => {
  // Agregar T00:00:00 para que se interprete como hora local, no UTC
  const fechaLocal = new Date(fecha + "T00:00:00");
  return fechaLocal.toLocaleDateString(FORMATO_MONEDA, {
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

export const obtenerFechaHoy = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatearImporteArgentino = (valor: string): string => {
  // Remover todo excepto números y coma
  let limpio = valor.replace(/[^\d,]/g, "");

  // Solo permitir una coma
  const partes = limpio.split(",");
  if (partes.length > 2) {
    limpio = partes[0] + "," + partes.slice(1).join("");
  }

  // Limitar decimales a 2
  if (partes.length === 2 && partes[1].length > 2) {
    limpio = partes[0] + "," + partes[1].substring(0, 2);
  }

  // Formatear parte entera con puntos de miles
  const [entero, decimal] = limpio.split(",");
  const enteroFormateado = entero.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return decimal !== undefined ? `${enteroFormateado},${decimal}` : enteroFormateado;
};

export const parsearImporteArgentino = (valorFormateado: string): string => {
  // Convertir de formato argentino (1.234,56) a formato numérico (1234.56)
  return valorFormateado.replace(/\./g, "").replace(",", ".");
};
