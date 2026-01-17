import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Box,
  Button,
  Text,
  Stack,
  IconButton,
} from "@chakra-ui/react";
import {
  DialogBackdrop,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "@chakra-ui/react";

const APP_URL = "https://myhomefinance.onrender.com";

export function ShareQR() {
  const [isOpen, setIsOpen] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "MyHomeFinance",
          text: "Administra los gastos de tu hogar",
          url: APP_URL,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(APP_URL);
    }
  };

  return (
    <DialogRoot
      placement="center"
      size="sm"
      open={isOpen}
      onOpenChange={(e) => setIsOpen(e.open)}
    >
      <DialogBackdrop bg="blackAlpha.600" backdropFilter="blur(4px)" />
      <DialogTrigger asChild>
        <IconButton
          aria-label="Compartir app"
          variant="ghost"
          size="sm"
          title="Compartir QR"
        >
          <Text>📲</Text>
        </IconButton>
      </DialogTrigger>

      <DialogContent
        position="fixed"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        maxW="320px"
        w="90%"
        m={0}
      >
        <DialogHeader>
          <DialogTitle>Compartir App</DialogTitle>
          <DialogCloseTrigger />
        </DialogHeader>
        <DialogBody pb={6}>
          <Stack direction="column" align="center" gap={4}>
            <Box
              bg="white"
              p={4}
              borderRadius="lg"
              boxShadow="md"
            >
              <QRCodeSVG
                value={APP_URL}
                size={200}
                level="M"
                includeMargin={false}
              />
            </Box>
            <Text fontSize="sm" color="gray.600" textAlign="center">
              Escanea el código QR para abrir la app en otro dispositivo
            </Text>
            <Button
              w="full"
              colorPalette="primary"
              onClick={handleShare}
            >
              Compartir Link
            </Button>
            <Text fontSize="xs" color="gray.500" textAlign="center">
              {APP_URL}
            </Text>
          </Stack>
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  );
}
