import { NextRequest } from "next/server";
import { handleApplicationSubmission } from "@/lib/application-route";
import { createPublicPhotographerApplication } from "@/lib/application-submissions";

export const runtime = "nodejs";

export function POST(request: NextRequest) {
  return handleApplicationSubmission(request, "photographer", createPublicPhotographerApplication);
}

