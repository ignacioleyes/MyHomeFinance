import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Input,
  Text,
  Stack,
  Heading,
  Badge,
  Spinner,
} from "@chakra-ui/react";
import {
  DialogActionTrigger,
  DialogBackdrop,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "@chakra-ui/react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import { toaster } from "../../lib/toast";

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

  // Modal states
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);
  const [invitationToCancel, setInvitationToCancel] = useState<PendingInvitation | null>(null);

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

  const handleCancelInvitation = async () => {
    if (!invitationToCancel) return;

    try {
      const { error } = await supabase
        .from("pending_invitations")
        .delete()
        .eq("id", invitationToCancel.id);

      if (error) throw error;

      toaster.create({
        title: "Invitación cancelada",
        type: "success",
      });

      setInvitationToCancel(null);
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

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;

    try {
      const { error } = await supabase
        .from("household_members")
        .delete()
        .eq("id", memberToRemove.id);

      if (error) throw error;

      toaster.create({
        title: "Miembro eliminado",
        description: `${memberToRemove.email} fue removido del hogar`,
        type: "success",
      });

      setMemberToRemove(null);
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
      borderRadius="2xl"
      boxShadow="sm"
    >
      <Stack direction="column" gap={4}>
        <Stack direction="row" justify="space-between" align="center" flexWrap="wrap" gap={2}>
          <Heading as="h3" size="md" color="primary.600">
            {householdName}
          </Heading>
          {isAdmin && (
            <Button
              size="sm"
              variant={showInviteForm ? "solid" : "outline"}
              colorPalette="teal"
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
                <Box
                  key={member.id}
                  p={3}
                  bg="gray.50"
                  borderRadius="xl"
                >
                  <Stack
                    direction={{ base: "column", sm: "row" }}
                    justify="space-between"
                    align={{ base: "flex-start", sm: "center" }}
                    gap={2}
                  >
                    <Text fontSize="sm" wordBreak="break-all">{member.email}</Text>
                    <Stack direction="row" gap={2} align="center" flexShrink={0}>
                      <Badge colorPalette={member.role === "admin" ? "orange" : "blue"}>
                        {member.role === "admin" ? "Admin" : "Miembro"}
                      </Badge>
                      {isAdmin && member.user_id !== user?.id && (
                        <Button
                          size="xs"
                          variant="ghost"
                          colorPalette="red"
                          onClick={() => setMemberToRemove(member)}
                        >
                          Quitar
                        </Button>
                      )}
                    </Stack>
                  </Stack>
                </Box>
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
                <Box
                  key={invitation.id}
                  p={3}
                  bg="yellow.50"
                  borderRadius="xl"
                >
                  <Stack
                    direction={{ base: "column", sm: "row" }}
                    justify="space-between"
                    align={{ base: "flex-start", sm: "center" }}
                    gap={2}
                  >
                    <Text fontSize="sm" wordBreak="break-all">{invitation.email}</Text>
                    <Stack direction="row" gap={2} align="center" flexShrink={0}>
                      <Badge colorPalette="yellow">Pendiente</Badge>
                      <Button
                        size="xs"
                        variant="ghost"
                        colorPalette="red"
                        onClick={() => setInvitationToCancel(invitation)}
                      >
                        Cancelar
                      </Button>
                    </Stack>
                  </Stack>
                </Box>
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
                colorPalette="teal"
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

      {/* Modal: Confirmar eliminar miembro */}
      <DialogRoot
        placement="center"
        size="sm"
        open={!!memberToRemove}
        onOpenChange={(e) => !e.open && setMemberToRemove(null)}
      >
        <DialogBackdrop bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <DialogContent
          position="fixed"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          maxW="400px"
          w="90%"
          m={0}
        >
          <DialogHeader>
            <DialogTitle>Eliminar Miembro</DialogTitle>
            <DialogCloseTrigger />
          </DialogHeader>
          <DialogBody pb={4}>
            <Text>
              ¿Estás seguro de quitar a <Text as="span" fontWeight="bold">{memberToRemove?.email}</Text> del hogar?
            </Text>
            <Text fontSize="sm" color="gray.600" mt={2}>
              Esta persona ya no podrá ver ni registrar gastos en este hogar.
            </Text>
          </DialogBody>
          <DialogFooter gap={2}>
            <DialogActionTrigger asChild>
              <Button variant="outline" flex={1}>Cancelar</Button>
            </DialogActionTrigger>
            <Button
              colorPalette="red"
              onClick={handleRemoveMember}
              flex={1}
            >
              Quitar
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      {/* Modal: Confirmar cancelar invitación */}
      <DialogRoot
        placement="center"
        size="sm"
        open={!!invitationToCancel}
        onOpenChange={(e) => !e.open && setInvitationToCancel(null)}
      >
        <DialogBackdrop bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <DialogContent
          position="fixed"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          maxW="400px"
          w="90%"
          m={0}
        >
          <DialogHeader>
            <DialogTitle>Cancelar Invitación</DialogTitle>
            <DialogCloseTrigger />
          </DialogHeader>
          <DialogBody pb={4}>
            <Text>
              ¿Estás seguro de cancelar la invitación a <Text as="span" fontWeight="bold">{invitationToCancel?.email}</Text>?
            </Text>
            <Text fontSize="sm" color="gray.600" mt={2}>
              El enlace de invitación enviado dejará de funcionar.
            </Text>
          </DialogBody>
          <DialogFooter gap={2}>
            <DialogActionTrigger asChild>
              <Button variant="outline" flex={1}>Volver</Button>
            </DialogActionTrigger>
            <Button
              colorPalette="red"
              onClick={handleCancelInvitation}
              flex={1}
            >
              Cancelar Invitación
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </Box>
  );
}
