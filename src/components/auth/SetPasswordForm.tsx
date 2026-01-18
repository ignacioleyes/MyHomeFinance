import { useState } from "react";
import {
  Box,
  Button,
  Input,
  Text,
  Stack,
  Heading,
} from "@chakra-ui/react";
import { supabase } from "../../lib/supabase";
import { toaster } from "../../lib/toast";

interface SetPasswordFormProps {
  userEmail: string;
  onComplete: () => void;
}

export function SetPasswordForm({ userEmail, onComplete }: SetPasswordFormProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});

  const validate = () => {
    const newErrors: { password?: string; confirm?: string } = {};

    if (password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    if (password !== confirmPassword) {
      newErrors.confirm = "Las contraseñas no coinciden";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      toaster.create({
        title: "Contraseña configurada",
        description: "Ya puedes usar tu contraseña para iniciar sesión",
        type: "success",
      });

      onComplete();
    } catch (err: any) {
      console.error("Error setting password:", err);
      toaster.create({
        title: "Error",
        description: err.message || "No se pudo configurar la contraseña",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      bg="white"
      p={{ base: 6, md: 8 }}
      borderRadius="xl"
      boxShadow="lg"
      w="full"
      maxW="400px"
    >
      <form onSubmit={handleSubmit}>
        <Stack direction="column" gap={6}>
          <Stack direction="column" gap={2} textAlign="center">
            <Heading as="h1" size="xl" color="primary.600">
              ¡Bienvenido!
            </Heading>
            <Text color="gray.600">
              Configura tu contraseña para completar tu cuenta
            </Text>
            <Text fontSize="sm" color="gray.500">
              {userEmail}
            </Text>
          </Stack>

          <Stack direction="column" gap={4}>
            <Stack direction="column" gap={1.5}>
              <Text fontWeight="medium" fontSize="sm">
                Contraseña
              </Text>
              <Input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                size="lg"
                borderColor={errors.password ? "red.500" : undefined}
              />
              {errors.password && (
                <Text color="red.500" fontSize="sm">
                  {errors.password}
                </Text>
              )}
            </Stack>

            <Stack direction="column" gap={1.5}>
              <Text fontWeight="medium" fontSize="sm">
                Confirmar Contraseña
              </Text>
              <Input
                type="password"
                placeholder="Repite tu contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                size="lg"
                borderColor={errors.confirm ? "red.500" : undefined}
              />
              {errors.confirm && (
                <Text color="red.500" fontSize="sm">
                  {errors.confirm}
                </Text>
              )}
            </Stack>
          </Stack>

          <Button
            type="submit"
            colorPalette="primary"
            size="lg"
            w="full"
            loading={loading}
          >
            Configurar Contraseña
          </Button>
        </Stack>
      </form>
    </Box>
  );
}
