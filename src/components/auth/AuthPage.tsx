import { useState } from "react";
import { Box, Stack, Button } from "@chakra-ui/react";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { EmailConfirmationScreen } from "./EmailConfirmationScreen";
import { usePWAInstall } from "../../hooks/usePWAInstall";

type AuthView = "login" | "register" | "checkEmail";

export function AuthPage() {
  const [view, setView] = useState<AuthView>("login");
  const [registeredEmail, setRegisteredEmail] = useState("");
  const { canInstall, install } = usePWAInstall();

  const handleRegistrationSuccess = (email: string) => {
    setRegisteredEmail(email);
    setView("checkEmail");
  };

  const handleBackToLogin = () => {
    setView("login");
    setRegisteredEmail("");
  };

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
        {canInstall && view !== "checkEmail" && (
          <Button
            size="sm"
            variant="outline"
            colorPalette="teal"
            onClick={install}
          >
            Instalar App
          </Button>
        )}

        {view === "login" && (
          <LoginForm onSwitchToRegister={() => setView("register")} />
        )}

        {view === "register" && (
          <RegisterForm
            onSuccess={handleRegistrationSuccess}
            onSwitchToLogin={() => setView("login")}
          />
        )}

        {view === "checkEmail" && (
          <EmailConfirmationScreen
            email={registeredEmail}
            onBackToLogin={handleBackToLogin}
          />
        )}
      </Stack>
    </Box>
  );
}
