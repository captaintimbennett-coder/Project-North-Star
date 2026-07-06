import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_roles" AS ENUM('administrator', 'photographer', 'model');
  CREATE TYPE "public"."enum_users_account_status" AS ENUM('invited', 'active', 'suspended');
  CREATE TABLE "users_roles" (
    "order" integer NOT NULL,
    "parent_id" integer NOT NULL,
    "value" "enum_users_roles",
    "id" serial PRIMARY KEY NOT NULL
  );

  ALTER TABLE "users" ALTER COLUMN "role" DROP NOT NULL;
  ALTER TABLE "users" ADD COLUMN "account_status" "enum_users_account_status" DEFAULT 'active' NOT NULL;
  ALTER TABLE "model_profiles" ADD COLUMN "account_id" integer;
  ALTER TABLE "_model_profiles_v" ADD COLUMN "version_account_id" integer;
  ALTER TABLE "photographer_profiles" ADD COLUMN "account_id" integer;
  ALTER TABLE "_photographer_profiles_v" ADD COLUMN "version_account_id" integer;
  ALTER TABLE "users_roles" ADD CONSTRAINT "users_roles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_roles_order_idx" ON "users_roles" USING btree ("order");
  CREATE INDEX "users_roles_parent_idx" ON "users_roles" USING btree ("parent_id");
  INSERT INTO "users_roles" ("order", "parent_id", "value")
  SELECT 1, "id", 'administrator'::"public"."enum_users_roles" FROM "users";
  ALTER TABLE "model_profiles" ADD CONSTRAINT "model_profiles_account_id_users_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_model_profiles_v" ADD CONSTRAINT "_model_profiles_v_version_account_id_users_id_fk" FOREIGN KEY ("version_account_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "photographer_profiles" ADD CONSTRAINT "photographer_profiles_account_id_users_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_photographer_profiles_v" ADD CONSTRAINT "_photographer_profiles_v_version_account_id_users_id_fk" FOREIGN KEY ("version_account_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "model_profiles_account_idx" ON "model_profiles" USING btree ("account_id");
  CREATE INDEX "_model_profiles_v_version_version_account_idx" ON "_model_profiles_v" USING btree ("version_account_id");
  CREATE UNIQUE INDEX "photographer_profiles_account_idx" ON "photographer_profiles" USING btree ("account_id");
  CREATE INDEX "_photographer_profiles_v_version_version_account_idx" ON "_photographer_profiles_v" USING btree ("version_account_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users_roles" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "users_roles" CASCADE;
  ALTER TABLE "model_profiles" DROP CONSTRAINT "model_profiles_account_id_users_id_fk";

  ALTER TABLE "_model_profiles_v" DROP CONSTRAINT "_model_profiles_v_version_account_id_users_id_fk";

  ALTER TABLE "photographer_profiles" DROP CONSTRAINT "photographer_profiles_account_id_users_id_fk";

  ALTER TABLE "_photographer_profiles_v" DROP CONSTRAINT "_photographer_profiles_v_version_account_id_users_id_fk";

  DROP INDEX "model_profiles_account_idx";
  DROP INDEX "_model_profiles_v_version_version_account_idx";
  DROP INDEX "photographer_profiles_account_idx";
  DROP INDEX "_photographer_profiles_v_version_version_account_idx";
  ALTER TABLE "users" ALTER COLUMN "role" SET NOT NULL;
  ALTER TABLE "users" DROP COLUMN "account_status";
  ALTER TABLE "model_profiles" DROP COLUMN "account_id";
  ALTER TABLE "_model_profiles_v" DROP COLUMN "version_account_id";
  ALTER TABLE "photographer_profiles" DROP COLUMN "account_id";
  ALTER TABLE "_photographer_profiles_v" DROP COLUMN "version_account_id";
  DROP TYPE "public"."enum_users_roles";
  DROP TYPE "public"."enum_users_account_status";`)
}
