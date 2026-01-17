import { useState } from "react";
import { Box, Stack, Button } from "@chakra-ui/react";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { usePWAInstall } from "../../hooks/usePWAInstall";

export function AuthPage() {
  const [showLogin, setShowLogin] = useState(true);
  const { canInstall, install } = usePWAInstall();

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="gray.50"
      p={4}
    >
      <Stack direction="column" align="center" gap={4} w="full">
        {canInstall && (
          <Button
            size="sm"
            variant="outline"
            colorPalette="primary"
            onClick={install}
          >
            Instalar App
          </Button>
        )}
        {showLogin ? (
          <LoginForm onSwitchToRegister={() => setShowLogin(false)} />
        ) : (
          <RegisterForm onSwitchToLogin={() => setShowLogin(true)} />
        )}
      </Stack>
    </Box>
  );
}
