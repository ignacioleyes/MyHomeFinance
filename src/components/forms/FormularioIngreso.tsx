import { useState } from "react";
import {
  Box,
  Button,
  Input,
  Textarea,
  Text,
  Stack,
} from "@chakra-ui/react";
import {
  NativeSelectField,
  NativeSelectRoot,
} from "@chakra-ui/react";
import { IngresoFormData } from "../../types/ingreso.types";
import { CATEGORIAS_INGRESO } from "../../utils/constants";
import { validarFormularioIngreso } from "../../utils/validators";
import { toaster } from "../../lib/toast";
import {
  obtenerFechaHoy,
  formatearImporteArgentino,
  parsearImporteArgentino,
} from "../../utils/formatters";

interface FormularioIngresoProps {
  onSubmit: (data: IngresoFormData) => Promise<void> | void;
  onCancel?: () => void;
  initialData?: Partial<IngresoFormData>;
  submitLabel?: string;
}

export function FormularioIngreso({
  onSubmit,
  onCancel,
  initialData,
  submitLabel = "Guardar Ingreso",
}: FormularioIngresoProps) {
  // Convertir importe inicial a formato argentino si existe
  const importeInicialFormateado = initialData?.importe
    ? formatearImporteArgentino(String(initialData.importe).replace(".", ","))
    : "";

  const [formData, setFormData] = useState<IngresoFormData>({
    importe: initialData?.importe || "",
    categoria: initialData?.categoria || "",
    descripcion: initialData?.descripcion || "",
    fecha: initialData?.fecha || obtenerFechaHoy(),
  });

  const [importeDisplay, setImporteDisplay] = useState(importeInicialFormateado);
  const [errors, setErrors] = useState<Partial<Record<keyof IngresoFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    field: keyof IngresoFormData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleImporteChange = (value: string) => {
    const formateado = formatearImporteArgentino(value);
    setImporteDisplay(formateado);
    // Guardar el valor parseado para el submit
    const valorNumerico = parsearImporteArgentino(formateado);
    handleChange("importe", valorNumerico);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validarFormularioIngreso(formData);

    if (!validation.isValid) {
      setErrors(validation.errors);
      toaster.create({
        title: "Error en el formulario",
        description: "Por favor corrija los errores antes de continuar",
        type: "error",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);

      setFormData({
        importe: "",
        categoria: "",
        descripcion: "",
        fecha: obtenerFechaHoy(),
      });
      setImporteDisplay("");

      toaster.create({
        title: "Ingreso guardado",
        description: "El ingreso se ha registrado correctamente",
        type: "success",
      });
    } catch (error) {
      toaster.create({
        title: "Error",
        description: "No se pudo guardar el ingreso",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      as="form"
      onSubmit={handleSubmit}
      bg="white"
      p={{ base: 4, md: 6 }}
      borderRadius="2xl"
      boxShadow="sm"
    >
      <Stack direction="column" gap={4} align="stretch">
        {/* Campo Importe */}
        <Stack gap={1.5}>
          <Text fontWeight="medium" fontSize="sm">
            Importe <Text as="span" color="red.500">*</Text>
          </Text>
          <Input
            type="text"
            inputMode="decimal"
            placeholder="0,00"
            value={importeDisplay}
            onChange={(e) => handleImporteChange(e.target.value)}
            size="lg"
            borderColor={errors.importe ? "red.500" : undefined}
          />
          {errors.importe && (
            <Text color="red.500" fontSize="sm">{errors.importe}</Text>
          )}
        </Stack>

        {/* Campo Categoría */}
        <Stack gap={1.5}>
          <Text fontWeight="medium" fontSize="sm">
            Categoría <Text as="span" color="red.500">*</Text>
          </Text>
          <NativeSelectRoot size="lg">
            <NativeSelectField
              value={formData.categoria}
              onChange={(e) => handleChange("categoria", e.target.value)}
              borderColor={errors.categoria ? "red.500" : undefined}
            >
              <option value="">Seleccione una categoría</option>
              {CATEGORIAS_INGRESO.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </NativeSelectField>
          </NativeSelectRoot>
          {errors.categoria && (
            <Text color="red.500" fontSize="sm">{errors.categoria}</Text>
          )}
        </Stack>

        {/* Campo Fecha */}
        <Stack gap={1.5}>
          <Text fontWeight="medium" fontSize="sm">
            Fecha <Text as="span" color="red.500">*</Text>
          </Text>
          <Input
            type="date"
            value={formData.fecha}
            onChange={(e) => handleChange("fecha", e.target.value)}
            max={obtenerFechaHoy()}
            size="lg"
            borderColor={errors.fecha ? "red.500" : undefined}
          />
          {errors.fecha && (
            <Text color="red.500" fontSize="sm">{errors.fecha}</Text>
          )}
        </Stack>

        {/* Campo Descripción */}
        <Stack gap={1.5}>
          <Text fontWeight="medium" fontSize="sm">
            Descripción (opcional)
          </Text>
          <Textarea
            placeholder="Detalles adicionales del ingreso..."
            value={formData.descripcion}
            onChange={(e) => handleChange("descripcion", e.target.value)}
            maxLength={500}
            rows={3}
            borderColor={errors.descripcion ? "red.500" : undefined}
          />
          {errors.descripcion && (
            <Text color="red.500" fontSize="sm">{errors.descripcion}</Text>
          )}
        </Stack>

        {/* Botones */}
        <Stack direction="column" gap={2} w="full">
          <Button
            type="submit"
            colorPalette="green"
            size="lg"
            w="full"
            loading={isSubmitting}
          >
            {submitLabel}
          </Button>
          {onCancel && (
            <Button
              variant="ghost"
              size="lg"
              w="full"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
          )}
        </Stack>
      </Stack>
    </Box>
  );
}
