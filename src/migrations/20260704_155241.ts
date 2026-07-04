import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "model_applications_comfort_levels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_model_applications_v_version_comfort_levels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "model_applications_comfort_levels" CASCADE;
  DROP TABLE "_model_applications_v_version_comfort_levels" CASCADE;
  ALTER TABLE "model_applications" ALTER COLUMN "legal_name" DROP NOT NULL;
  ALTER TABLE "_model_applications_v" ALTER COLUMN "version_legal_name" DROP NOT NULL;
  DROP TYPE "public"."enum_model_applications_comfort_levels";
  DROP TYPE "public"."enum__model_applications_v_version_comfort_levels";`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_model_applications_comfort_levels" AS ENUM('fully-clothed', 'fashion', 'swimwear', 'lingerie', 'implied-nude', 'artistic-nude', 'fine-art-nude');
  CREATE TYPE "public"."enum__model_applications_v_version_comfort_levels" AS ENUM('fully-clothed', 'fashion', 'swimwear', 'lingerie', 'implied-nude', 'artistic-nude', 'fine-art-nude');
  CREATE TABLE "model_applications_comfort_levels" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_model_applications_comfort_levels",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_model_applications_v_version_comfort_levels" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__model_applications_v_version_comfort_levels",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  UPDATE "model_applications" SET "legal_name" = "stage_name" WHERE "legal_name" IS NULL;
  UPDATE "_model_applications_v" SET "version_legal_name" = "version_stage_name" WHERE "version_legal_name" IS NULL;
  ALTER TABLE "model_applications" ALTER COLUMN "legal_name" SET NOT NULL;
  ALTER TABLE "_model_applications_v" ALTER COLUMN "version_legal_name" SET NOT NULL;
  ALTER TABLE "model_applications_comfort_levels" ADD CONSTRAINT "model_applications_comfort_levels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."model_applications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_model_applications_v_version_comfort_levels" ADD CONSTRAINT "_model_applications_v_version_comfort_levels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_model_applications_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "model_applications_comfort_levels_order_idx" ON "model_applications_comfort_levels" USING btree ("order");
  CREATE INDEX "model_applications_comfort_levels_parent_idx" ON "model_applications_comfort_levels" USING btree ("parent_id");
  CREATE INDEX "_model_applications_v_version_comfort_levels_order_idx" ON "_model_applications_v_version_comfort_levels" USING btree ("order");
  CREATE INDEX "_model_applications_v_version_comfort_levels_parent_idx" ON "_model_applications_v_version_comfort_levels" USING btree ("parent_id");`)
}
