const LOCAL_ALLOWED_ORIGINS = new Set([
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3003",
  "http://localhost:3004",
  "http://localhost:3005",
  "http://localhost:3006",
  "http://localhost:3007",
  "http://localhost:3008",
  "http://localhost:3009",
  "http://localhost:3010",
  "http://localhost:3011",
  "http://localhost:3012",
  "http://localhost:3013",
  "http://localhost:3014",
  "http://localhost:3015",
  "http://localhost:3016",
  "http://localhost:3017",
  "http://localhost:3018",
  "http://localhost:3019",
  "http://localhost:3020",
  "http://localhost:3021",
  "http://localhost:3022",
  "http://localhost:3023",
  "http://localhost:3024",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3023",
  "http://127.0.0.1:3024",
]);

export function getAllowedOrigins() {
  const origins = new Set<string>();
  const configured = process.env.NEXT_PUBLIC_SERVER_URL;
  const vercelUrl = process.env.VERCEL_URL;

  if (configured) origins.add(configured.replace(/\/$/, ""));
  if (vercelUrl) origins.add(`https://${vercelUrl.replace(/\/$/, "")}`);
  if (process.env.NODE_ENV !== "production") {
    for (const origin of LOCAL_ALLOWED_ORIGINS) origins.add(origin);
  }

  return origins;
}

export function isAllowedOrigin(origin: string | null) {
  if (!origin) return process.env.NODE_ENV !== "production";
  return getAllowedOrigins().has(origin.replace(/\/$/, ""));
}

export function assertAllowedMutationOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!isAllowedOrigin(origin)) {
    return new Response(JSON.stringify({ error: "Request origin is not allowed." }), {
      headers: { "Content-Type": "application/json" },
      status: 403,
    });
  }

  return null;
}
