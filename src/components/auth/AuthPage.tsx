import { useState } from "react";
import { Box, Stack } from "@chakra-ui/react";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";

export function AuthPage() {
  const [showLogin, setShowLogin] = useState(true);

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
        {showLogin ? (
          <LoginForm onSwitchToRegister={() => setShowLogin(false)} />
        ) : (
          <RegisterForm onSwitchToLogin={() => setShowLogin(true)} />
        )}
      </Stack>
    </Box>
  );
}
