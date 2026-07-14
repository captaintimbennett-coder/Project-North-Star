import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_model_applications_acceptance_email_status"
      AS ENUM('pending', 'sending', 'sent', 'failed');
    CREATE TYPE "public"."enum__model_applications_v_version_acceptance_email_status"
      AS ENUM('pending', 'sending', 'sent', 'failed');
    CREATE TYPE "public"."enum_model_applications_pub_perm_source"
      AS ENUM('applicant-application', 'administrator-documented');
    CREATE TYPE "public"."enum__model_applications_v_version_pub_perm_source"
      AS ENUM('applicant-application', 'administrator-documented');

    ALTER TABLE "model_applications"
      ALTER COLUMN "short_biography" DROP NOT NULL,
      ADD COLUMN "public_profile_permission_confirmed" boolean DEFAULT false NOT NULL,
      ADD COLUMN "pub_perm_source" "enum_model_applications_pub_perm_source",
      ADD COLUMN "public_profile_permission_confirmed_at" timestamp(3) with time zone,
      ADD COLUMN "acceptance_email_status" "enum_model_applications_acceptance_email_status" DEFAULT 'pending' NOT NULL,
      ADD COLUMN "acceptance_email_sent_at" timestamp(3) with time zone,
      ADD COLUMN "acceptance_email_last_error" varchar;

    ALTER TABLE "_model_applications_v"
      ALTER COLUMN "version_short_biography" DROP NOT NULL,
      ADD COLUMN "version_public_profile_permission_confirmed" boolean DEFAULT false NOT NULL,
      ADD COLUMN "version_pub_perm_source" "enum__model_applications_v_version_pub_perm_source",
      ADD COLUMN "version_public_profile_permission_confirmed_at" timestamp(3) with time zone,
      ADD COLUMN "version_acceptance_email_status" "enum__model_applications_v_version_acceptance_email_status" DEFAULT 'pending' NOT NULL,
      ADD COLUMN "version_acceptance_email_sent_at" timestamp(3) with time zone,
      ADD COLUMN "version_acceptance_email_last_error" varchar;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Intentionally partial: biography remains nullable by approved product
  // decision. Neon branch/PITR recovery is the primary full rollback path.
  await db.execute(sql`
    ALTER TABLE "_model_applications_v"
      DROP COLUMN IF EXISTS "version_acceptance_email_last_error",
      DROP COLUMN IF EXISTS "version_acceptance_email_sent_at",
      DROP COLUMN IF EXISTS "version_acceptance_email_status",
      DROP COLUMN IF EXISTS "version_public_profile_permission_confirmed_at",
      DROP COLUMN IF EXISTS "version_pub_perm_source",
      DROP COLUMN IF EXISTS "version_public_profile_permission_confirmed";

    ALTER TABLE "model_applications"
      DROP COLUMN IF EXISTS "acceptance_email_last_error",
      DROP COLUMN IF EXISTS "acceptance_email_sent_at",
      DROP COLUMN IF EXISTS "acceptance_email_status",
      DROP COLUMN IF EXISTS "public_profile_permission_confirmed_at",
      DROP COLUMN IF EXISTS "pub_perm_source",
      DROP COLUMN IF EXISTS "public_profile_permission_confirmed";

    DROP TYPE IF EXISTS "public"."enum__model_applications_v_version_acceptance_email_status";
    DROP TYPE IF EXISTS "public"."enum_model_applications_acceptance_email_status";
    DROP TYPE IF EXISTS "public"."enum__model_applications_v_version_pub_perm_source";
    DROP TYPE IF EXISTS "public"."enum_model_applications_pub_perm_source";
  `)
}
