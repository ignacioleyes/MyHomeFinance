import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const customConfig = defineConfig({
  theme: {
    tokens: {
      colors: {
        // Nueva paleta teal/verde
        primary: {
          50: { value: "#E6F5F0" },
          100: { value: "#B3E0D2" },
          200: { value: "#80CBB4" },
          300: { value: "#4DB696" },
          400: { value: "#26A67E" },
          500: { value: "#1B5E4B" }, // Color principal del header
          600: { value: "#175242" },
          700: { value: "#124539" },
          800: { value: "#0E3930" },
          900: { value: "#092D27" },
        },
        secondary: {
          50: { value: "#E8F5E9" },
          100: { value: "#C8E6C9" },
          200: { value: "#A5D6A7" },
          300: { value: "#81C784" },
          400: { value: "#66BB6A" },
          500: { value: "#4CAF50" },
          600: { value: "#43A047" },
          700: { value: "#388E3C" },
          800: { value: "#2E7D32" },
          900: { value: "#1B5E20" },
        },
      },
    },
    semanticTokens: {
      colors: {
        "bg.default": { value: "{colors.white}" },
        "bg.subtle": { value: "#F5F5F5" }, // Fondo gris claro
        "bg.emphasized": { value: "{colors.primary.50}" },
        "header.bg": { value: "{colors.primary.500}" },
        "header.text": { value: "{colors.white}" },
      },
    },
  },
});

export const system = createSystem(defaultConfig, customConfig);
