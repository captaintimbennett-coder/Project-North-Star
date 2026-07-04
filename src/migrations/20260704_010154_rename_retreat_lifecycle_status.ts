import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_retreat_events_lifecycle_status" AS ENUM('draft', 'prototype', 'published', 'closed', 'archived');
  CREATE TYPE "public"."enum__retreat_events_v_version_lifecycle_status" AS ENUM('draft', 'prototype', 'published', 'closed', 'archived');
  ALTER TABLE "retreat_events" RENAME COLUMN "status" TO "lifecycle_status";
  ALTER TABLE "retreat_events" ALTER COLUMN "lifecycle_status" DROP DEFAULT;
  ALTER TABLE "retreat_events" ALTER COLUMN "lifecycle_status" TYPE "public"."enum_retreat_events_lifecycle_status" USING "lifecycle_status"::text::"public"."enum_retreat_events_lifecycle_status";
  ALTER TABLE "retreat_events" ALTER COLUMN "lifecycle_status" SET DEFAULT 'draft';
  ALTER TABLE "_retreat_events_v" RENAME COLUMN "version_status" TO "version_lifecycle_status";
  ALTER TABLE "_retreat_events_v" ALTER COLUMN "version_lifecycle_status" DROP DEFAULT;
  ALTER TABLE "_retreat_events_v" ALTER COLUMN "version_lifecycle_status" TYPE "public"."enum__retreat_events_v_version_lifecycle_status" USING "version_lifecycle_status"::text::"public"."enum__retreat_events_v_version_lifecycle_status";
  ALTER TABLE "_retreat_events_v" ALTER COLUMN "version_lifecycle_status" SET DEFAULT 'draft';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "retreat_events" ALTER COLUMN "lifecycle_status" DROP DEFAULT;
  ALTER TABLE "retreat_events" ALTER COLUMN "lifecycle_status" TYPE "public"."enum_retreat_events_status" USING (CASE WHEN "lifecycle_status"::text = 'published' THEN 'published' ELSE 'draft' END)::"public"."enum_retreat_events_status";
  ALTER TABLE "retreat_events" ALTER COLUMN "lifecycle_status" SET DEFAULT 'draft';
  ALTER TABLE "retreat_events" RENAME COLUMN "lifecycle_status" TO "status";
  ALTER TABLE "_retreat_events_v" ALTER COLUMN "version_lifecycle_status" DROP DEFAULT;
  ALTER TABLE "_retreat_events_v" ALTER COLUMN "version_lifecycle_status" TYPE "public"."enum__retreat_events_v_version_status" USING (CASE WHEN "version_lifecycle_status"::text = 'published' THEN 'published' ELSE 'draft' END)::"public"."enum__retreat_events_v_version_status";
  ALTER TABLE "_retreat_events_v" ALTER COLUMN "version_lifecycle_status" SET DEFAULT 'draft';
  ALTER TABLE "_retreat_events_v" RENAME COLUMN "version_lifecycle_status" TO "version_status";
  DROP TYPE "public"."enum_retreat_events_lifecycle_status";
  DROP TYPE "public"."enum__retreat_events_v_version_lifecycle_status";`)
}
