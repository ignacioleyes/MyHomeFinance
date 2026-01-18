import {
  Box,
  Stack,
  Text,
  Separator,
} from "@chakra-ui/react";
import { ResumenMensual as ResumenMensualType, Categoria } from "../../types/gasto.types";
import { formatearMoneda, obtenerNombreMes } from "../../utils/formatters";
import { getCategoryColors } from "../../theme/categoryColors";

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
      borderRadius="2xl"
      boxShadow="sm"
    >
      <Stack direction="column" gap={4} align="stretch">
        {/* Balance mensual */}
        <Box textAlign="center" py={4}>
          <Text fontSize="sm" color="gray.500" fontWeight="medium">
            Balance {resumen.mes ? obtenerNombreMes(resumen.mes) : "General"}
          </Text>
          <Text fontSize="4xl" fontWeight="bold" color="gray.800">
            {formatearMoneda(resumen.total)}
          </Text>
          <Text fontSize="sm" color="gray.500">
            {resumen.cantidad} {resumen.cantidad === 1 ? "gasto" : "gastos"}
          </Text>
        </Box>

        {categoriasConGastos.length > 0 && (
          <>
            <Separator />

            {/* Desglose por categoría - cards con colores */}
            <Stack direction="column" gap={3}>
              {categoriasConGastos.map(([categoria, total]) => {
                const colors = getCategoryColors(categoria as Categoria);
                const percentage = resumen.total > 0
                  ? Math.round((total / resumen.total) * 100)
                  : 0;

                return (
                  <Box
                    key={categoria}
                    bg={colors.bg}
                    p={4}
                    borderRadius="xl"
                    borderLeft="4px solid"
                    borderLeftColor={colors.border}
                  >
                    <Stack direction="row" justify="space-between" align="center">
                      <Stack direction="row" align="center" gap={3}>
                        <Box
                          w={10}
                          h={10}
                          borderRadius="full"
                          bg={colors.border}
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Text color="white" fontSize="lg">
                            {getCategoryIcon(categoria as Categoria)}
                          </Text>
                        </Box>
                        <Stack direction="column" gap={0}>
                          <Text fontSize="sm" fontWeight="medium" color={colors.text}>
                            {categoria}
                          </Text>
                          <Text fontSize="lg" fontWeight="bold" color={colors.text}>
                            {formatearMoneda(total)}
                          </Text>
                        </Stack>
                      </Stack>
                      <Stack direction="row" align="center" gap={2}>
                        <Text fontSize="sm" color={colors.text} fontWeight="medium">
                          {percentage}%
                        </Text>
                        <Text color={colors.border} fontSize="xl">→</Text>
                      </Stack>
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          </>
        )}
      </Stack>
    </Box>
  );
}

// Helper function to get an icon for each category
function getCategoryIcon(categoria: Categoria): string {
  const icons: Record<Categoria, string> = {
    "Combustible": "⛽",
    "Cuota Colegios": "🎓",
    "Deportes": "⚽",
    "Supermercado": "🛒",
    "Panadería": "🥖",
    "Verdulería": "🥬",
    "Carnicería": "🥩",
    "Pollería": "🍗",
    "Restaurantes": "🍽️",
    "Ropa": "👕",
    "Cafecito": "☕",
    "Tarjetas de Crédito": "💳",
    "Préstamos": "🏦",
    "Mascotas": "🐾",
    "Servicios": "📱",
    "Farmacia": "💊",
    "Entretenimiento": "🎬",
    "Kiosco": "✨",
    "Alquiler": "🏠",
    "Otros": "📦",
  };
  return icons[categoria] || "📦";
}
