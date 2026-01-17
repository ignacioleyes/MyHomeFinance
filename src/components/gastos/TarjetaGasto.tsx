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
import { Gasto, GastoFormData } from "../../types/gasto.types";
import { formatearMoneda, formatearFecha } from "../../utils/formatters";
import { FormularioGasto } from "../forms/FormularioGasto";

interface TarjetaGastoProps {
  gasto: Gasto;
  onEliminar: (id: string) => void;
  onEditar: (id: string, data: GastoFormData) => Promise<void>;
}

export function TarjetaGasto({ gasto, onEliminar, onEditar }: TarjetaGastoProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleEditar = async (data: GastoFormData) => {
    await onEditar(gasto.id, data);
    setIsEditOpen(false);
  };

  return (
    <Box
      bg="white"
      p={4}
      borderRadius="md"
      boxShadow="sm"
      borderLeft="4px solid"
      borderLeftColor="primary.500"
      _hover={{ boxShadow: "md" }}
      transition="box-shadow 0.2s"
    >
      <Stack direction="row" justify="space-between" align="start">
        <Stack direction="column" align="start" gap={1} flex={1}>
          <Stack direction="row">
            <Text fontSize="2xl" fontWeight="bold" color="primary.600">
              {formatearMoneda(gasto.importe)}
            </Text>
            <Badge colorPalette="orange" size="sm">
              {gasto.categoria}
            </Badge>
          </Stack>

          <Text fontSize="sm" color="gray.600">
            {formatearFecha(gasto.fecha)}
          </Text>

          {gasto.descripcion && (
            <Text fontSize="sm" color="gray.700" mt={2}>
              {gasto.descripcion}
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
            <DialogBackdrop
              bg="blackAlpha.600"
              backdropFilter="blur(4px)"
            />
            <DialogTrigger asChild>
              <IconButton
                aria-label="Editar gasto"
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
                <DialogTitle>Editar Gasto</DialogTitle>
                <DialogCloseTrigger />
              </DialogHeader>
              <DialogBody pb={4}>
                <FormularioGasto
                  onSubmit={handleEditar}
                  onCancel={() => setIsEditOpen(false)}
                  initialData={{
                    importe: gasto.importe.toString(),
                    categoria: gasto.categoria,
                    descripcion: gasto.descripcion || "",
                    fecha: gasto.fecha,
                  }}
                  submitLabel="Guardar Cambios"
                />
              </DialogBody>
            </DialogContent>
          </DialogRoot>

          {/* Botón Eliminar */}
          <DialogRoot placement="center" size="sm">
            <DialogBackdrop
              bg="blackAlpha.600"
              backdropFilter="blur(4px)"
            />
            <DialogTrigger asChild>
              <IconButton
                aria-label="Eliminar gasto"
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
                <DialogTitle>Eliminar Gasto</DialogTitle>
                <DialogCloseTrigger />
              </DialogHeader>
              <DialogBody pb={4}>
                <Text>
                  ¿Está seguro de eliminar este gasto de {formatearMoneda(gasto.importe)}?
                  Esta acción no se puede deshacer.
                </Text>
              </DialogBody>
              <DialogFooter gap={2}>
                <DialogActionTrigger asChild>
                  <Button variant="outline" flex={1}>Cancelar</Button>
                </DialogActionTrigger>
                <Button
                  colorPalette="red"
                  onClick={() => onEliminar(gasto.id)}
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
