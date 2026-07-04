import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_model_profiles_modeling_categories" AS ENUM('glamour', 'boudoir', 'fashion', 'editorial', 'fine-art', 'lifestyle', 'commercial');
  CREATE TYPE "public"."enum_model_profiles_approval_status" AS ENUM('draft', 'review', 'approved', 'archived');
  CREATE TYPE "public"."enum_model_profiles_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__model_profiles_v_version_modeling_categories" AS ENUM('glamour', 'boudoir', 'fashion', 'editorial', 'fine-art', 'lifestyle', 'commercial');
  CREATE TYPE "public"."enum__model_profiles_v_version_approval_status" AS ENUM('draft', 'review', 'approved', 'archived');
  CREATE TYPE "public"."enum__model_profiles_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_photographer_profiles_approval_status" AS ENUM('draft', 'review', 'approved', 'archived');
  CREATE TYPE "public"."enum_photographer_profiles_experience_level" AS ENUM('developing', 'intermediate', 'advanced', 'professional');
  CREATE TYPE "public"."enum_photographer_profiles_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__photographer_profiles_v_version_approval_status" AS ENUM('draft', 'review', 'approved', 'archived');
  CREATE TYPE "public"."enum__photographer_profiles_v_version_experience_level" AS ENUM('developing', 'intermediate', 'advanced', 'professional');
  CREATE TYPE "public"."enum__photographer_profiles_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "model_profiles_modeling_categories" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_model_profiles_modeling_categories",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "model_profiles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"display_name" varchar,
  	"slug" varchar,
  	"approval_status" "enum_model_profiles_approval_status" DEFAULT 'draft',
  	"public_introduction" varchar,
  	"biography" varchar,
  	"featured_image_id" integer,
  	"city" varchar,
  	"state" varchar,
  	"website" varchar,
  	"instagram" varchar,
  	"usage_permission_confirmed" boolean DEFAULT false,
  	"admin_notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_model_profiles_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "model_profiles_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "_model_profiles_v_version_modeling_categories" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__model_profiles_v_version_modeling_categories",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_model_profiles_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_display_name" varchar,
  	"version_slug" varchar,
  	"version_approval_status" "enum__model_profiles_v_version_approval_status" DEFAULT 'draft',
  	"version_public_introduction" varchar,
  	"version_biography" varchar,
  	"version_featured_image_id" integer,
  	"version_city" varchar,
  	"version_state" varchar,
  	"version_website" varchar,
  	"version_instagram" varchar,
  	"version_usage_permission_confirmed" boolean DEFAULT false,
  	"version_admin_notes" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__model_profiles_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_model_profiles_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "photographer_profiles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"display_name" varchar,
  	"slug" varchar,
  	"approval_status" "enum_photographer_profiles_approval_status" DEFAULT 'draft',
  	"public_introduction" varchar,
  	"biography" varchar,
  	"profile_image_id" integer,
  	"experience_level" "enum_photographer_profiles_experience_level",
  	"equipment_summary" varchar,
  	"city" varchar,
  	"state" varchar,
  	"website" varchar,
  	"instagram" varchar,
  	"admin_notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_photographer_profiles_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_photographer_profiles_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_display_name" varchar,
  	"version_slug" varchar,
  	"version_approval_status" "enum__photographer_profiles_v_version_approval_status" DEFAULT 'draft',
  	"version_public_introduction" varchar,
  	"version_biography" varchar,
  	"version_profile_image_id" integer,
  	"version_experience_level" "enum__photographer_profiles_v_version_experience_level",
  	"version_equipment_summary" varchar,
  	"version_city" varchar,
  	"version_state" varchar,
  	"version_website" varchar,
  	"version_instagram" varchar,
  	"version_admin_notes" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__photographer_profiles_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "model_profiles_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "photographer_profiles_id" integer;
  ALTER TABLE "model_profiles_modeling_categories" ADD CONSTRAINT "model_profiles_modeling_categories_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."model_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "model_profiles" ADD CONSTRAINT "model_profiles_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "model_profiles_rels" ADD CONSTRAINT "model_profiles_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."model_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "model_profiles_rels" ADD CONSTRAINT "model_profiles_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_model_profiles_v_version_modeling_categories" ADD CONSTRAINT "_model_profiles_v_version_modeling_categories_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_model_profiles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_model_profiles_v" ADD CONSTRAINT "_model_profiles_v_parent_id_model_profiles_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."model_profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_model_profiles_v" ADD CONSTRAINT "_model_profiles_v_version_featured_image_id_media_id_fk" FOREIGN KEY ("version_featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_model_profiles_v_rels" ADD CONSTRAINT "_model_profiles_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_model_profiles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_model_profiles_v_rels" ADD CONSTRAINT "_model_profiles_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "photographer_profiles" ADD CONSTRAINT "photographer_profiles_profile_image_id_media_id_fk" FOREIGN KEY ("profile_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_photographer_profiles_v" ADD CONSTRAINT "_photographer_profiles_v_parent_id_photographer_profiles_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."photographer_profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_photographer_profiles_v" ADD CONSTRAINT "_photographer_profiles_v_version_profile_image_id_media_id_fk" FOREIGN KEY ("version_profile_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "model_profiles_modeling_categories_order_idx" ON "model_profiles_modeling_categories" USING btree ("order");
  CREATE INDEX "model_profiles_modeling_categories_parent_idx" ON "model_profiles_modeling_categories" USING btree ("parent_id");
  CREATE UNIQUE INDEX "model_profiles_slug_idx" ON "model_profiles" USING btree ("slug");
  CREATE INDEX "model_profiles_featured_image_idx" ON "model_profiles" USING btree ("featured_image_id");
  CREATE INDEX "model_profiles_updated_at_idx" ON "model_profiles" USING btree ("updated_at");
  CREATE INDEX "model_profiles_created_at_idx" ON "model_profiles" USING btree ("created_at");
  CREATE INDEX "model_profiles__status_idx" ON "model_profiles" USING btree ("_status");
  CREATE INDEX "model_profiles_rels_order_idx" ON "model_profiles_rels" USING btree ("order");
  CREATE INDEX "model_profiles_rels_parent_idx" ON "model_profiles_rels" USING btree ("parent_id");
  CREATE INDEX "model_profiles_rels_path_idx" ON "model_profiles_rels" USING btree ("path");
  CREATE INDEX "model_profiles_rels_media_id_idx" ON "model_profiles_rels" USING btree ("media_id");
  CREATE INDEX "_model_profiles_v_version_modeling_categories_order_idx" ON "_model_profiles_v_version_modeling_categories" USING btree ("order");
  CREATE INDEX "_model_profiles_v_version_modeling_categories_parent_idx" ON "_model_profiles_v_version_modeling_categories" USING btree ("parent_id");
  CREATE INDEX "_model_profiles_v_parent_idx" ON "_model_profiles_v" USING btree ("parent_id");
  CREATE INDEX "_model_profiles_v_version_version_slug_idx" ON "_model_profiles_v" USING btree ("version_slug");
  CREATE INDEX "_model_profiles_v_version_version_featured_image_idx" ON "_model_profiles_v" USING btree ("version_featured_image_id");
  CREATE INDEX "_model_profiles_v_version_version_updated_at_idx" ON "_model_profiles_v" USING btree ("version_updated_at");
  CREATE INDEX "_model_profiles_v_version_version_created_at_idx" ON "_model_profiles_v" USING btree ("version_created_at");
  CREATE INDEX "_model_profiles_v_version_version__status_idx" ON "_model_profiles_v" USING btree ("version__status");
  CREATE INDEX "_model_profiles_v_created_at_idx" ON "_model_profiles_v" USING btree ("created_at");
  CREATE INDEX "_model_profiles_v_updated_at_idx" ON "_model_profiles_v" USING btree ("updated_at");
  CREATE INDEX "_model_profiles_v_latest_idx" ON "_model_profiles_v" USING btree ("latest");
  CREATE INDEX "_model_profiles_v_autosave_idx" ON "_model_profiles_v" USING btree ("autosave");
  CREATE INDEX "_model_profiles_v_rels_order_idx" ON "_model_profiles_v_rels" USING btree ("order");
  CREATE INDEX "_model_profiles_v_rels_parent_idx" ON "_model_profiles_v_rels" USING btree ("parent_id");
  CREATE INDEX "_model_profiles_v_rels_path_idx" ON "_model_profiles_v_rels" USING btree ("path");
  CREATE INDEX "_model_profiles_v_rels_media_id_idx" ON "_model_profiles_v_rels" USING btree ("media_id");
  CREATE UNIQUE INDEX "photographer_profiles_slug_idx" ON "photographer_profiles" USING btree ("slug");
  CREATE INDEX "photographer_profiles_profile_image_idx" ON "photographer_profiles" USING btree ("profile_image_id");
  CREATE INDEX "photographer_profiles_updated_at_idx" ON "photographer_profiles" USING btree ("updated_at");
  CREATE INDEX "photographer_profiles_created_at_idx" ON "photographer_profiles" USING btree ("created_at");
  CREATE INDEX "photographer_profiles__status_idx" ON "photographer_profiles" USING btree ("_status");
  CREATE INDEX "_photographer_profiles_v_parent_idx" ON "_photographer_profiles_v" USING btree ("parent_id");
  CREATE INDEX "_photographer_profiles_v_version_version_slug_idx" ON "_photographer_profiles_v" USING btree ("version_slug");
  CREATE INDEX "_photographer_profiles_v_version_version_profile_image_idx" ON "_photographer_profiles_v" USING btree ("version_profile_image_id");
  CREATE INDEX "_photographer_profiles_v_version_version_updated_at_idx" ON "_photographer_profiles_v" USING btree ("version_updated_at");
  CREATE INDEX "_photographer_profiles_v_version_version_created_at_idx" ON "_photographer_profiles_v" USING btree ("version_created_at");
  CREATE INDEX "_photographer_profiles_v_version_version__status_idx" ON "_photographer_profiles_v" USING btree ("version__status");
  CREATE INDEX "_photographer_profiles_v_created_at_idx" ON "_photographer_profiles_v" USING btree ("created_at");
  CREATE INDEX "_photographer_profiles_v_updated_at_idx" ON "_photographer_profiles_v" USING btree ("updated_at");
  CREATE INDEX "_photographer_profiles_v_latest_idx" ON "_photographer_profiles_v" USING btree ("latest");
  CREATE INDEX "_photographer_profiles_v_autosave_idx" ON "_photographer_profiles_v" USING btree ("autosave");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_model_profiles_fk" FOREIGN KEY ("model_profiles_id") REFERENCES "public"."model_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_photographer_profiles_fk" FOREIGN KEY ("photographer_profiles_id") REFERENCES "public"."photographer_profiles"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_model_profiles_id_idx" ON "payload_locked_documents_rels" USING btree ("model_profiles_id");
  CREATE INDEX "payload_locked_documents_rels_photographer_profiles_id_idx" ON "payload_locked_documents_rels" USING btree ("photographer_profiles_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "model_profiles_modeling_categories" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "model_profiles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "model_profiles_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_model_profiles_v_version_modeling_categories" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_model_profiles_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_model_profiles_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "photographer_profiles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_photographer_profiles_v" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "model_profiles_modeling_categories" CASCADE;
  DROP TABLE "model_profiles" CASCADE;
  DROP TABLE "model_profiles_rels" CASCADE;
  DROP TABLE "_model_profiles_v_version_modeling_categories" CASCADE;
  DROP TABLE "_model_profiles_v" CASCADE;
  DROP TABLE "_model_profiles_v_rels" CASCADE;
  DROP TABLE "photographer_profiles" CASCADE;
  DROP TABLE "_photographer_profiles_v" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_model_profiles_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_photographer_profiles_fk";
  
  DROP INDEX "payload_locked_documents_rels_model_profiles_id_idx";
  DROP INDEX "payload_locked_documents_rels_photographer_profiles_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "model_profiles_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "photographer_profiles_id";
  DROP TYPE "public"."enum_model_profiles_modeling_categories";
  DROP TYPE "public"."enum_model_profiles_approval_status";
  DROP TYPE "public"."enum_model_profiles_status";
  DROP TYPE "public"."enum__model_profiles_v_version_modeling_categories";
  DROP TYPE "public"."enum__model_profiles_v_version_approval_status";
  DROP TYPE "public"."enum__model_profiles_v_version_status";
  DROP TYPE "public"."enum_photographer_profiles_approval_status";
  DROP TYPE "public"."enum_photographer_profiles_experience_level";
  DROP TYPE "public"."enum_photographer_profiles_status";
  DROP TYPE "public"."enum__photographer_profiles_v_version_approval_status";
  DROP TYPE "public"."enum__photographer_profiles_v_version_experience_level";
  DROP TYPE "public"."enum__photographer_profiles_v_version_status";`)
}
