import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

interface Household {
  id: string;
  name: string;
  created_at: string;
  created_by: string | null;
  updated_at: string;
}

export function useHousehold() {
  const { user } = useAuth();
  const [household, setHousehold] = useState<Household | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const createDefaultHousehold = useCallback(async () => {
    if (!user) {
      return null;
    }

    try {
      // Create household
      const { data: newHousehold, error: createError } = await supabase
        .from("households")
        .insert({
          name: "Mi Hogar",
          created_by: user.id,
        } as any)
        .select()
        .single();

      if (createError) {
        console.error("Error creating household:", {
          code: createError.code,
          message: createError.message,
          details: createError.details,
          hint: createError.hint
        });
        throw createError;
      }

      // Add user as admin member explicitly (no trigger)
      const { error: memberError } = await supabase
        .from("household_members")
        .insert({
          household_id: (newHousehold as any).id,
          user_id: user.id,
          role: "admin",
        } as any);

      if (memberError) {
        console.error("Error adding member:", {
          code: memberError.code,
          message: memberError.message,
          details: memberError.details,
          hint: memberError.hint
        });
        // If member insert fails but household was created, try to clean up
        await supabase.from("households").delete().eq("id", (newHousehold as any).id);
        throw memberError;
      }

      return newHousehold;
    } catch (err: any) {
      console.error("Error in createDefaultHousehold:", {
        message: err.message,
        code: err.code,
        details: err.details,
        fullError: err
      });
      setError(err.message);
      return null;
    }
  }, [user]);

  const loadHousehold = useCallback(async () => {
    if (!user) {
      setHousehold(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // First, check if user is member of any household
      const { data: memberships, error: memberError } = await supabase
        .from("household_members")
        .select("household_id")
        .eq("user_id", user.id);

      if (memberError) throw memberError;

      if (!memberships || memberships.length === 0) {
        // No household found, create default one
        const newHousehold = await createDefaultHousehold();
        if (newHousehold) {
          setHousehold(newHousehold);
        }
      } else if (memberships.length === 1) {
        // Only one household, use it
        const householdId = memberships[0].household_id;

        const { data: householdData, error: householdError } = await supabase
          .from("households")
          .select("*")
          .eq("id", householdId)
          .single();

        if (householdError) throw householdError;

        setHousehold(householdData as any);
      } else {
        // Multiple households - choose the one with most members
        // Get member count for each household
        const householdIds = memberships.map(m => m.household_id);
        const { data: memberCounts } = await supabase
          .from("household_members")
          .select("household_id")
          .in("household_id", householdIds);

        // Count members per household
        const counts: Record<string, number> = {};
        (memberCounts || []).forEach((m: any) => {
          counts[m.household_id] = (counts[m.household_id] || 0) + 1;
        });

        // Find household with most members
        let selectedHouseholdId = memberships[0].household_id;
        let maxMembers = counts[selectedHouseholdId] || 0;

        for (const membership of memberships) {
          const memberCount = counts[membership.household_id] || 0;
          if (memberCount > maxMembers) {
            maxMembers = memberCount;
            selectedHouseholdId = membership.household_id;
          }
        }

        // Get household details
        const { data: householdData, error: householdError } = await supabase
          .from("households")
          .select("*")
          .eq("id", selectedHouseholdId)
          .single();

        if (householdError) throw householdError;

        setHousehold(householdData as any);
      }
    } catch (err: any) {
      console.error("Error loading household:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, createDefaultHousehold]);

  useEffect(() => {
    loadHousehold();
  }, [loadHousehold]);

  return {
    household,
    loading,
    error,
    reloadHousehold: loadHousehold,
  };
}
