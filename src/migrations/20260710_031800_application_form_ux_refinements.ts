import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TYPE "public"."enum_model_applications_travel_availability" ADD VALUE IF NOT EXISTS 'yes';
    ALTER TYPE "public"."enum_model_applications_travel_availability" ADD VALUE IF NOT EXISTS 'no';
    ALTER TYPE "public"."enum_model_applications_travel_availability" ADD VALUE IF NOT EXISTS 'possibly';
    ALTER TYPE "public"."enum__model_applications_v_version_travel_availability" ADD VALUE IF NOT EXISTS 'yes';
    ALTER TYPE "public"."enum__model_applications_v_version_travel_availability" ADD VALUE IF NOT EXISTS 'no';
    ALTER TYPE "public"."enum__model_applications_v_version_travel_availability" ADD VALUE IF NOT EXISTS 'possibly';

    DO $$ BEGIN
      CREATE TYPE "public"."enum_model_applications_alternate_model_list" AS ENUM('yes', 'no');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      CREATE TYPE "public"."enum__model_applications_v_version_alternate_model_list" AS ENUM('yes', 'no');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    ALTER TABLE "model_applications" ADD COLUMN IF NOT EXISTS "alternate_model_list" "enum_model_applications_alternate_model_list";
    ALTER TABLE "_model_applications_v" ADD COLUMN IF NOT EXISTS "version_alternate_model_list" "enum__model_applications_v_version_alternate_model_list";
    ALTER TABLE "photographer_applications" ALTER COLUMN "what_they_hope_to_create" DROP NOT NULL;
    ALTER TABLE "photographer_applications" ALTER COLUMN "retreat_goals" DROP NOT NULL;
    ALTER TABLE "_photographer_applications_v" ALTER COLUMN "version_what_they_hope_to_create" DROP NOT NULL;
    ALTER TABLE "_photographer_applications_v" ALTER COLUMN "version_retreat_goals" DROP NOT NULL;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "_model_applications_v" DROP COLUMN IF EXISTS "version_alternate_model_list";
    ALTER TABLE "model_applications" DROP COLUMN IF EXISTS "alternate_model_list";
    DROP TYPE IF EXISTS "public"."enum__model_applications_v_version_alternate_model_list";
    DROP TYPE IF EXISTS "public"."enum_model_applications_alternate_model_list";
    ALTER TABLE "_photographer_applications_v" ALTER COLUMN "version_retreat_goals" SET NOT NULL;
    ALTER TABLE "_photographer_applications_v" ALTER COLUMN "version_what_they_hope_to_create" SET NOT NULL;
    ALTER TABLE "photographer_applications" ALTER COLUMN "retreat_goals" SET NOT NULL;
    ALTER TABLE "photographer_applications" ALTER COLUMN "what_they_hope_to_create" SET NOT NULL;
  `)
}
