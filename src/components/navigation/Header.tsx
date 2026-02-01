import { Box, Heading, Stack, Text, IconButton } from "@chakra-ui/react";
import { FiLogOut, FiDownload } from "react-icons/fi";
import { useAuth } from "../../contexts/AuthContext";
import { usePWAInstall } from "../../hooks/usePWAInstall";
import { ShareQR } from "../ui/ShareQR";
import { showSuccessToast, showErrorToast } from "../../lib/toast";

export function Header() {
  const { user, signOut } = useAuth();
  const { canInstall, install } = usePWAInstall();

  const handleSignOut = async () => {
    try {
      await signOut();
      showSuccessToast("Sesión cerrada", "Has cerrado sesión correctamente");
    } catch (error: any) {
      console.error("Error signing out:", error);
      showErrorToast("Error", error.message || "No se pudo cerrar la sesión");
    }
  };

  return (
    <Box
      bg="primary.500"
      color="white"
      py={4}
      px={4}
      position="sticky"
      top={0}
      zIndex={100}
    >
      <Stack direction="row" justify="space-between" align="center" maxW="container.xl" mx="auto">
        {/* Logo / Title */}
        <Heading as="h1" size="lg" fontWeight="bold">
          MyHomeFinance
        </Heading>

        {/* Right side actions */}
        <Stack direction="row" gap={1} align="center">
          {/* User email - hidden on mobile */}
          <Text
            fontSize="sm"
            display={{ base: "none", md: "block" }}
            mr={2}
          >
            {user?.email}
          </Text>

          {/* PWA Install */}
          {canInstall && (
            <IconButton
              aria-label="Instalar App"
              variant="ghost"
              size="sm"
              onClick={install}
              title="Instalar App"
              color="white"
              _hover={{ bg: "whiteAlpha.200" }}
            >
              <FiDownload size={18} />
            </IconButton>
          )}

          {/* Share QR */}
          <ShareQR />

          {/* Logout */}
          <IconButton
            aria-label="Cerrar Sesión"
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            title="Cerrar Sesión"
            color="white"
            _hover={{ bg: "whiteAlpha.200" }}
          >
            <FiLogOut size={18} />
          </IconButton>
        </Stack>
      </Stack>
    </Box>
  );
}
