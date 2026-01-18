import { Box, Spinner, Stack, Text } from "@chakra-ui/react";

export function LoadingScreen() {
  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="bg.subtle"
    >
      <Stack direction="column" align="center" gap={4}>
        <Spinner size="xl" color="primary.500" borderWidth="3px" />
        <Text color="gray.600" fontSize="lg">
          Cargando...
        </Text>
      </Stack>
    </Box>
  );
}
