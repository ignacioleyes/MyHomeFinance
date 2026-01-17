import { useState } from "react";
import { Box, Heading, Stack, Separator, Button, Spinner, Text, IconButton } from "@chakra-ui/react";
import { useAuth } from "./contexts/AuthContext";
import { useHousehold } from "./hooks/useHousehold";
import { useSupabaseGastos } from "./hooks/useSupabaseGastos";
import { usePWAInstall } from "./hooks/usePWAInstall";
import {
  Layout,
  FormularioGasto,
  ListaGastos,
  ResumenMensual,
  SelectorMes,
} from "./components";
import { AuthPage } from "./components/auth/AuthPage";
import { HouseholdMembers } from "./components/household/HouseholdMembers";
import { ShareQR } from "./components/ui/ShareQR";
import { GastoFormData } from "./types/gasto.types";

function App() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { household, loading: householdLoading } = useHousehold();
  const { canInstall, install } = usePWAInstall();
  const {
    gastos,
    agregarGasto,
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

  const handleAgregarGasto = async (formData: GastoFormData) => {
    try {
      await agregarGasto(formData);
    } catch (error) {
      console.error("Error adding expense:", error);
    }
  };

  const handleEliminarGasto = async (id: string) => {
    try {
      await eliminarGasto(id);
    } catch (error) {
      console.error("Error deleting expense:", error);
    }
  };

  const handleEditarGasto = async (id: string, formData: GastoFormData) => {
    try {
      await actualizarGasto(id, formData);
    } catch (error) {
      console.error("Error updating expense:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Show loading state while checking auth or loading household
  if (authLoading || (user && householdLoading)) {
    return (
      <Box
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="gray.50"
      >
        <Stack direction="column" align="center" gap={4}>
          <Spinner size="xl" color="primary.500" />
          <Text color="gray.600">Cargando...</Text>
        </Stack>
      </Box>
    );
  }

  // Show auth page if not logged in
  if (!user) {
    return <AuthPage />;
  }

  // Show main app if logged in
  return (
    <Layout title="MyHomeFinance">
      <Stack direction="column" gap={{ base: 6, md: 8 }} align="stretch">
        {/* User info and logout */}
        <Box>
          <Stack direction="row" justify="space-between" align="center">
            <Text fontSize="sm" color="gray.600">
              {user.email}
            </Text>
            <Stack direction="row" gap={1} align="center">
              {canInstall && (
                <IconButton
                  aria-label="Instalar App"
                  variant="ghost"
                  size="sm"
                  onClick={install}
                  title="Instalar App"
                >
                  <Text>📥</Text>
                </IconButton>
              )}
              <ShareQR />
              <IconButton
                aria-label="Cerrar Sesión"
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                title="Cerrar Sesión"
              >
                <Text>🚪</Text>
              </IconButton>
            </Stack>
          </Stack>
        </Box>

        {/* Household Members */}
        {household && (
          <Box>
            <HouseholdMembers
              householdId={household.id}
              householdName={household.name}
            />
          </Box>
        )}

        <Separator />
        {/* Sección: Agregar Gasto */}
        <Box>
          <Heading
            as="h2"
            size="lg"
            mb={4}
            color="gray.700"
          >
            Registrar Nuevo Gasto
          </Heading>
          <FormularioGasto onSubmit={handleAgregarGasto} />
        </Box>

        <Separator />

        {/* Sección: Resumen y Filtros */}
        <Box>
          <Heading
            as="h2"
            size="lg"
            mb={4}
            color="gray.700"
          >
            Resumen
          </Heading>

          {/* Selector de Mes */}
          {mesesDisponibles.length > 0 && (
            <Box mb={4}>
              <SelectorMes
                mesesDisponibles={mesesDisponibles}
                mesSeleccionado={mesSeleccionado}
                onChange={setMesSeleccionado}
              />
            </Box>
          )}

          {/* Resumen Mensual */}
          <ResumenMensual resumen={resumen} />
        </Box>

        <Separator />

        {/* Sección: Lista de Gastos */}
        <Box>
          <Heading
            as="h2"
            size="lg"
            mb={4}
            color="gray.700"
          >
            {mesSeleccionado ? "Gastos del Mes" : "Todos los Gastos"}
          </Heading>
          <ListaGastos
            gastos={gastosFiltrados}
            onEliminar={handleEliminarGasto}
            onEditar={handleEditarGasto}
          />
        </Box>
      </Stack>
    </Layout>
  );
}

export default App;
