import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Box, Heading, Stack, Spinner, Text, Button, Badge } from "@chakra-ui/react";
import { useHousehold } from "../hooks/useHousehold";
import { useSupabaseGastos } from "../hooks/useSupabaseGastos";
import { ListaGastos, SelectorMes } from "../components";
import { GastoFormData, Categoria } from "../types/gasto.types";
import { showSuccessToast, showErrorToast } from "../lib/toast";
import { getCategoryColors } from "../theme/categoryColors";

function obtenerMesActual(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function GastosPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoriaParam = searchParams.get("categoria") as Categoria | null;
  const mesParam = searchParams.get("mes");

  const { household, loading: householdLoading } = useHousehold();
  const {
    gastos,
    eliminarGasto,
    actualizarGasto,
    filtrarGastos,
    mesesDisponibles,
    loading: gastosLoading,
  } = useSupabaseGastos(household?.id || null);

  const isLoading = householdLoading || gastosLoading;

  const [mesSeleccionado, setMesSeleccionado] = useState<string>(mesParam || obtenerMesActual());
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<Categoria | null>(categoriaParam);

  // Sync URL params when they change
  useEffect(() => {
    if (mesParam && mesParam !== mesSeleccionado) {
      setMesSeleccionado(mesParam);
    }
    if (categoriaParam !== categoriaSeleccionada) {
      setCategoriaSeleccionada(categoriaParam);
    }
  }, [mesParam, categoriaParam]);

  const handleClearCategoria = () => {
    setCategoriaSeleccionada(null);
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("categoria");
    setSearchParams(newParams);
  };

  // Obtener gastos filtrados
  const gastosFiltrados = filtrarGastos({
    mes: mesSeleccionado || undefined,
    categoria: categoriaSeleccionada || undefined,
  });

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

  if (isLoading) {
    return (
      <Stack direction="column" align="center" justify="center" py={12} gap={4}>
        <Spinner size="xl" color="primary.500" borderWidth="3px" />
        <Text color="gray.600">Cargando gastos...</Text>
      </Stack>
    );
  }

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

      {/* Filtro de categoría activo */}
      {categoriaSeleccionada && (
        <Box>
          <Stack direction="row" align="center" gap={2} flexWrap="wrap">
            <Text fontSize="sm" color="gray.600">Filtrando por:</Text>
            <Badge
              colorPalette="teal"
              px={3}
              py={1}
              borderRadius="full"
              fontSize="sm"
              bg={getCategoryColors(categoriaSeleccionada).bg}
              color={getCategoryColors(categoriaSeleccionada).text}
              borderWidth="1px"
              borderColor={getCategoryColors(categoriaSeleccionada).border}
            >
              {categoriaSeleccionada}
            </Badge>
            <Button
              size="xs"
              variant="ghost"
              colorPalette="gray"
              onClick={handleClearCategoria}
            >
              Quitar filtro
            </Button>
          </Stack>
        </Box>
      )}

      {/* Lista de Gastos */}
      <Box>
        <Heading as="h2" size="lg" mb={4} color="gray.700">
          {categoriaSeleccionada
            ? `Gastos de ${categoriaSeleccionada}`
            : mesSeleccionado
            ? "Gastos del Mes"
            : "Todos los Gastos"}
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
