import { Stack, Text, Box } from "@chakra-ui/react";
import { Gasto, GastoFormData } from "../../types/gasto.types";
import { TarjetaGasto } from "./TarjetaGasto";

interface ListaGastosProps {
  gastos: Gasto[];
  onEliminar: (id: string) => void;
  onEditar: (id: string, data: GastoFormData) => Promise<void>;
}

export function ListaGastos({ gastos, onEliminar, onEditar }: ListaGastosProps) {
  if (gastos.length === 0) {
    return (
      <Box
        bg="white"
        p={8}
        borderRadius="lg"
        textAlign="center"
        boxShadow="sm"
      >
        <Text fontSize="lg" color="gray.500">
          No hay gastos registrados en este período
        </Text>
        <Text fontSize="sm" color="gray.400" mt={2}>
          Agregue su primer gasto usando el formulario de arriba
        </Text>
      </Box>
    );
  }

  return (
    <Stack direction="column" gap={3} align="stretch">
      {gastos.map((gasto) => (
        <TarjetaGasto
          key={gasto.id}
          gasto={gasto}
          onEliminar={onEliminar}
          onEditar={onEditar}
        />
      ))}
    </Stack>
  );
}
