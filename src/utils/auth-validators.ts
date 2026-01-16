import { LoginFormData, RegisterFormData } from "../types/auth.types";

interface ValidationResult {
  isValid: boolean;
  errors: Partial<Record<string, string>>;
}

export function validarLoginForm(data: LoginFormData): ValidationResult {
  const errors: Partial<Record<keyof LoginFormData, string>> = {};

  // Email validation
  if (!data.email) {
    errors.email = "El email es obligatorio";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "El email no es válido";
  }

  // Password validation
  if (!data.password) {
    errors.password = "La contraseña es obligatoria";
  } else if (data.password.length < 6) {
    errors.password = "La contraseña debe tener al menos 6 caracteres";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validarRegisterForm(data: RegisterFormData): ValidationResult {
  const errors: Partial<Record<keyof RegisterFormData, string>> = {};

  // Email validation
  if (!data.email) {
    errors.email = "El email es obligatorio";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "El email no es válido";
  }

  // Password validation
  if (!data.password) {
    errors.password = "La contraseña es obligatoria";
  } else if (data.password.length < 6) {
    errors.password = "La contraseña debe tener al menos 6 caracteres";
  }

  // Confirm password validation
  if (!data.confirmPassword) {
    errors.confirmPassword = "Debe confirmar la contraseña";
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = "Las contraseñas no coinciden";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
