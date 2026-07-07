export function withVerifyFullSslMode(connectionString: string) {
  if (!connectionString) return connectionString;

  try {
    const url = new URL(connectionString);
    if (!url.protocol.startsWith("postgres")) return connectionString;

    const sslMode = url.searchParams.get("sslmode");
    if (!sslMode || sslMode === "require" || sslMode === "prefer") {
      url.searchParams.set("sslmode", "verify-full");
    }

    return url.toString();
  } catch {
    return connectionString;
  }
}
