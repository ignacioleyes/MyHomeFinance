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

interface HouseholdMembersProps {
  householdId: string;
  householdName: string;
}

export function HouseholdMembers({ householdId, householdName }: HouseholdMembersProps) {
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);

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
      // Check if user exists by email
      const { data: userData, error: userError } = await supabase.rpc(
        "get_user_id_by_email",
        { email_param: inviteEmail }
      );

      if (userError || !userData) {
        toaster.create({
          title: "Usuario no encontrado",
          description: "Este email no está registrado. Pídele que se registre primero.",
          type: "warning",
        });
        setInviting(false);
        return;
      }

      // Check if already a member
      const { data: existingMember } = await supabase
        .from("household_members")
        .select("id")
        .eq("household_id", householdId)
        .eq("user_id", userData)
        .maybeSingle();

      if (existingMember) {
        toaster.create({
          title: "Ya es miembro",
          description: "Este usuario ya forma parte del hogar",
          type: "info",
        });
        setInviting(false);
        return;
      }

      // Add member
      const { error: insertError } = await supabase
        .from("household_members")
        .insert({
          household_id: householdId,
          user_id: userData,
          role: "member",
        } as any);

      if (insertError) throw insertError;

      toaster.create({
        title: "¡Invitación enviada!",
        description: `${inviteEmail} ahora es parte del hogar`,
        type: "success",
      });

      setInviteEmail("");
      await loadMembers();
    } catch (err: any) {
      console.error("Error inviting member:", err);
      toaster.create({
        title: "Error",
        description: "No se pudo enviar la invitación",
        type: "error",
      });
    } finally {
      setInviting(false);
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
        <Heading as="h3" size="md" color="primary.600">
          {householdName}
        </Heading>

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
                  <Badge colorPalette={member.role === "admin" ? "orange" : "blue"}>
                    {member.role === "admin" ? "Admin" : "Miembro"}
                  </Badge>
                </Stack>
              ))}
            </Stack>
          )}
        </Box>

        {/* Invite Section (only for admins) */}
        {isAdmin && (
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
                El usuario debe estar registrado primero
              </Text>
            </Stack>
          </Box>
        )}
      </Stack>
    </Box>
  );
}
