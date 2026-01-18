import { createToaster } from "@chakra-ui/react";

// Centralized toaster instance for the entire application
export const toaster = createToaster({
  placement: "top",
  duration: 3000,
});

// Helper functions for common toast types
export const showSuccessToast = (title: string, description?: string) => {
  toaster.create({
    title,
    description,
    type: "success",
  });
};

export const showErrorToast = (title: string, description?: string) => {
  toaster.create({
    title,
    description,
    type: "error",
  });
};

export const showInfoToast = (title: string, description?: string) => {
  toaster.create({
    title,
    description,
    type: "info",
  });
};

export const showWarningToast = (title: string, description?: string) => {
  toaster.create({
    title,
    description,
    type: "warning",
  });
};
