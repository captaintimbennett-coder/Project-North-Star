import { sql } from "@payloadcms/db-postgres";
import type { PayloadRequest } from "payload";

type TransactionDatabase = {
  execute: (query: ReturnType<typeof sql>) => Promise<unknown>;
};

export async function acquireSchedulingLock(
  req: PayloadRequest,
  eventId: number | string,
  artistId: number | string,
  eventLocalDay: string,
) {
  const transactionID = await req.transactionID;
  const session = transactionID ? req.payload.db.sessions?.[transactionID] : undefined;
  if (!session) {
    throw new Error("Scheduling mutations require an active database transaction.");
  }

  const lockKey = `${eventId}:${artistId}:${eventLocalDay}`;
  await (session.db as TransactionDatabase).execute(
    sql`SELECT pg_advisory_xact_lock(hashtextextended(${lockKey}, 0))`,
  );
}
