import { useState } from "react";
import {
  Box,
  Button,
  Input,
  Text,
  Stack,
  createToaster,
} from "@chakra-ui/react";
import { useAuth } from "../../contexts/AuthContext";
import { RegisterFormData } from "../../types/auth.types";
import { validarRegisterForm } from "../../utils/auth-validators";

const toaster = createToaster({
  placement: "top",
  duration: 3000,
});

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const { signUp } = useAuth();
  const [formData, setFormData] = useState<RegisterFormData>({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof RegisterFormData, value: string) => {
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

    const validation = validarRegisterForm(formData);

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
      await signUp(formData.email, formData.password);
      toaster.create({
        title: "Registro exitoso",
        description: "Por favor verifica tu email para activar tu cuenta",
        type: "success",
      });
      onSuccess?.();
    } catch (error: any) {
      console.error("Register error:", error);
      toaster.create({
        title: "Error al registrarse",
        description: error.message || "No se pudo crear la cuenta",
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
      maxW="400px"
      w="full"
    >
      <Stack direction="column" gap={4} align="stretch">
        <Text fontSize="2xl" fontWeight="bold" color="primary.600" textAlign="center">
          Crear Cuenta
        </Text>

        {/* Email */}
        <Stack gap={1.5}>
          <Text fontWeight="medium" fontSize="sm">
            Email <Text as="span" color="red.500">*</Text>
          </Text>
          <Input
            type="email"
            name="email"
            autoComplete="username"
            placeholder="tu@email.com"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            size="lg"
            borderColor={errors.email ? "red.500" : undefined}
          />
          {errors.email && (
            <Text color="red.500" fontSize="sm">{errors.email}</Text>
          )}
        </Stack>

        {/* Password */}
        <Stack gap={1.5}>
          <Text fontWeight="medium" fontSize="sm">
            Contraseña <Text as="span" color="red.500">*</Text>
          </Text>
          <Input
            type="password"
            name="password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => handleChange("password", e.target.value)}
            size="lg"
            borderColor={errors.password ? "red.500" : undefined}
          />
          {errors.password && (
            <Text color="red.500" fontSize="sm">{errors.password}</Text>
          )}
        </Stack>

        {/* Confirm Password */}
        <Stack gap={1.5}>
          <Text fontWeight="medium" fontSize="sm">
            Confirmar Contraseña <Text as="span" color="red.500">*</Text>
          </Text>
          <Input
            type="password"
            name="confirm-password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={(e) => handleChange("confirmPassword", e.target.value)}
            size="lg"
            borderColor={errors.confirmPassword ? "red.500" : undefined}
          />
          {errors.confirmPassword && (
            <Text color="red.500" fontSize="sm">{errors.confirmPassword}</Text>
          )}
        </Stack>

        {/* Submit Button */}
        <Button
          type="submit"
          colorPalette="primary"
          size="lg"
          w="full"
          loading={isSubmitting}
        >
          Registrarse
        </Button>

        {/* Switch to Login */}
        {onSwitchToLogin && (
          <Stack direction="row" justify="center" align="center" gap={1}>
            <Text fontSize="sm" color="gray.600">
              ¿Ya tienes cuenta?
            </Text>
            <Button
              variant="plain"
              size="sm"
              colorPalette="primary"
              onClick={onSwitchToLogin}
            >
              Inicia sesión
            </Button>
          </Stack>
        )}
      </Stack>
    </Box>
  );
}
