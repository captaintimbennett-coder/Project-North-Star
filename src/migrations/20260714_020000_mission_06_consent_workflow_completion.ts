import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "model_applications"
      RENAME COLUMN "pub_perm_source" TO "public_profile_permission_source";
    ALTER TABLE "model_applications"
      ADD COLUMN "public_lineup_approved_at" timestamp(3) with time zone;

    ALTER TABLE "_model_applications_v"
      RENAME COLUMN "version_pub_perm_source" TO "version_public_profile_permission_source";
    ALTER TABLE "_model_applications_v"
      ADD COLUMN "version_public_lineup_approved_at" timestamp(3) with time zone;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "_model_applications_v"
      DROP COLUMN IF EXISTS "version_public_lineup_approved_at";
    ALTER TABLE "_model_applications_v"
      RENAME COLUMN "version_public_profile_permission_source" TO "version_pub_perm_source";

    ALTER TABLE "model_applications"
      DROP COLUMN IF EXISTS "public_lineup_approved_at";
    ALTER TABLE "model_applications"
      RENAME COLUMN "public_profile_permission_source" TO "pub_perm_source";
  `)
}
