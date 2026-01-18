import { Box, Container } from "@chakra-ui/react";
import { ReactNode } from "react";
import { Header } from "../navigation/Header";
import { BottomNavBar } from "../navigation/BottomNavBar";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <Box minH="100vh" bg="bg.subtle" display="flex" flexDirection="column">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <Box flex={1}>
        <Container maxW="container.xl" py={{ base: 4, md: 6 }} px={{ base: 4, md: 6 }}>
          {children}
        </Container>
      </Box>

      {/* Bottom Navigation */}
      <BottomNavBar />
    </Box>
  );
}
