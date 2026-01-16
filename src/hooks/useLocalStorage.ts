import { useState, useEffect } from "react";

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // Estado para almacenar el valor
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Retornar una versión envuelta de useState que persiste en localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Permitir que value sea función para tener la misma API que useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;

      setStoredValue(valueToStore);

      window.localStorage.setItem(key, JSON.stringify(valueToStore));

      // Disparar evento personalizado para sincronizar entre pestañas
      window.dispatchEvent(
        new CustomEvent("localStorageChange", {
          detail: { key, value: valueToStore },
        })
      );
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Escuchar cambios en localStorage de otras pestañas
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error("Error parsing storage event:", error);
        }
      }
    };

    const handleCustomStorageChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail.key === key) {
        setStoredValue(customEvent.detail.value);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("localStorageChange", handleCustomStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "localStorageChange",
        handleCustomStorageChange
      );
    };
  }, [key]);

  return [storedValue, setValue];
}
