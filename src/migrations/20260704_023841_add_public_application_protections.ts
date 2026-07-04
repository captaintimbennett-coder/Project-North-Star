import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "model_applications" ADD COLUMN "information_accurate_confirmed" boolean DEFAULT false NOT NULL;
  ALTER TABLE "model_applications" ADD COLUMN "no_acceptance_guarantee_confirmed" boolean DEFAULT false NOT NULL;
  ALTER TABLE "model_applications" ADD COLUMN "contact_permission_confirmed" boolean DEFAULT false NOT NULL;
  ALTER TABLE "_model_applications_v" ADD COLUMN "version_information_accurate_confirmed" boolean DEFAULT false NOT NULL;
  ALTER TABLE "_model_applications_v" ADD COLUMN "version_no_acceptance_guarantee_confirmed" boolean DEFAULT false NOT NULL;
  ALTER TABLE "_model_applications_v" ADD COLUMN "version_contact_permission_confirmed" boolean DEFAULT false NOT NULL;
  ALTER TABLE "photographer_applications" ADD COLUMN "information_accurate_confirmed" boolean DEFAULT false NOT NULL;
  ALTER TABLE "photographer_applications" ADD COLUMN "no_acceptance_guarantee_confirmed" boolean DEFAULT false NOT NULL;
  ALTER TABLE "photographer_applications" ADD COLUMN "internal_image_review_confirmed" boolean DEFAULT false NOT NULL;
  ALTER TABLE "photographer_applications" ADD COLUMN "contact_permission_confirmed" boolean DEFAULT false NOT NULL;
  ALTER TABLE "_photographer_applications_v" ADD COLUMN "version_information_accurate_confirmed" boolean DEFAULT false NOT NULL;
  ALTER TABLE "_photographer_applications_v" ADD COLUMN "version_no_acceptance_guarantee_confirmed" boolean DEFAULT false NOT NULL;
  ALTER TABLE "_photographer_applications_v" ADD COLUMN "version_internal_image_review_confirmed" boolean DEFAULT false NOT NULL;
  ALTER TABLE "_photographer_applications_v" ADD COLUMN "version_contact_permission_confirmed" boolean DEFAULT false NOT NULL;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "model_applications" DROP COLUMN "information_accurate_confirmed";
  ALTER TABLE "model_applications" DROP COLUMN "no_acceptance_guarantee_confirmed";
  ALTER TABLE "model_applications" DROP COLUMN "contact_permission_confirmed";
  ALTER TABLE "_model_applications_v" DROP COLUMN "version_information_accurate_confirmed";
  ALTER TABLE "_model_applications_v" DROP COLUMN "version_no_acceptance_guarantee_confirmed";
  ALTER TABLE "_model_applications_v" DROP COLUMN "version_contact_permission_confirmed";
  ALTER TABLE "photographer_applications" DROP COLUMN "information_accurate_confirmed";
  ALTER TABLE "photographer_applications" DROP COLUMN "no_acceptance_guarantee_confirmed";
  ALTER TABLE "photographer_applications" DROP COLUMN "internal_image_review_confirmed";
  ALTER TABLE "photographer_applications" DROP COLUMN "contact_permission_confirmed";
  ALTER TABLE "_photographer_applications_v" DROP COLUMN "version_information_accurate_confirmed";
  ALTER TABLE "_photographer_applications_v" DROP COLUMN "version_no_acceptance_guarantee_confirmed";
  ALTER TABLE "_photographer_applications_v" DROP COLUMN "version_internal_image_review_confirmed";
  ALTER TABLE "_photographer_applications_v" DROP COLUMN "version_contact_permission_confirmed";`)
}
