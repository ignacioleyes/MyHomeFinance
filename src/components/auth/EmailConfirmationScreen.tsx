import { Box, Button, Heading, Stack, Text } from "@chakra-ui/react";

interface EmailConfirmationScreenProps {
  email: string;
  onBackToLogin: () => void;
}

export function EmailConfirmationScreen({ email, onBackToLogin }: EmailConfirmationScreenProps) {
  return (
    <Box
      bg="white"
      p={{ base: 6, md: 8 }}
      borderRadius="2xl"
      boxShadow="md"
      maxW="400px"
      w="full"
      textAlign="center"
    >
      <Stack direction="column" gap={6} align="center">
        {/* Icon */}
        <Box
          w={16}
          h={16}
          borderRadius="full"
          bg="teal.50"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Text fontSize="3xl">📧</Text>
        </Box>

        {/* Title */}
        <Heading as="h2" size="lg" color="gray.800">
          Revisa tu correo
        </Heading>

        {/* Message */}
        <Stack direction="column" gap={2}>
          <Text color="gray.600">
            Enviamos un enlace de confirmación a:
          </Text>
          <Text fontWeight="semibold" color="teal.600">
            {email}
          </Text>
          <Text fontSize="sm" color="gray.500" mt={2}>
            Haz clic en el enlace del correo para activar tu cuenta.
            Si no lo ves, revisa tu carpeta de spam.
          </Text>
        </Stack>

        {/* Back to Login */}
        <Button
          variant="outline"
          colorPalette="teal"
          size="lg"
          w="full"
          onClick={onBackToLogin}
        >
          Volver a Iniciar Sesión
        </Button>
      </Stack>
    </Box>
  );
}
