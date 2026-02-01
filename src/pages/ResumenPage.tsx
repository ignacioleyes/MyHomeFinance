import { useState, useMemo } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { Box, Heading, Stack, Spinner, Text, Button } from "@chakra-ui/react";
import { useHousehold } from "../hooks/useHousehold";
import { useSupabaseGastos } from "../hooks/useSupabaseGastos";
import { ResumenMensual, SelectorMes } from "../components";
import { Categoria } from "../types/gasto.types";
import { obtenerNombreMes } from "../utils/formatters";

function obtenerMesActual(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function ResumenPage() {
  const navigate = useNavigate();
  const { household, loading: householdLoading } = useHousehold();
  const {
    gastos,
    obtenerResumenMensual,
    mesesDisponibles,
    loading: gastosLoading,
  } = useSupabaseGastos(household?.id || null);

  // Mostrar loading si el household o los gastos están cargando
  const isLoading = householdLoading || gastosLoading;

  const mesActual = obtenerMesActual();

  // Combinar mes actual con meses disponibles
  const mesesParaSelector = useMemo(() => {
    const allMeses = new Set([...mesesDisponibles, mesActual]);
    return Array.from(allMeses).sort((a, b) => b.localeCompare(a));
  }, [mesesDisponibles, mesActual]);

  const [mesSeleccionado, setMesSeleccionado] = useState<string>(mesActual);

  const handleCategoryClick = (categoria: Categoria) => {
    const params = new URLSearchParams();
    params.set("categoria", categoria);
    if (mesSeleccionado) {
      params.set("mes", mesSeleccionado);
    }
    navigate(`/gastos?${params.toString()}`);
  };

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

  if (isLoading) {
    return (
      <Stack direction="column" align="center" justify="center" py={12} gap={4}>
        <Spinner size="xl" color="primary.500" borderWidth="3px" />
        <Text color="gray.600">Cargando resumen...</Text>
      </Stack>
    );
  }

  return (
    <Stack direction="column" gap={6} pb={24}>
      {/* Selector de Mes */}
      <Box>
        <SelectorMes
          mesesDisponibles={mesesParaSelector}
          mesSeleccionado={mesSeleccionado}
          onChange={setMesSeleccionado}
        />
      </Box>

      {/* Balance / Resumen Mensual */}
      <Box>
        <Heading as="h2" size="lg" mb={4} color="gray.700">
          {mesSeleccionado ? "Resumen del Mes" : "Resumen General"}
        </Heading>
        {resumen.cantidad === 0 ? (
          <Box
            bg="white"
            p={8}
            borderRadius="2xl"
            boxShadow="sm"
            textAlign="center"
          >
            <Text fontSize="lg" color="gray.500">
              En {obtenerNombreMes(mesSeleccionado)} aún no tienes gastos registrados
            </Text>
            <Text fontSize="sm" color="gray.400" mt={2}>
              Agrega tu primer gasto desde la página de inicio
            </Text>
          </Box>
        ) : (
          <ResumenMensual resumen={resumen} onCategoryClick={handleCategoryClick} />
        )}
      </Box>

      {/* Link a detalle de gastos */}
      <Box>
        <Button
          asChild
          colorPalette="teal"
          variant="outline"
          size="lg"
          w="full"
        >
          <RouterLink to="/gastos">
            Ver detalle de los gastos
          </RouterLink>
        </Button>
      </Box>
    </Stack>
  );
}
