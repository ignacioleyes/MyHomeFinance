import { useState } from "react";
import {
  Box,
  Stack,
  Text,
  IconButton,
  Badge,
} from "@chakra-ui/react";
import {
  DialogActionTrigger,
  DialogBackdrop,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";
import { Ingreso, IngresoFormData } from "../../types/ingreso.types";
import { formatearMoneda, formatearFecha } from "../../utils/formatters";
import { FormularioIngreso } from "../forms/FormularioIngreso";
import { getIncomeCategoryColors } from "../../theme/categoryColors";

interface TarjetaIngresoProps {
  ingreso: Ingreso;
  onEliminar: (id: string) => void;
  onEditar: (id: string, data: IngresoFormData) => Promise<void>;
}

export function TarjetaIngreso({ ingreso, onEliminar, onEditar }: TarjetaIngresoProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const categoryColors = getIncomeCategoryColors(ingreso.categoria);

  const handleEditar = async (data: IngresoFormData) => {
    await onEditar(ingreso.id, data);
    setIsEditOpen(false);
  };

  return (
    <Box
      bg={categoryColors.bg}
      p={4}
      borderRadius="xl"
      boxShadow="sm"
      borderLeft="4px solid"
      borderLeftColor={categoryColors.border}
      _hover={{ boxShadow: "md" }}
      transition="box-shadow 0.2s"
    >
      <Stack direction="row" justify="space-between" align="start">
        <Stack direction="column" align="start" gap={1} flex={1}>
          <Stack direction="row" align="center" gap={2}>
            <Text fontSize="2xl" fontWeight="bold" color={categoryColors.text}>
              {formatearMoneda(ingreso.importe)}
            </Text>
            <Badge
              bg={categoryColors.border}
              color="white"
              size="sm"
              borderRadius="full"
              px={2}
            >
              {ingreso.categoria}
            </Badge>
          </Stack>

          <Text fontSize="sm" color="gray.600">
            {formatearFecha(ingreso.fecha)}
          </Text>

          {ingreso.descripcion && (
            <Text fontSize="sm" color="gray.700" mt={2}>
              {ingreso.descripcion}
            </Text>
          )}
        </Stack>

        <Stack direction="row" gap={1}>
          {/* Botón Editar */}
          <DialogRoot
            placement="center"
            size="md"
            open={isEditOpen}
            onOpenChange={(e) => setIsEditOpen(e.open)}
          >
            <DialogBackdrop bg="blackAlpha.600" />
            <DialogTrigger asChild>
              <IconButton
                aria-label="Editar ingreso"
                variant="ghost"
                colorPalette="blue"
                size="sm"
              >
                ✏️
              </IconButton>
            </DialogTrigger>

            <DialogContent
              position="fixed"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              maxW="500px"
              w="90%"
              m={0}
            >
              <DialogHeader>
                <DialogTitle>Editar Ingreso</DialogTitle>
                <DialogCloseTrigger />
              </DialogHeader>
              <DialogBody pb={4}>
                <FormularioIngreso
                  onSubmit={handleEditar}
                  onCancel={() => setIsEditOpen(false)}
                  initialData={{
                    importe: ingreso.importe.toString(),
                    categoria: ingreso.categoria,
                    descripcion: ingreso.descripcion || "",
                    fecha: ingreso.fecha,
                  }}
                  submitLabel="Guardar Cambios"
                />
              </DialogBody>
            </DialogContent>
          </DialogRoot>

          {/* Botón Eliminar */}
          <DialogRoot placement="center" size="sm">
            <DialogBackdrop bg="blackAlpha.600" />
            <DialogTrigger asChild>
              <IconButton
                aria-label="Eliminar ingreso"
                variant="ghost"
                colorPalette="red"
                size="sm"
              >
                🗑️
              </IconButton>
            </DialogTrigger>

            <DialogContent
              position="fixed"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              maxW="400px"
              w="90%"
              m={0}
            >
              <DialogHeader>
                <DialogTitle>Eliminar Ingreso</DialogTitle>
                <DialogCloseTrigger />
              </DialogHeader>
              <DialogBody pb={4}>
                <Text>
                  ¿Está seguro de eliminar este ingreso de {formatearMoneda(ingreso.importe)}?
                  Esta acción no se puede deshacer.
                </Text>
              </DialogBody>
              <DialogFooter gap={2}>
                <DialogActionTrigger asChild>
                  <Button variant="outline" flex={1}>Cancelar</Button>
                </DialogActionTrigger>
                <Button
                  colorPalette="red"
                  onClick={() => onEliminar(ingreso.id)}
                  flex={1}
                >
                  Eliminar
                </Button>
              </DialogFooter>
            </DialogContent>
          </DialogRoot>
        </Stack>
      </Stack>
    </Box>
  );
}
