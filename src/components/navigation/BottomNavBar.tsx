import { Box, Stack, Text } from "@chakra-ui/react";
import { NavLink, useLocation } from "react-router-dom";

interface NavItemProps {
  to: string;
  icon: string;
  label: string;
  isActive: boolean;
}

function NavItem({ to, icon, label, isActive }: NavItemProps) {
  return (
    <NavLink to={to} style={{ flex: 1, textDecoration: "none" }}>
      <Stack
        direction="column"
        align="center"
        gap={1}
        py={2}
        color={isActive ? "primary.500" : "gray.500"}
        position="relative"
      >
        {isActive && (
          <Box
            position="absolute"
            top={0}
            left="50%"
            transform="translateX(-50%)"
            w={12}
            h={1}
            bg="primary.500"
            borderRadius="full"
          />
        )}
        <Text fontSize="xl">{icon}</Text>
        <Text fontSize="xs" fontWeight={isActive ? "semibold" : "normal"}>
          {label}
        </Text>
      </Stack>
    </NavLink>
  );
}

export function BottomNavBar() {
  const location = useLocation();

  const navItems = [
    { to: "/", icon: "🏠", label: "Inicio" },
    { to: "/resumen", icon: "📊", label: "Resumen" },
  ];

  return (
    <Box
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      bg="white"
      boxShadow="0 -2px 10px rgba(0, 0, 0, 0.1)"
      zIndex={100}
      pb="env(safe-area-inset-bottom)"
    >
      <Stack
        direction="row"
        maxW="container.xl"
        mx="auto"
        justify="space-around"
        align="stretch"
      >
        {navItems.map((item) => (
          <NavItem
            key={item.to}
            to={item.to}
            icon={item.icon}
            label={item.label}
            isActive={location.pathname === item.to}
          />
        ))}
      </Stack>
    </Box>
  );
}
