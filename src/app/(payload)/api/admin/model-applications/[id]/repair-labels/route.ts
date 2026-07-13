import config from "@payload-config";
import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import { isStaff } from "@/payload/access/account";
import { repairApplicationReviewLabelsForApplication } from "@/payload/hooks/createModelProfileFromApplication";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: request.headers });
  const userID = user && typeof user === "object" && "id" in user ? user.id : null;

  if (!userID || (typeof userID !== "number" && typeof userID !== "string")) {
    return NextResponse.json({ error: "Please sign in again before repairing application labels." }, { status: 401 });
  }

  const account = await payload.findByID({
    collection: "users",
    id: userID,
    overrideAccess: true,
  });

  if (!isStaff(account)) {
    return NextResponse.json({ error: "Only active administrators can repair application labels." }, { status: 403 });
  }

  const { id } = await context.params;
  const applicationID = Number(id);

  if (!Number.isInteger(applicationID) || applicationID <= 0) {
    return NextResponse.json({ error: "That application ID is not valid." }, { status: 400 });
  }

  const result = await repairApplicationReviewLabelsForApplication({ applicationID, payload });

  return NextResponse.json({ ok: true, result });
}
