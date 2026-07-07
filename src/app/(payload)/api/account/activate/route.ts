import config from "@payload-config";
import { getPayload } from "payload";
import { assertAllowedMutationOrigin } from "@/lib/security/origin";
import { hashSecurityToken } from "@/lib/security/tokens";
import { writeSecurityAuditEvent } from "@/lib/security/audit";

function json(body: Record<string, unknown>, status = 200) {
  return Response.json(body, { status });
}

function relationshipId(value: unknown) {
  if (typeof value === "number") return value;
  if (value && typeof value === "object" && "id" in value && typeof value.id === "number") {
    return value.id;
  }
  return null;
}

export async function POST(request: Request) {
  const blocked = assertAllowedMutationOrigin(request);
  if (blocked) return blocked;

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const token = typeof body?.token === "string" ? body.token.trim() : "";

  if (!name || password.length < 12 || !token) {
    return json({ error: "Please provide your name, invitation token, and a password of at least 12 characters." }, 400);
  }

  const payload = await getPayload({ config });
  const tokenHash = hashSecurityToken(token);
  const invitations = await payload.find({
    collection: "account-invitations",
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: {
      and: [
        { tokenHash: { equals: tokenHash } },
        { status: { equals: "pending" } },
      ],
    },
  });

  const invitation = invitations.docs[0];
  if (!invitation) {
    await writeSecurityAuditEvent(payload, {
      eventType: "account_invitation.accept_failed",
      metadata: { reason: "missing_or_already_used" },
      severity: "warning",
    });
    return json({ error: "This invitation is no longer available." }, 400);
  }

  if (new Date(invitation.tokenExpiresAt).getTime() <= Date.now()) {
    await payload.update({
      collection: "account-invitations",
      data: { status: "expired" },
      id: invitation.id,
      overrideAccess: true,
    });
    await writeSecurityAuditEvent(payload, {
      eventType: "account_invitation.accept_failed",
      metadata: { reason: "expired", invitation: invitation.id },
      severity: "warning",
      targetInvitation: invitation.id,
    });
    return json({ error: "This invitation has expired." }, 400);
  }

  const existing = await payload.find({
    collection: "users",
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { email: { equals: invitation.email } },
  });

  if (existing.totalDocs > 0) {
    await writeSecurityAuditEvent(payload, {
      eventType: "account_invitation.accept_failed",
      metadata: { reason: "account_exists", invitation: invitation.id },
      severity: "warning",
      targetInvitation: invitation.id,
    });
    return json({ error: "An account already exists for this invitation." }, 400);
  }

  const account = await payload.create({
    collection: "users",
    data: {
      accountStatus: "active",
      email: invitation.email,
      invitationAcceptedAt: new Date().toISOString(),
      name,
      password,
      role: invitation.roles?.includes("administrator") ? invitation.staffPermission ?? "reviewer" : undefined,
      roles: invitation.roles,
      sessionVersion: 1,
    },
    overrideAccess: true,
  });

  const relatedModelProfileId = relationshipId(invitation.relatedModelProfile);
  const relatedPhotographerProfileId = relationshipId(invitation.relatedPhotographerProfile);

  if (relatedModelProfileId && invitation.roles?.includes("model")) {
    await payload.update({
      collection: "model-profiles",
      data: { account: account.id },
      id: relatedModelProfileId,
      overrideAccess: true,
    });
  }

  if (relatedPhotographerProfileId && invitation.roles?.includes("photographer")) {
    await payload.update({
      collection: "photographer-profiles",
      data: { account: account.id },
      id: relatedPhotographerProfileId,
      overrideAccess: true,
    });
  }

  await payload.update({
    collection: "account-invitations",
    data: {
      acceptedAccount: account.id,
      acceptedAt: new Date().toISOString(),
      status: "accepted",
    },
    id: invitation.id,
    overrideAccess: true,
  });

  await writeSecurityAuditEvent(payload, {
    eventType: "account_invitation.accepted",
    metadata: { roles: invitation.roles },
    targetAccount: account.id,
    targetInvitation: invitation.id,
  });

  return json({ ok: true });
}
