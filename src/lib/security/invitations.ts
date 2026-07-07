import type { Payload } from "payload";
import { siteConfig } from "@/data/site";
import type { StaffPermission } from "@/payload/access/account";
import { addDays, createSecureToken, hashSecurityToken } from "./tokens";

type CreateAccountInvitationInput = {
  email: string;
  expiresInDays?: number;
  invitedBy?: number;
  roles: ("administrator" | "photographer" | "model")[];
  staffPermission?: StaffPermission;
};

export async function createAccountInvitation(payload: Payload, input: CreateAccountInvitationInput) {
  const token = createSecureToken();
  const tokenHash = hashSecurityToken(token);
  const expiresAt = addDays(new Date(), input.expiresInDays ?? 7);

  const invitation = await payload.create({
    collection: "account-invitations",
    data: {
      email: input.email.trim().toLowerCase(),
      invitedBy: input.invitedBy,
      roles: input.roles,
      staffPermission: input.roles.includes("administrator") ? input.staffPermission ?? "reviewer" : undefined,
      status: "pending",
      tokenExpiresAt: expiresAt.toISOString(),
      tokenHash,
    },
    overrideAccess: true,
  });

  return {
    activationUrl: `${siteConfig.url}/account/activate?token=${encodeURIComponent(token)}`,
    invitation,
    token,
  };
}
