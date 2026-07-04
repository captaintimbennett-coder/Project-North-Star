import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "model_applications_creative_interests" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum_model_applications_creative_interests";
  CREATE TYPE "public"."enum_model_applications_creative_interests" AS ENUM('fashion', 'editorial', 'glamour', 'swimwear', 'lingerie', 'boudoir', 'artistic-nude', 'fine-art-nude', 'beauty', 'conceptual-creative', 'lifestyle', 'other');
  ALTER TABLE "model_applications_creative_interests" ALTER COLUMN "value" SET DATA TYPE "public"."enum_model_applications_creative_interests" USING "value"::"public"."enum_model_applications_creative_interests";
  ALTER TABLE "_model_applications_v_version_creative_interests" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum__model_applications_v_version_creative_interests";
  CREATE TYPE "public"."enum__model_applications_v_version_creative_interests" AS ENUM('fashion', 'editorial', 'glamour', 'swimwear', 'lingerie', 'boudoir', 'artistic-nude', 'fine-art-nude', 'beauty', 'conceptual-creative', 'lifestyle', 'other');
  ALTER TABLE "_model_applications_v_version_creative_interests" ALTER COLUMN "value" SET DATA TYPE "public"."enum__model_applications_v_version_creative_interests" USING "value"::"public"."enum__model_applications_v_version_creative_interests";`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "model_applications_creative_interests" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum_model_applications_creative_interests";
  CREATE TYPE "public"."enum_model_applications_creative_interests" AS ENUM('fashion', 'editorial', 'glamour', 'swimwear', 'lingerie', 'boudoir', 'artistic-nude', 'fine-art-nude', 'beauty-close-up', 'conceptual-creative', 'other');
  ALTER TABLE "model_applications_creative_interests" ALTER COLUMN "value" SET DATA TYPE "public"."enum_model_applications_creative_interests" USING "value"::"public"."enum_model_applications_creative_interests";
  ALTER TABLE "_model_applications_v_version_creative_interests" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum__model_applications_v_version_creative_interests";
  CREATE TYPE "public"."enum__model_applications_v_version_creative_interests" AS ENUM('fashion', 'editorial', 'glamour', 'swimwear', 'lingerie', 'boudoir', 'artistic-nude', 'fine-art-nude', 'beauty-close-up', 'conceptual-creative', 'other');
  ALTER TABLE "_model_applications_v_version_creative_interests" ALTER COLUMN "value" SET DATA TYPE "public"."enum__model_applications_v_version_creative_interests" USING "value"::"public"."enum__model_applications_v_version_creative_interests";`)
}
