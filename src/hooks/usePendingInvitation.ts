import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

interface PendingInvitation {
  id: string;
  household_id: string;
}

export function usePendingInvitation() {
  const { user } = useAuth();
  const [pendingInvitation, setPendingInvitation] = useState<PendingInvitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsPassword, setNeedsPassword] = useState(false);

  const checkInvitation = useCallback(async () => {
    if (!user?.email) {
      setPendingInvitation(null);
      setNeedsPassword(false);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Check if user has a pending invitation
      const { data: invitations, error } = await supabase
        .from("pending_invitations")
        .select("id, household_id")
        .eq("email", user.email.toLowerCase())
        .limit(1);

      if (error) {
        console.error("Error checking invitation:", error);
        setPendingInvitation(null);
        setNeedsPassword(false);
        setLoading(false);
        return;
      }

      if (invitations && invitations.length > 0) {
        // User has pending invitation - came from magic link, needs to set password
        setPendingInvitation(invitations[0]);
        setNeedsPassword(true);
      } else {
        setPendingInvitation(null);
        setNeedsPassword(false);
      }
    } catch (err) {
      console.error("Error checking invitation:", err);
      setPendingInvitation(null);
      setNeedsPassword(false);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    checkInvitation();
  }, [checkInvitation]);

  const markPasswordSet = useCallback(() => {
    setNeedsPassword(false);
  }, []);

  return {
    pendingInvitation,
    needsPassword,
    loading,
    markPasswordSet,
    recheckInvitation: checkInvitation,
  };
}
