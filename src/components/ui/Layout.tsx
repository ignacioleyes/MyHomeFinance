import { Box, Container, Heading, Stack } from "@chakra-ui/react";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export function Layout({ children, title }: LayoutProps) {
  return (
    <Box minH="100vh" bg="bg.subtle">
      <Container maxW="container.xl" py={{ base: 4, md: 8 }}>
        <Stack direction="column" gap={{ base: 6, md: 8 }} align="stretch">
          {title && (
            <Heading
              as="h1"
              size={{ base: "xl", md: "2xl" }}
              color="primary.600"
              textAlign="center"
            >
              {title}
            </Heading>
          )}
          {children}
        </Stack>
      </Container>
    </Box>
  );
}
