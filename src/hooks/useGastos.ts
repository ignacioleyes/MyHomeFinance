import { useMemo, useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { Gasto, GastoFormData, ResumenMensual, FiltrosGasto } from "../types/gasto.types";
import { STORAGE_KEY } from "../utils/constants";
import { obtenerMesAnio } from "../utils/formatters";

export function useGastos() {
  const [gastos, setGastos] = useLocalStorage<Gasto[]>(STORAGE_KEY, []);

  // Agregar un nuevo gasto
  const agregarGasto = useCallback(
    (formData: GastoFormData): Gasto => {
      const nuevoGasto: Gasto = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        importe: parseFloat(formData.importe),
        categoria: formData.categoria as Gasto["categoria"],
        descripcion: formData.descripcion || undefined,
        fecha: formData.fecha,
        createdAt: Date.now(),
      };

      setGastos((prev) => [nuevoGasto, ...prev]);
      return nuevoGasto;
    },
    [setGastos]
  );

  // Eliminar un gasto
  const eliminarGasto = useCallback(
    (id: string): boolean => {
      const gastoExistente = gastos.find((g) => g.id === id);
      if (!gastoExistente) return false;

      setGastos((prev) => prev.filter((g) => g.id !== id));
      return true;
    },
    [gastos, setGastos]
  );

  // Actualizar un gasto
  const actualizarGasto = useCallback(
    (id: string, formData: Partial<GastoFormData>): boolean => {
      const gastoExistente = gastos.find((g) => g.id === id);
      if (!gastoExistente) return false;

      setGastos((prev) =>
        prev.map((g) =>
          g.id === id
            ? {
                ...g,
                ...(formData.importe && { importe: parseFloat(formData.importe) }),
                ...(formData.categoria && { categoria: formData.categoria as Gasto["categoria"] }),
                ...(formData.descripcion !== undefined && { descripcion: formData.descripcion || undefined }),
                ...(formData.fecha && { fecha: formData.fecha }),
              }
            : g
        )
      );
      return true;
    },
    [gastos, setGastos]
  );

  // Filtrar gastos
  const filtrarGastos = useCallback(
    (filtros: FiltrosGasto): Gasto[] => {
      return gastos.filter((gasto) => {
        if (filtros.mes && obtenerMesAnio(gasto.fecha) !== filtros.mes) {
          return false;
        }
        if (filtros.categoria && gasto.categoria !== filtros.categoria) {
          return false;
        }
        if (filtros.fechaInicio && gasto.fecha < filtros.fechaInicio) {
          return false;
        }
        if (filtros.fechaFin && gasto.fecha > filtros.fechaFin) {
          return false;
        }
        return true;
      });
    },
    [gastos]
  );

  // Obtener resumen mensual
  const obtenerResumenMensual = useCallback(
    (mes: string): ResumenMensual => {
      const gastosMes = filtrarGastos({ mes });

      const total = gastosMes.reduce((sum, g) => sum + g.importe, 0);

      const porCategoria = gastosMes.reduce((acc, gasto) => {
        acc[gasto.categoria] = (acc[gasto.categoria] || 0) + gasto.importe;
        return acc;
      }, {} as Record<Gasto["categoria"], number>);

      return {
        mes,
        total,
        cantidad: gastosMes.length,
        gastos: gastosMes,
        porCategoria,
      };
    },
    [filtrarGastos]
  );

  // Obtener total general
  const totalGeneral = useMemo(() => {
    return gastos.reduce((sum, g) => sum + g.importe, 0);
  }, [gastos]);

  // Obtener meses disponibles
  const mesesDisponibles = useMemo(() => {
    const meses = new Set(gastos.map((g) => obtenerMesAnio(g.fecha)));
    return Array.from(meses).sort((a, b) => b.localeCompare(a));
  }, [gastos]);

  return {
    gastos,
    agregarGasto,
    eliminarGasto,
    actualizarGasto,
    filtrarGastos,
    obtenerResumenMensual,
    totalGeneral,
    mesesDisponibles,
  };
}
