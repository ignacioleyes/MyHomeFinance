import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const customConfig = defineConfig({
  theme: {
    tokens: {
      colors: {
        // Colores cálidos para el tema
        primary: {
          50: { value: "#fff5f0" },
          100: { value: "#ffe5d9" },
          200: { value: "#ffd4b8" },
          300: { value: "#ffb88c" },
          400: { value: "#ff9c60" },
          500: { value: "#ff7f34" }, // Color principal
          600: { value: "#e66a1f" },
          700: { value: "#cc5214" },
          800: { value: "#b33f0d" },
          900: { value: "#992f08" },
        },
        secondary: {
          50: { value: "#fef3e5" },
          100: { value: "#fce5c7" },
          200: { value: "#f9d39f" },
          300: { value: "#f5be76" },
          400: { value: "#f0a94e" },
          500: { value: "#eb9426" }, // Amarillo/naranja
          600: { value: "#d17c19" },
          700: { value: "#b76510" },
          800: { value: "#9d500a" },
          900: { value: "#833d05" },
        },
      },
    },
    semanticTokens: {
      colors: {
        "bg.default": { value: "{colors.white}" },
        "bg.subtle": { value: "{colors.gray.50}" },
        "bg.emphasized": { value: "{colors.primary.50}" },
      },
    },
  },
});

export const system = createSystem(defaultConfig, customConfig);
