import {
  Box,
  Stack,
  Text,
  SimpleGrid,
  Separator,
} from "@chakra-ui/react";
import { ResumenMensual as ResumenMensualType } from "../../types/gasto.types";
import { formatearMoneda, obtenerNombreMes } from "../../utils/formatters";

interface ResumenMensualProps {
  resumen: ResumenMensualType;
}

export function ResumenMensual({ resumen }: ResumenMensualProps) {
  const categoriasConGastos = Object.entries(resumen.porCategoria)
    .filter(([, total]) => total > 0)
    .sort(([, a], [, b]) => b - a);

  return (
    <Box
      bg="white"
      p={{ base: 4, md: 6 }}
      borderRadius="lg"
      boxShadow="lg"
      borderTop="4px solid"
      borderTopColor="primary.500"
    >
      <Stack direction="column" gap={4} align="stretch">
        {/* Total del mes */}
        <Box>
          <Text fontSize="lg" color="gray.600">
            Total {resumen.mes ? obtenerNombreMes(resumen.mes) : "General"}
          </Text>
          <Text fontSize="4xl" fontWeight="bold" color="primary.600">
            {formatearMoneda(resumen.total)}
          </Text>
          <Text fontSize="md" color="gray.500" mt={1}>
            {resumen.cantidad} {resumen.cantidad === 1 ? "gasto" : "gastos"} registrados
          </Text>
        </Box>

        {categoriasConGastos.length > 0 && (
          <>
            <Separator />

            {/* Desglose por categoría */}
            <Box>
              <Text fontSize="md" fontWeight="semibold" mb={3} color="gray.700">
                Por categoría:
              </Text>
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
                {categoriasConGastos.map(([categoria, total]) => (
                  <Stack
                    direction="row"
                    key={categoria}
                    justify="space-between"
                    p={2}
                    bg="gray.50"
                    borderRadius="md"
                  >
                    <Text fontSize="sm" color="gray.700">
                      {categoria}
                    </Text>
                    <Text fontSize="sm" fontWeight="semibold" color="primary.600">
                      {formatearMoneda(total)}
                    </Text>
                  </Stack>
                ))}
              </SimpleGrid>
            </Box>
          </>
        )}
      </Stack>
    </Box>
  );
}
