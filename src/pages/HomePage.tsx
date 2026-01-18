import { Box, Heading, Stack, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useHousehold } from "../hooks/useHousehold";
import { useSupabaseGastos } from "../hooks/useSupabaseGastos";
import { HouseholdMembers } from "../components/household/HouseholdMembers";
import { FormularioGasto } from "../components";
import { GastoFormData } from "../types/gasto.types";
import { showSuccessToast, showErrorToast } from "../lib/toast";

export function HomePage() {
  const navigate = useNavigate();
  const { household } = useHousehold();
  const { agregarGasto, gastos } = useSupabaseGastos(household?.id || null);

  const handleAgregarGasto = async (formData: GastoFormData) => {
    try {
      await agregarGasto(formData);
      showSuccessToast("Gasto registrado", "El gasto se ha guardado correctamente");
    } catch (error: any) {
      console.error("Error adding expense:", error);
      showErrorToast("Error al guardar", error.message || "No se pudo registrar el gasto");
    }
  };

  const totalGastos = gastos.reduce((sum, g) => sum + g.importe, 0);

  return (
    <Stack direction="column" gap={6} pb={24}>
      {/* Household Members */}
      {household && (
        <HouseholdMembers
          householdId={household.id}
          householdName={household.name}
        />
      )}

      {/* Formulario de Gasto */}
      <Box>
        <Heading as="h2" size="lg" mb={4} color="gray.700">
          Registrar Nuevo Gasto
        </Heading>
        <FormularioGasto onSubmit={handleAgregarGasto} />
      </Box>

      {/* Card para ir a Resumen */}
      <Box
        bg="white"
        p={6}
        borderRadius="2xl"
        boxShadow="sm"
        cursor="pointer"
        onClick={() => navigate("/resumen")}
        _hover={{ boxShadow: "md", transform: "translateY(-2px)" }}
        transition="all 0.2s"
      >
        <Stack direction="row" justify="space-between" align="center">
          <Stack direction="column" gap={1}>
            <Text fontWeight="medium" color="gray.600">
              Resumen de Gastos
            </Text>
            <Heading as="h3" size="xl" color="primary.500">
              ${totalGastos.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
            </Heading>
            <Text fontSize="sm" color="gray.500">
              {gastos.length} {gastos.length === 1 ? "gasto" : "gastos"} registrados
            </Text>
          </Stack>
          <Text fontSize="2xl" color="primary.500">
            →
          </Text>
        </Stack>
      </Box>
    </Stack>
  );
}
