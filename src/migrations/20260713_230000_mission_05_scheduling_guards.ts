import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE EXTENSION IF NOT EXISTS btree_gist;

    ALTER TABLE "retreat_bookings" ADD COLUMN "idempotency_key" varchar;
    ALTER TABLE "retreat_bookings" ADD COLUMN "administrator_changed_at" timestamp(3) with time zone;
    ALTER TABLE "_retreat_bookings_v" ADD COLUMN "version_idempotency_key" varchar;
    ALTER TABLE "_retreat_bookings_v" ADD COLUMN "version_administrator_changed_at" timestamp(3) with time zone;

    CREATE UNIQUE INDEX "retreat_bookings_idempotency_key_idx"
      ON "retreat_bookings" USING btree ("idempotency_key");
    CREATE INDEX "_retreat_bookings_v_version_idempotency_key_idx"
      ON "_retreat_bookings_v" USING btree ("version_idempotency_key");
    CREATE UNIQUE INDEX "artist_availability_event_artist_date_unique"
      ON "artist_availability" USING btree ("event_id", "artist_id", "date");

    ALTER TABLE "retreat_bookings"
      ADD CONSTRAINT "retreat_bookings_valid_range"
      CHECK ("end_at" > "start_at");
    ALTER TABLE "retreat_bookings"
      ADD CONSTRAINT "retreat_bookings_artist_no_overlap"
      EXCLUDE USING gist (
        "event_id" WITH =,
        "artist_id" WITH =,
        tstzrange("start_at", "end_at", '[)') WITH &&
      ) WHERE ("status" IN ('confirmed', 'admin-review'));
    ALTER TABLE "retreat_bookings"
      ADD CONSTRAINT "retreat_bookings_photographer_no_overlap"
      EXCLUDE USING gist (
        "event_id" WITH =,
        "photographer_id" WITH =,
        tstzrange("start_at", "end_at", '[)') WITH &&
      ) WHERE ("status" IN ('confirmed', 'admin-review'));
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "retreat_bookings" DROP CONSTRAINT IF EXISTS "retreat_bookings_photographer_no_overlap";
    ALTER TABLE "retreat_bookings" DROP CONSTRAINT IF EXISTS "retreat_bookings_artist_no_overlap";
    ALTER TABLE "retreat_bookings" DROP CONSTRAINT IF EXISTS "retreat_bookings_valid_range";
    DROP INDEX IF EXISTS "artist_availability_event_artist_date_unique";
    DROP INDEX IF EXISTS "_retreat_bookings_v_version_idempotency_key_idx";
    DROP INDEX IF EXISTS "retreat_bookings_idempotency_key_idx";
    ALTER TABLE "_retreat_bookings_v" DROP COLUMN IF EXISTS "version_idempotency_key";
    ALTER TABLE "_retreat_bookings_v" DROP COLUMN IF EXISTS "version_administrator_changed_at";
    ALTER TABLE "retreat_bookings" DROP COLUMN IF EXISTS "idempotency_key";
    ALTER TABLE "retreat_bookings" DROP COLUMN IF EXISTS "administrator_changed_at";
  `)
}
