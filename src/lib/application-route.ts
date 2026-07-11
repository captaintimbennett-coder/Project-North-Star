import { NextRequest, NextResponse } from "next/server";
import {
  ApplicationValidationError,
  checkRateLimit,
  getClientIP,
  isHoneypotTriggered,
} from "./application-protection";

type SubmissionHandler = (formData: FormData) => Promise<{ id: number | string }>;

export async function handleApplicationSubmission(
  request: NextRequest,
  applicationType: "model" | "photographer",
  submit: SubmissionHandler,
) {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json(
      { ok: false, error: "Submit this application as multipart form data." },
      { status: 415 },
    );
  }

  const ip = getClientIP(request);
  const rateLimit = checkRateLimit(`${applicationType}:${ip}`);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many application attempts. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      },
    );
  }

  try {
    const formData = await request.formData();
    if (isHoneypotTriggered(formData)) {
      return NextResponse.json({ ok: true, received: true }, { status: 202 });
    }

    const application = await submit(formData);
    return NextResponse.json(
      {
        ok: true,
        received: true,
        applicationId: application.id,
        message: "Application received for private review. Submission does not guarantee acceptance.",
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ApplicationValidationError) {
      return NextResponse.json({ ok: false, errors: error.errors }, { status: 400 });
    }
    console.error(`Failed to create ${applicationType} application`, error);
    return NextResponse.json(
      {
        ok: false,
        error:
          "We could not save this application. If no field below is highlighted, nothing is missing from your form. Please try again later.",
      },
      { status: 500 },
    );
  }
}
