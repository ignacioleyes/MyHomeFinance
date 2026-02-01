import { Stack, Text, Box } from "@chakra-ui/react";
import { Ingreso, IngresoFormData } from "../../types/ingreso.types";
import { TarjetaIngreso } from "./TarjetaIngreso";

interface ListaIngresosProps {
  ingresos: Ingreso[];
  onEliminar: (id: string) => void;
  onEditar: (id: string, data: IngresoFormData) => Promise<void>;
}

export function ListaIngresos({ ingresos, onEliminar, onEditar }: ListaIngresosProps) {
  if (ingresos.length === 0) {
    return (
      <Box
        bg="white"
        p={8}
        borderRadius="lg"
        textAlign="center"
        boxShadow="sm"
      >
        <Text fontSize="lg" color="gray.500">
          No hay ingresos registrados en este período
        </Text>
        <Text fontSize="sm" color="gray.400" mt={2}>
          Agregue su primer ingreso usando el formulario de arriba
        </Text>
      </Box>
    );
  }

  return (
    <Stack direction="column" gap={3} align="stretch">
      {ingresos.map((ingreso) => (
        <TarjetaIngreso
          key={ingreso.id}
          ingreso={ingreso}
          onEliminar={onEliminar}
          onEditar={onEditar}
        />
      ))}
    </Stack>
  );
}
