import { useState, useMemo } from "react";
import { Box, Stack, Text, Heading, Spinner } from "@chakra-ui/react";
import { useHousehold } from "../hooks/useHousehold";
import { useSupabaseGastos } from "../hooks/useSupabaseGastos";
import { useSupabaseIngresos } from "../hooks/useSupabaseIngresos";
import { SelectorMes } from "../components/ui/SelectorMes";
import { FormularioIngreso } from "../components/forms/FormularioIngreso";
import { ListaIngresos } from "../components/ingresos/ListaIngresos";
import { IngresoFormData } from "../types/ingreso.types";
import { formatearMoneda, obtenerMesAnio, obtenerFechaHoy, obtenerNombreMes } from "../utils/formatters";
import { toaster } from "../lib/toast";

export function BalancePage() {
  const { household, loading: householdLoading } = useHousehold();
  const householdId = household?.id || null;
  const { filtrarGastos, mesesDisponibles: mesesGastos, loading: gastosLoading } = useSupabaseGastos(householdId);
  const {
    ingresos,
    agregarIngreso,
    eliminarIngreso,
    actualizarIngreso,
    filtrarIngresos,
    mesesDisponibles: mesesIngresos,
    loading: ingresosLoading,
  } = useSupabaseIngresos(householdId);

  const isLoading = householdLoading || gastosLoading || ingresosLoading;

  // Mes actual como default
  const mesActual = obtenerMesAnio(obtenerFechaHoy());
  const [mesSeleccionado, setMesSeleccionado] = useState(mesActual);

  // Combinar meses disponibles de gastos e ingresos
  const mesesDisponibles = useMemo(() => {
    const allMeses = new Set([...mesesGastos, ...mesesIngresos]);
    // Asegurar que el mes actual siempre esté disponible
    allMeses.add(mesActual);
    return Array.from(allMeses).sort((a, b) => b.localeCompare(a));
  }, [mesesGastos, mesesIngresos, mesActual]);

  // Calcular totales del mes
  const ingresosMes = useMemo(() => {
    return mesSeleccionado ? filtrarIngresos({ mes: mesSeleccionado }) : ingresos;
  }, [mesSeleccionado, filtrarIngresos, ingresos]);

  const gastosMes = useMemo(() => {
    return mesSeleccionado ? filtrarGastos({ mes: mesSeleccionado }) : [];
  }, [mesSeleccionado, filtrarGastos]);

  const totalIngresos = useMemo(() => {
    return ingresosMes.reduce((sum, i) => sum + i.importe, 0);
  }, [ingresosMes]);

  const totalGastos = useMemo(() => {
    return gastosMes.reduce((sum, g) => sum + g.importe, 0);
  }, [gastosMes]);

  const balance = totalIngresos - totalGastos;

  const handleAgregarIngreso = async (data: IngresoFormData) => {
    await agregarIngreso(data);
  };

  const handleEliminarIngreso = async (id: string) => {
    const success = await eliminarIngreso(id);
    if (success) {
      toaster.create({
        title: "Ingreso eliminado",
        description: "El ingreso se ha eliminado correctamente",
        type: "success",
      });
    } else {
      toaster.create({
        title: "Error",
        description: "No se pudo eliminar el ingreso",
        type: "error",
      });
    }
  };

  const handleEditarIngreso = async (id: string, data: IngresoFormData) => {
    const success = await actualizarIngreso(id, data);
    if (!success) {
      toaster.create({
        title: "Error",
        description: "No se pudo actualizar el ingreso",
        type: "error",
      });
    }
  };

  if (isLoading) {
    return (
      <Stack direction="column" align="center" justify="center" py={12} gap={4}>
        <Spinner size="xl" color="primary.500" borderWidth="3px" />
        <Text color="gray.600">Cargando balance...</Text>
      </Stack>
    );
  }

  return (
    <Stack direction="column" gap={4} pb={24}>
      {/* Selector de Mes */}
      <SelectorMes
        mesesDisponibles={mesesDisponibles}
        mesSeleccionado={mesSeleccionado}
        onChange={setMesSeleccionado}
      />

      {/* Resumen de Balance */}
      <Box
        bg="white"
        p={6}
        borderRadius="2xl"
        boxShadow="sm"
      >
        <Stack direction="column" gap={4}>
          <Heading size="md" color="gray.700">Balance del Mes</Heading>

          {totalIngresos === 0 && totalGastos === 0 ? (
            <Box textAlign="center" py={4}>
              <Text fontSize="lg" color="gray.500">
                En {obtenerNombreMes(mesSeleccionado)} aún no tienes movimientos
              </Text>
              <Text fontSize="sm" color="gray.400" mt={2}>
                Agrega ingresos o gastos para ver el balance
              </Text>
            </Box>
          ) : (
            <>
              {/* Ingresos */}
              <Stack direction="row" justify="space-between" align="center">
                <Stack direction="row" align="center" gap={2}>
                  <Text fontSize="lg">💰</Text>
                  <Text fontSize="lg" fontWeight="medium" color="gray.600">
                    Ingresos
                  </Text>
                </Stack>
                <Text fontSize="xl" fontWeight="bold" color="green.600">
                  + {formatearMoneda(totalIngresos)}
                </Text>
              </Stack>

              {/* Gastos */}
              <Stack direction="row" justify="space-between" align="center">
                <Stack direction="row" align="center" gap={2}>
                  <Text fontSize="lg">💸</Text>
                  <Text fontSize="lg" fontWeight="medium" color="gray.600">
                    Gastos
                  </Text>
                </Stack>
                <Text fontSize="xl" fontWeight="bold" color="red.600">
                  - {formatearMoneda(totalGastos)}
                </Text>
              </Stack>

              {/* Divisor */}
              <Box borderTop="2px dashed" borderColor="gray.200" my={2} />

              {/* Balance */}
              <Stack direction="row" justify="space-between" align="center">
                <Stack direction="row" align="center" gap={2}>
                  <Text fontSize="lg">📊</Text>
                  <Text fontSize="xl" fontWeight="bold" color="gray.700">
                    Balance
                  </Text>
                </Stack>
                <Text
                  fontSize="2xl"
                  fontWeight="bold"
                  color={balance >= 0 ? "green.600" : "red.600"}
                >
                  {balance >= 0 ? "" : "-"} {formatearMoneda(Math.abs(balance))}
                </Text>
              </Stack>
            </>
          )}
        </Stack>
      </Box>

      {/* Formulario de Ingreso */}
      <Box>
        <Heading size="md" color="gray.700" mb={3}>
          Agregar Ingreso
        </Heading>
        <FormularioIngreso onSubmit={handleAgregarIngreso} />
      </Box>

      {/* Lista de Ingresos */}
      <Box>
        <Heading size="md" color="gray.700" mb={3}>
          Ingresos del Mes ({ingresosMes.length})
        </Heading>
        <ListaIngresos
          ingresos={ingresosMes}
          onEliminar={handleEliminarIngreso}
          onEditar={handleEditarIngreso}
        />
      </Box>
    </Stack>
  );
}
