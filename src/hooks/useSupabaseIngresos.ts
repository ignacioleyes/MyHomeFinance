import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { Ingreso, IngresoFormData, ResumenMensualIngresos, FiltrosIngreso } from "../types/ingreso.types";
import { obtenerMesAnio } from "../utils/formatters";
import { useAuth } from "../contexts/AuthContext";

export function useSupabaseIngresos(householdId: string | null) {
  const { user } = useAuth();
  const [ingresos, setIngresos] = useState<Ingreso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load incomes from Supabase
  const loadIngresos = useCallback(async () => {
    if (!householdId) {
      setIngresos([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("incomes")
        .select("*")
        .eq("household_id", householdId)
        .order("income_date", { ascending: false }) as any;

      if (fetchError) {
        console.error("Error fetching incomes:", fetchError);
        throw fetchError;
      }

      // Transform database format to app format
      const transformedIngresos: Ingreso[] = ((data as any[]) || []).map((income: any) => ({
        id: income.id,
        importe: parseFloat(income.amount.toString()),
        categoria: income.category as Ingreso["categoria"],
        descripcion: income.description || undefined,
        fecha: income.income_date,
        createdAt: new Date(income.created_at).getTime(),
      }));

      setIngresos(transformedIngresos);
    } catch (err: any) {
      console.error("Error loading incomes:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [householdId]);

  // Subscribe to real-time changes
  useEffect(() => {
    loadIngresos();

    if (!householdId) return;

    // Set up real-time subscription
    const channel = supabase
      .channel(`incomes:household_id=eq.${householdId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "incomes",
          filter: `household_id=eq.${householdId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newIncome = payload.new as any;
            const newIngreso: Ingreso = {
              id: newIncome.id,
              importe: parseFloat(newIncome.amount.toString()),
              categoria: newIncome.category as Ingreso["categoria"],
              descripcion: newIncome.description || undefined,
              fecha: newIncome.income_date,
              createdAt: new Date(newIncome.created_at).getTime(),
            };
            setIngresos((prev) => [newIngreso, ...prev]);
          } else if (payload.eventType === "DELETE") {
            const deletedId = (payload.old as any).id;
            setIngresos((prev) => prev.filter((i) => i.id !== deletedId));
          } else if (payload.eventType === "UPDATE") {
            const updatedIncome = payload.new as any;
            const updatedIngreso: Ingreso = {
              id: updatedIncome.id,
              importe: parseFloat(updatedIncome.amount.toString()),
              categoria: updatedIncome.category as Ingreso["categoria"],
              descripcion: updatedIncome.description || undefined,
              fecha: updatedIncome.income_date,
              createdAt: new Date(updatedIncome.created_at).getTime(),
            };
            setIngresos((prev) =>
              prev.map((i) => (i.id === updatedIngreso.id ? updatedIngreso : i))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [householdId, loadIngresos]);

  // Agregar un nuevo ingreso
  const agregarIngreso = useCallback(
    async (formData: IngresoFormData): Promise<Ingreso | null> => {
      if (!householdId || !user) {
        console.error("No household or user available");
        return null;
      }

      try {
        const { data, error: insertError } = await supabase
          .from("incomes")
          .insert({
            household_id: householdId,
            user_id: user.id,
            amount: parseFloat(formData.importe),
            category: formData.categoria,
            description: formData.descripcion || null,
            income_date: formData.fecha,
          } as any)
          .select()
          .single();

        if (insertError) throw insertError;

        const nuevoIngreso: Ingreso = {
          id: (data as any).id,
          importe: parseFloat((data as any).amount.toString()),
          categoria: (data as any).category as Ingreso["categoria"],
          descripcion: (data as any).description || undefined,
          fecha: (data as any).income_date,
          createdAt: new Date((data as any).created_at).getTime(),
        };

        // Reload incomes to ensure UI is updated (fallback if realtime doesn't work)
        await loadIngresos();

        return nuevoIngreso;
      } catch (err: any) {
        console.error("Error adding income:", err);
        throw err;
      }
    },
    [householdId, user, loadIngresos]
  );

  // Eliminar un ingreso
  const eliminarIngreso = useCallback(
    async (id: string): Promise<boolean> => {
      if (!householdId) {
        console.error("No household available");
        return false;
      }

      try {
        const { error: deleteError } = await supabase
          .from("incomes")
          .delete()
          .eq("id", id)
          .eq("household_id", householdId);

        if (deleteError) throw deleteError;

        // Reload incomes to ensure UI is updated (fallback if realtime doesn't work)
        await loadIngresos();

        return true;
      } catch (err: any) {
        console.error("Error deleting income:", err);
        return false;
      }
    },
    [householdId, loadIngresos]
  );

  // Actualizar un ingreso
  const actualizarIngreso = useCallback(
    async (id: string, formData: Partial<IngresoFormData>): Promise<boolean> => {
      if (!householdId) {
        console.error("No household available");
        return false;
      }

      try {
        const updateData: any = {};
        if (formData.importe) updateData.amount = parseFloat(formData.importe);
        if (formData.categoria) updateData.category = formData.categoria;
        if (formData.descripcion !== undefined)
          updateData.description = formData.descripcion || null;
        if (formData.fecha) updateData.income_date = formData.fecha;

        const { error: updateError } = (await supabase
          .from("incomes")
          .update(updateData)
          .eq("id", id)
          .eq("household_id", householdId)) as any;

        if (updateError) throw updateError;

        // Reload incomes to ensure UI is updated (fallback if realtime doesn't work)
        await loadIngresos();

        return true;
      } catch (err: any) {
        console.error("Error updating income:", err);
        return false;
      }
    },
    [householdId, loadIngresos]
  );

  // Filtrar ingresos (client-side filtering on already loaded data)
  const filtrarIngresos = useCallback(
    (filtros: FiltrosIngreso): Ingreso[] => {
      return ingresos.filter((ingreso) => {
        if (filtros.mes && obtenerMesAnio(ingreso.fecha) !== filtros.mes) {
          return false;
        }
        if (filtros.categoria && ingreso.categoria !== filtros.categoria) {
          return false;
        }
        if (filtros.fechaInicio && ingreso.fecha < filtros.fechaInicio) {
          return false;
        }
        if (filtros.fechaFin && ingreso.fecha > filtros.fechaFin) {
          return false;
        }
        return true;
      });
    },
    [ingresos]
  );

  // Obtener resumen mensual
  const obtenerResumenMensual = useCallback(
    (mes: string): ResumenMensualIngresos => {
      const ingresosMes = filtrarIngresos({ mes });

      const total = ingresosMes.reduce((sum, i) => sum + i.importe, 0);

      const porCategoria = ingresosMes.reduce((acc, ingreso) => {
        acc[ingreso.categoria] = (acc[ingreso.categoria] || 0) + ingreso.importe;
        return acc;
      }, {} as Record<Ingreso["categoria"], number>);

      return {
        mes,
        total,
        cantidad: ingresosMes.length,
        ingresos: ingresosMes,
        porCategoria,
      };
    },
    [filtrarIngresos]
  );

  // Obtener total general
  const totalGeneral = useMemo(() => {
    return ingresos.reduce((sum, i) => sum + i.importe, 0);
  }, [ingresos]);

  // Obtener meses disponibles
  const mesesDisponibles = useMemo(() => {
    const meses = new Set(ingresos.map((i) => obtenerMesAnio(i.fecha)));
    return Array.from(meses).sort((a, b) => b.localeCompare(a));
  }, [ingresos]);

  return {
    ingresos,
    agregarIngreso,
    eliminarIngreso,
    actualizarIngreso,
    filtrarIngresos,
    obtenerResumenMensual,
    totalGeneral,
    mesesDisponibles,
    loading,
    error,
    reloadIngresos: loadIngresos,
  };
}
