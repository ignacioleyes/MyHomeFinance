import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useHousehold } from "../hooks/useHousehold";
import { usePendingInvitation } from "../hooks/usePendingInvitation";
import { HomePage, ResumenPage } from "../pages";
import { AuthPage } from "../components/auth/AuthPage";
import { SetPasswordForm } from "../components/auth/SetPasswordForm";
import { Layout } from "../components/ui/Layout";
import { LoadingScreen } from "../components/ui/LoadingScreen";
import { Box } from "@chakra-ui/react";

function ProtectedRoutes() {
  const { user, loading: authLoading } = useAuth();
  const { loading: householdLoading } = useHousehold();
  const { needsPassword, loading: invitationLoading, markPasswordSet } = usePendingInvitation();

  // Loading state
  if (authLoading || (user && (householdLoading || invitationLoading))) {
    return <LoadingScreen />;
  }

  // Not authenticated
  if (!user) {
    return <AuthPage />;
  }

  // Needs to set password (invited user)
  if (needsPassword) {
    return (
      <Box
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="bg.subtle"
        p={4}
      >
        <SetPasswordForm
          userEmail={user.email || ""}
          onComplete={markPasswordSet}
        />
      </Box>
    );
  }

  // Authenticated - show app with routes
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/resumen" element={<ResumenPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <ProtectedRoutes />
    </BrowserRouter>
  );
}
