import { Box, NativeSelectField, NativeSelectRoot, Text, Stack } from "@chakra-ui/react";
import { obtenerNombreMes } from "../../utils/formatters";

interface SelectorMesProps {
  mesesDisponibles: string[];
  mesSeleccionado: string;
  onChange: (mes: string) => void;
}

export function SelectorMes({
  mesesDisponibles,
  mesSeleccionado,
  onChange,
}: SelectorMesProps) {
  return (
    <Box
      bg="white"
      p={4}
      borderRadius="2xl"
      boxShadow="sm"
    >
      <Stack direction="row" align="center" gap={3}>
        <Text fontSize="lg">📅</Text>
        <NativeSelectRoot size="lg" flex={1}>
          <NativeSelectField
            value={mesSeleccionado}
            onChange={(e) => onChange(e.target.value)}
            bg="white"
            borderColor="gray.200"
            borderRadius="xl"
            fontWeight="medium"
            _focus={{ borderColor: "primary.500", boxShadow: "0 0 0 1px var(--chakra-colors-primary-500)" }}
          >
            <option value="">Todos los meses</option>
            {mesesDisponibles.map((mes) => (
              <option key={mes} value={mes}>
                {obtenerNombreMes(mes)}
              </option>
            ))}
          </NativeSelectField>
        </NativeSelectRoot>
      </Stack>
    </Box>
  );
}
