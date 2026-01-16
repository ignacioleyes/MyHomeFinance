import { useState } from "react";
import {
  Box,
  Button,
  Input,
  Textarea,
  Text,
  Stack,
  createToaster,
} from "@chakra-ui/react";
import {
  NativeSelectField,
  NativeSelectRoot,
} from "@chakra-ui/react";
import { GastoFormData } from "../../types/gasto.types";
import { CATEGORIAS } from "../../utils/constants";
import { validarFormularioGasto } from "../../utils/validators";

const toaster = createToaster({
  placement: "top",
  duration: 3000,
});

interface FormularioGastoProps {
  onSubmit: (data: GastoFormData) => Promise<void> | void;
  onCancel?: () => void;
  initialData?: Partial<GastoFormData>;
  submitLabel?: string;
}

export function FormularioGasto({
  onSubmit,
  onCancel,
  initialData,
  submitLabel = "Guardar Gasto",
}: FormularioGastoProps) {
  const [formData, setFormData] = useState<GastoFormData>({
    importe: initialData?.importe || "",
    categoria: initialData?.categoria || "",
    descripcion: initialData?.descripcion || "",
    fecha: initialData?.fecha || new Date().toISOString().split("T")[0],
  });

  const [errors, setErrors] = useState<Partial<Record<keyof GastoFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    field: keyof GastoFormData,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validarFormularioGasto(formData);

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
        fecha: new Date().toISOString().split("T")[0],
      });

      toaster.create({
        title: "Gasto guardado",
        description: "El gasto se ha registrado correctamente",
        type: "success",
      });
    } catch (error) {
      toaster.create({
        title: "Error",
        description: "No se pudo guardar el gasto",
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
      borderRadius="lg"
      boxShadow="md"
    >
      <Stack direction="column" gap={4} align="stretch">
        {/* Campo Importe */}
        <Stack gap={1.5}>
          <Text fontWeight="medium" fontSize="sm">
            Importe <Text as="span" color="red.500">*</Text>
          </Text>
          <Input
            type="number"
            step="0.01"
            placeholder="0.00"
            value={formData.importe}
            onChange={(e) => handleChange("importe", e.target.value)}
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
              {CATEGORIAS.map((cat) => (
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
            max={new Date().toISOString().split("T")[0]}
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
            placeholder="Detalles adicionales del gasto..."
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
            colorPalette="primary"
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
