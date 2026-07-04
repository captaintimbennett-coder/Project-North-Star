import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_model_applications_marketing_source" AS ENUM('instagram', 'facebook', 'friend', 'photographer', 'model', 'workshop', 'magazine', 'google-search', 'other');
  CREATE TYPE "public"."enum__model_applications_v_version_marketing_source" AS ENUM('instagram', 'facebook', 'friend', 'photographer', 'model', 'workshop', 'magazine', 'google-search', 'other');
  CREATE TYPE "public"."enum_photographer_applications_marketing_source" AS ENUM('instagram', 'facebook', 'friend', 'photographer', 'model', 'workshop', 'magazine', 'google-search', 'other');
  CREATE TYPE "public"."enum__photographer_applications_v_version_marketing_source" AS ENUM('instagram', 'facebook', 'friend', 'photographer', 'model', 'workshop', 'magazine', 'google-search', 'other');
  ALTER TABLE "model_applications" ADD COLUMN "marketing_source" "enum_model_applications_marketing_source" DEFAULT 'other' NOT NULL;
  ALTER TABLE "model_applications" ADD COLUMN "other_marketing_source" varchar;
  ALTER TABLE "_model_applications_v" ADD COLUMN "version_marketing_source" "enum__model_applications_v_version_marketing_source" DEFAULT 'other' NOT NULL;
  ALTER TABLE "_model_applications_v" ADD COLUMN "version_other_marketing_source" varchar;
  ALTER TABLE "photographer_applications" ADD COLUMN "marketing_source" "enum_photographer_applications_marketing_source" DEFAULT 'other' NOT NULL;
  ALTER TABLE "photographer_applications" ADD COLUMN "other_marketing_source" varchar;
  ALTER TABLE "_photographer_applications_v" ADD COLUMN "version_marketing_source" "enum__photographer_applications_v_version_marketing_source" DEFAULT 'other' NOT NULL;
  ALTER TABLE "_photographer_applications_v" ADD COLUMN "version_other_marketing_source" varchar;`)

  await db.execute(sql`
    ALTER TABLE "model_applications" ALTER COLUMN "marketing_source" DROP DEFAULT;
    ALTER TABLE "_model_applications_v" ALTER COLUMN "version_marketing_source" DROP DEFAULT;
    ALTER TABLE "photographer_applications" ALTER COLUMN "marketing_source" DROP DEFAULT;
    ALTER TABLE "_photographer_applications_v" ALTER COLUMN "version_marketing_source" DROP DEFAULT;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "model_applications" DROP COLUMN "marketing_source";
  ALTER TABLE "model_applications" DROP COLUMN "other_marketing_source";
  ALTER TABLE "_model_applications_v" DROP COLUMN "version_marketing_source";
  ALTER TABLE "_model_applications_v" DROP COLUMN "version_other_marketing_source";
  ALTER TABLE "photographer_applications" DROP COLUMN "marketing_source";
  ALTER TABLE "photographer_applications" DROP COLUMN "other_marketing_source";
  ALTER TABLE "_photographer_applications_v" DROP COLUMN "version_marketing_source";
  ALTER TABLE "_photographer_applications_v" DROP COLUMN "version_other_marketing_source";
  DROP TYPE "public"."enum_model_applications_marketing_source";
  DROP TYPE "public"."enum__model_applications_v_version_marketing_source";
  DROP TYPE "public"."enum_photographer_applications_marketing_source";
  DROP TYPE "public"."enum__photographer_applications_v_version_marketing_source";`)
}
