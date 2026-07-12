import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextRequest, NextResponse } from "next/server";
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/lib/application-protection";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.json() as HandleUploadBody;

  try {
    const response = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async (pathname) => {
        if (!pathname.startsWith("media/model-applications/")) {
          throw new Error("Invalid upload path.");
        }

        return {
          addRandomSuffix: true,
          allowedContentTypes: Array.from(ACCEPTED_IMAGE_TYPES),
          allowOverwrite: false,
          maximumSizeInBytes: MAX_IMAGE_BYTES,
          tokenPayload: "model-application-image",
        };
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to prepare model application upload", error);
    return NextResponse.json(
      {
        ok: false,
        error: "We could not prepare the image upload. Please try again.",
      },
      { status: 400 },
    );
  }
}
