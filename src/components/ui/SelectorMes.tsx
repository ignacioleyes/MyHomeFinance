import { NativeSelectField, NativeSelectRoot } from "@chakra-ui/react";
import { obtenerNombreMes } from "../../utils/formatters";

interface SelectorMesProps {
  mesesDisponibles: string[];
  mesSeleccionado: string;
  onChange: (mes: string) => void;
}

export function SelectorMes({
  mesesDisponibles,
  mesSeleccionado,
  onChange,
}: SelectorMesProps) {
  return (
    <NativeSelectRoot size="lg">
      <NativeSelectField
        value={mesSeleccionado}
        onChange={(e) => onChange(e.target.value)}
        bg="white"
        borderColor="primary.300"
      >
        <option value="">Todos los meses</option>
        {mesesDisponibles.map((mes) => (
          <option key={mes} value={mes}>
            {obtenerNombreMes(mes)}
          </option>
        ))}
      </NativeSelectField>
    </NativeSelectRoot>
  );
}
