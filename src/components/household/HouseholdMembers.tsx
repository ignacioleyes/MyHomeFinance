import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Input,
  Text,
  Stack,
  Heading,
  Badge,
  createToaster,
  Spinner,
} from "@chakra-ui/react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";

const toaster = createToaster({
  placement: "top",
  duration: 3000,
});

interface Member {
  id: string;
  user_id: string;
  role: "admin" | "member";
  joined_at: string;
  email?: string;
}

interface PendingInvitation {
  id: string;
  email: string;
  created_at: string;
}

interface HouseholdMembersProps {
  householdId: string;
  householdName: string;
}

export function HouseholdMembers({ householdId, householdName }: HouseholdMembersProps) {
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);

  const loadMembers = async () => {
    try {
      setLoading(true);

      // Use RPC function to get members with emails
      const { data, error } = await supabase.rpc(
        "get_household_members_with_emails",
        { household_id_param: householdId }
      );

      if (error) throw error;

      setMembers((data || []) as Member[]);

      // Load pending invitations
      const { data: invitations, error: invError } = await supabase
        .from("pending_invitations")
        .select("id, email, created_at")
        .eq("household_id", householdId)
        .order("created_at", { ascending: false });

      if (!invError) {
        setPendingInvitations(invitations || []);
      }
    } catch (err: any) {
      console.error("Error loading members:", err);
      toaster.create({
        title: "Error",
        description: "No se pudieron cargar los miembros",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, [householdId]);

  const handleInvite = async () => {
    if (!inviteEmail || !inviteEmail.includes("@")) {
      toaster.create({
        title: "Email inválido",
        description: "Por favor ingresa un email válido",
        type: "error",
      });
      return;
    }

    setInviting(true);

    try {
      // Check if already a member
      const { data: existingMember } = await supabase.rpc(
        "get_user_id_by_email",
        { email_param: inviteEmail }
      );

      if (existingMember) {
        // User exists, check if already member
        const { data: membership } = await supabase
          .from("household_members")
          .select("id")
          .eq("household_id", householdId)
          .eq("user_id", existingMember)
          .maybeSingle();

        if (membership) {
          toaster.create({
            title: "Ya es miembro",
            description: "Este usuario ya forma parte del hogar",
            type: "info",
          });
          setInviting(false);
          return;
        }

        // Add existing user directly
        const { error: insertError } = await supabase
          .from("household_members")
          .insert({
            household_id: householdId,
            user_id: existingMember,
            role: "member",
          } as any);

        if (insertError) throw insertError;

        toaster.create({
          title: "Miembro agregado",
          description: `${inviteEmail} ahora es parte del hogar`,
          type: "success",
        });

        setInviteEmail("");
        await loadMembers();
        setInviting(false);
        return;
      }

      // Check if already invited
      const { data: existingInvitation } = await supabase
        .from("pending_invitations")
        .select("id")
        .eq("household_id", householdId)
        .eq("email", inviteEmail.toLowerCase())
        .maybeSingle();

      if (existingInvitation) {
        toaster.create({
          title: "Ya invitado",
          description: "Este email ya tiene una invitación pendiente",
          type: "info",
        });
        setInviting(false);
        return;
      }

      // Create pending invitation
      const { error: inviteError } = await supabase
        .from("pending_invitations")
        .insert({
          email: inviteEmail.toLowerCase(),
          household_id: householdId,
          invited_by: user?.id,
        });

      if (inviteError) throw inviteError;

      // Send magic link email for registration/login
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: inviteEmail,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `https://myhomefinance.onrender.com`,
        },
      });

      if (otpError) throw otpError;

      toaster.create({
        title: "Invitación enviada",
        description: `Se envió un email de invitación a ${inviteEmail}`,
        type: "success",
      });

      setInviteEmail("");
      await loadMembers();
    } catch (err: any) {
      console.error("Error inviting member:", err);
      toaster.create({
        title: "Error",
        description: err.message || "No se pudo enviar la invitación",
        type: "error",
      });
    } finally {
      setInviting(false);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from("pending_invitations")
        .delete()
        .eq("id", invitationId);

      if (error) throw error;

      toaster.create({
        title: "Invitación cancelada",
        type: "success",
      });

      await loadMembers();
    } catch (err: any) {
      console.error("Error canceling invitation:", err);
      toaster.create({
        title: "Error",
        description: "No se pudo cancelar la invitación",
        type: "error",
      });
    }
  };

  const handleRemoveMember = async (memberId: string, memberEmail: string) => {
    try {
      const { error } = await supabase
        .from("household_members")
        .delete()
        .eq("id", memberId);

      if (error) throw error;

      toaster.create({
        title: "Miembro eliminado",
        description: `${memberEmail} fue removido del hogar`,
        type: "success",
      });

      await loadMembers();
    } catch (err: any) {
      console.error("Error removing member:", err);
      toaster.create({
        title: "Error",
        description: "No se pudo eliminar al miembro",
        type: "error",
      });
    }
  };

  const isAdmin = members.some((m) => m.user_id === user?.id && m.role === "admin");

  return (
    <Box
      bg="white"
      p={{ base: 4, md: 6 }}
      borderRadius="lg"
      boxShadow="md"
    >
      <Stack direction="column" gap={4}>
        <Stack direction="row" justify="space-between" align="center">
          <Heading as="h3" size="md" color="primary.600">
            {householdName}
          </Heading>
          {isAdmin && (
            <Button
              size="sm"
              variant={showInviteForm ? "solid" : "outline"}
              colorPalette="primary"
              onClick={() => setShowInviteForm(!showInviteForm)}
            >
              {showInviteForm ? "Cancelar" : "+ Invitar"}
            </Button>
          )}
        </Stack>

        {/* Members List */}
        <Box>
          <Text fontWeight="medium" fontSize="sm" mb={2}>
            Miembros ({members.length})
          </Text>
          {loading ? (
            <Spinner size="sm" color="primary.500" />
          ) : (
            <Stack direction="column" gap={2}>
              {members.map((member) => (
                <Stack
                  key={member.id}
                  direction="row"
                  justify="space-between"
                  align="center"
                  p={3}
                  bg="gray.50"
                  borderRadius="md"
                >
                  <Text fontSize="sm">{member.email}</Text>
                  <Stack direction="row" gap={2} align="center">
                    <Badge colorPalette={member.role === "admin" ? "orange" : "blue"}>
                      {member.role === "admin" ? "Admin" : "Miembro"}
                    </Badge>
                    {isAdmin && member.user_id !== user?.id && (
                      <Button
                        size="xs"
                        variant="ghost"
                        colorPalette="red"
                        onClick={() => handleRemoveMember(member.id, member.email || "")}
                      >
                        Quitar
                      </Button>
                    )}
                  </Stack>
                </Stack>
              ))}
            </Stack>
          )}
        </Box>

        {/* Pending Invitations */}
        {isAdmin && pendingInvitations.length > 0 && (
          <Box>
            <Text fontWeight="medium" fontSize="sm" mb={2}>
              Invitaciones pendientes ({pendingInvitations.length})
            </Text>
            <Stack direction="column" gap={2}>
              {pendingInvitations.map((invitation) => (
                <Stack
                  key={invitation.id}
                  direction="row"
                  justify="space-between"
                  align="center"
                  p={3}
                  bg="yellow.50"
                  borderRadius="md"
                >
                  <Text fontSize="sm">{invitation.email}</Text>
                  <Stack direction="row" gap={2} align="center">
                    <Badge colorPalette="yellow">Pendiente</Badge>
                    <Button
                      size="xs"
                      variant="ghost"
                      colorPalette="red"
                      onClick={() => handleCancelInvitation(invitation.id)}
                    >
                      Cancelar
                    </Button>
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </Box>
        )}

        {/* Invite Section (only for admins, collapsible) */}
        {isAdmin && showInviteForm && (
          <Box pt={4} borderTop="1px solid" borderColor="gray.200">
            <Text fontWeight="medium" fontSize="sm" mb={2}>
              Invitar miembro
            </Text>
            <Stack direction="column" gap={2}>
              <Input
                type="email"
                placeholder="email@ejemplo.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                size="lg"
              />
              <Button
                colorPalette="primary"
                size="lg"
                w="full"
                onClick={handleInvite}
                loading={inviting}
              >
                Enviar Invitación
              </Button>
              <Text fontSize="xs" color="gray.600">
                Se enviará un email con un link para unirse al hogar
              </Text>
            </Stack>
          </Box>
        )}
      </Stack>
    </Box>
  );
}
