import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { Gasto, GastoFormData, ResumenMensual, FiltrosGasto } from "../types/gasto.types";
import { obtenerMesAnio } from "../utils/formatters";
import { useAuth } from "../contexts/AuthContext";

export function useSupabaseGastos(householdId: string | null) {
  const { user } = useAuth();
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load expenses from Supabase
  const loadGastos = useCallback(async () => {
    if (!householdId) {
      console.log("💰 No household ID, skipping expense load");
      setGastos([]);
      setLoading(false);
      return;
    }

    console.log("💰 Loading expenses for household:", householdId);

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("expenses")
        .select("*")
        .eq("household_id", householdId)
        .order("expense_date", { ascending: false }) as any;

      if (fetchError) {
        console.error("❌ Error fetching expenses:", fetchError);
        throw fetchError;
      }

      console.log("✅ Fetched expenses from DB:", data);

      // Transform database format to app format
      const transformedGastos: Gasto[] = ((data as any[]) || []).map((expense: any) => ({
        id: expense.id,
        importe: parseFloat(expense.amount.toString()),
        categoria: expense.category as Gasto["categoria"],
        descripcion: expense.description || undefined,
        fecha: expense.expense_date,
        createdAt: new Date(expense.created_at).getTime(),
      }));

      console.log("✅ Transformed expenses:", transformedGastos);
      setGastos(transformedGastos);
    } catch (err: any) {
      console.error("❌ Error loading expenses:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [householdId]);

  // Subscribe to real-time changes
  useEffect(() => {
    loadGastos();

    if (!householdId) return;

    console.log("🔔 Setting up real-time subscription for household:", householdId);

    // Set up real-time subscription
    const channel = supabase
      .channel(`expenses:household_id=eq.${householdId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "expenses",
          filter: `household_id=eq.${householdId}`,
        },
        (payload) => {
          console.log("🔔 Real-time change received:", payload);

          if (payload.eventType === "INSERT") {
            console.log("➕ INSERT event");
            const newExpense = payload.new as any;
            const newGasto: Gasto = {
              id: newExpense.id,
              importe: parseFloat(newExpense.amount.toString()),
              categoria: newExpense.category as Gasto["categoria"],
              descripcion: newExpense.description || undefined,
              fecha: newExpense.expense_date,
              createdAt: new Date(newExpense.created_at).getTime(),
            };
            console.log("➕ Adding new gasto to state:", newGasto);
            setGastos((prev) => {
              const updated = [newGasto, ...prev];
              console.log("📊 New gastos state:", updated);
              return updated;
            });
          } else if (payload.eventType === "DELETE") {
            console.log("🗑️ DELETE event");
            const deletedId = (payload.old as any).id;
            setGastos((prev) => prev.filter((g) => g.id !== deletedId));
          } else if (payload.eventType === "UPDATE") {
            console.log("✏️ UPDATE event");
            const updatedExpense = payload.new as any;
            const updatedGasto: Gasto = {
              id: updatedExpense.id,
              importe: parseFloat(updatedExpense.amount.toString()),
              categoria: updatedExpense.category as Gasto["categoria"],
              descripcion: updatedExpense.description || undefined,
              fecha: updatedExpense.expense_date,
              createdAt: new Date(updatedExpense.created_at).getTime(),
            };
            setGastos((prev) =>
              prev.map((g) => (g.id === updatedGasto.id ? updatedGasto : g))
            );
          }
        }
      )
      .subscribe((status) => {
        console.log("🔔 Subscription status:", status);
      });

    return () => {
      console.log("🔕 Unsubscribing from real-time channel");
      supabase.removeChannel(channel);
    };
  }, [householdId, loadGastos]);

  // Agregar un nuevo gasto
  const agregarGasto = useCallback(
    async (formData: GastoFormData): Promise<Gasto | null> => {
      if (!householdId || !user) {
        console.error("No household or user available");
        return null;
      }

      try {
        const { data, error: insertError } = await supabase
          .from("expenses")
          .insert({
            household_id: householdId,
            user_id: user.id,
            amount: parseFloat(formData.importe),
            category: formData.categoria,
            description: formData.descripcion || null,
            expense_date: formData.fecha,
          } as any)
          .select()
          .single();

        if (insertError) throw insertError;

        const nuevoGasto: Gasto = {
          id: (data as any).id,
          importe: parseFloat((data as any).amount.toString()),
          categoria: (data as any).category as Gasto["categoria"],
          descripcion: (data as any).description || undefined,
          fecha: (data as any).expense_date,
          createdAt: new Date((data as any).created_at).getTime(),
        };

        console.log("✅ Expense created, reloading list...");
        // Reload expenses to ensure UI is updated (fallback if realtime doesn't work)
        await loadGastos();

        return nuevoGasto;
      } catch (err: any) {
        console.error("Error adding expense:", err);
        throw err;
      }
    },
    [householdId, user]
  );

  // Eliminar un gasto
  const eliminarGasto = useCallback(
    async (id: string): Promise<boolean> => {
      if (!householdId) {
        console.error("No household available");
        return false;
      }

      try {
        const { error: deleteError } = await supabase
          .from("expenses")
          .delete()
          .eq("id", id)
          .eq("household_id", householdId);

        if (deleteError) throw deleteError;

        console.log("✅ Expense deleted, reloading list...");
        // Reload expenses to ensure UI is updated (fallback if realtime doesn't work)
        await loadGastos();

        return true;
      } catch (err: any) {
        console.error("Error deleting expense:", err);
        return false;
      }
    },
    [householdId]
  );

  // Actualizar un gasto
  const actualizarGasto = useCallback(
    async (id: string, formData: Partial<GastoFormData>): Promise<boolean> => {
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
        if (formData.fecha) updateData.expense_date = formData.fecha;

        const { error: updateError } = (await supabase
          .from("expenses")
          .update(updateData)
          .eq("id", id)
          .eq("household_id", householdId)) as any;

        if (updateError) throw updateError;

        // Real-time subscription will handle updating state
        return true;
      } catch (err: any) {
        console.error("Error updating expense:", err);
        return false;
      }
    },
    [householdId]
  );

  // Filtrar gastos (client-side filtering on already loaded data)
  const filtrarGastos = useCallback(
    (filtros: FiltrosGasto): Gasto[] => {
      return gastos.filter((gasto) => {
        if (filtros.mes && obtenerMesAnio(gasto.fecha) !== filtros.mes) {
          return false;
        }
        if (filtros.categoria && gasto.categoria !== filtros.categoria) {
          return false;
        }
        if (filtros.fechaInicio && gasto.fecha < filtros.fechaInicio) {
          return false;
        }
        if (filtros.fechaFin && gasto.fecha > filtros.fechaFin) {
          return false;
        }
        return true;
      });
    },
    [gastos]
  );

  // Obtener resumen mensual
  const obtenerResumenMensual = useCallback(
    (mes: string): ResumenMensual => {
      const gastosMes = filtrarGastos({ mes });

      const total = gastosMes.reduce((sum, g) => sum + g.importe, 0);

      const porCategoria = gastosMes.reduce((acc, gasto) => {
        acc[gasto.categoria] = (acc[gasto.categoria] || 0) + gasto.importe;
        return acc;
      }, {} as Record<Gasto["categoria"], number>);

      return {
        mes,
        total,
        cantidad: gastosMes.length,
        gastos: gastosMes,
        porCategoria,
      };
    },
    [filtrarGastos]
  );

  // Obtener total general
  const totalGeneral = useMemo(() => {
    return gastos.reduce((sum, g) => sum + g.importe, 0);
  }, [gastos]);

  // Obtener meses disponibles
  const mesesDisponibles = useMemo(() => {
    const meses = new Set(gastos.map((g) => obtenerMesAnio(g.fecha)));
    return Array.from(meses).sort((a, b) => b.localeCompare(a));
  }, [gastos]);

  return {
    gastos,
    agregarGasto,
    eliminarGasto,
    actualizarGasto,
    filtrarGastos,
    obtenerResumenMensual,
    totalGeneral,
    mesesDisponibles,
    loading,
    error,
    reloadGastos: loadGastos,
  };
}
