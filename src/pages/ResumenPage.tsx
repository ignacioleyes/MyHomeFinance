import { useState } from "react";
import { Box, Heading, Stack } from "@chakra-ui/react";
import { useHousehold } from "../hooks/useHousehold";
import { useSupabaseGastos } from "../hooks/useSupabaseGastos";
import { ListaGastos, ResumenMensual, SelectorMes } from "../components";
import { GastoFormData } from "../types/gasto.types";
import { showSuccessToast, showErrorToast } from "../lib/toast";

export function ResumenPage() {
  const { household } = useHousehold();
  const {
    gastos,
    eliminarGasto,
    actualizarGasto,
    filtrarGastos,
    obtenerResumenMensual,
    mesesDisponibles,
  } = useSupabaseGastos(household?.id || null);

  const [mesSeleccionado, setMesSeleccionado] = useState<string>("");

  // Obtener gastos filtrados
  const gastosFiltrados = mesSeleccionado
    ? filtrarGastos({ mes: mesSeleccionado })
    : gastos;

  // Obtener resumen del mes seleccionado
  const resumen = mesSeleccionado
    ? obtenerResumenMensual(mesSeleccionado)
    : {
        mes: "",
        total: gastos.reduce((sum, g) => sum + g.importe, 0),
        cantidad: gastos.length,
        gastos,
        porCategoria: gastos.reduce((acc, gasto) => {
          acc[gasto.categoria] = (acc[gasto.categoria] || 0) + gasto.importe;
          return acc;
        }, {} as Record<string, number>),
      };

  const handleEliminarGasto = async (id: string) => {
    try {
      const success = await eliminarGasto(id);
      if (success) {
        showSuccessToast("Gasto eliminado", "El gasto se ha eliminado correctamente");
      } else {
        showErrorToast("Error al eliminar", "No se pudo eliminar el gasto");
      }
    } catch (error: any) {
      console.error("Error deleting expense:", error);
      showErrorToast("Error al eliminar", error.message || "No se pudo eliminar el gasto");
    }
  };

  const handleEditarGasto = async (id: string, formData: GastoFormData) => {
    try {
      const success = await actualizarGasto(id, formData);
      if (success) {
        showSuccessToast("Gasto actualizado", "Los cambios se han guardado correctamente");
      } else {
        showErrorToast("Error al actualizar", "No se pudieron guardar los cambios");
      }
    } catch (error: any) {
      console.error("Error updating expense:", error);
      showErrorToast("Error al actualizar", error.message || "No se pudieron guardar los cambios");
    }
  };

  return (
    <Stack direction="column" gap={6} pb={24}>
      {/* Selector de Mes */}
      {mesesDisponibles.length > 0 && (
        <Box>
          <SelectorMes
            mesesDisponibles={mesesDisponibles}
            mesSeleccionado={mesSeleccionado}
            onChange={setMesSeleccionado}
          />
        </Box>
      )}

      {/* Balance / Resumen Mensual */}
      <Box>
        <Heading as="h2" size="lg" mb={4} color="gray.700">
          {mesSeleccionado ? "Resumen del Mes" : "Resumen General"}
        </Heading>
        <ResumenMensual resumen={resumen} />
      </Box>

      {/* Lista de Gastos */}
      <Box>
        <Heading as="h2" size="lg" mb={4} color="gray.700">
          {mesSeleccionado ? "Gastos del Mes" : "Todos los Gastos"}
        </Heading>
        <ListaGastos
          gastos={gastosFiltrados}
          onEliminar={handleEliminarGasto}
          onEditar={handleEditarGasto}
        />
      </Box>
    </Stack>
  );
}
