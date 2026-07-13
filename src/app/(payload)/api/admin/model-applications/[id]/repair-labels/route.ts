import config from "@payload-config";
import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import { getCurrentAccount } from "@/lib/auth/current-account";
import { isStaff } from "@/payload/access/account";
import { repairApplicationReviewLabelsForApplication } from "@/payload/hooks/createModelProfileFromApplication";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: NextRequest, context: RouteContext) {
  const payload = await getPayload({ config });
  const account = await getCurrentAccount();

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
