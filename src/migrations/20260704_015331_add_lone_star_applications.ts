import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_model_applications_creative_interests" AS ENUM('fashion', 'editorial', 'glamour', 'swimwear', 'lingerie', 'boudoir', 'artistic-nude', 'fine-art-nude', 'beauty-close-up', 'conceptual-creative', 'other');
  CREATE TYPE "public"."enum_model_applications_comfort_levels" AS ENUM('fully-clothed', 'fashion', 'swimwear', 'lingerie', 'implied-nude', 'artistic-nude', 'fine-art-nude');
  CREATE TYPE "public"."enum_model_applications_retreat_goals" AS ENUM('network-with-photographers', 'long-term-collaborations', 'paid-shooting-opportunities', 'expand-portfolio', 'publication-opportunities', 'professional-event-travel', 'meet-professional-models', 'professional-respectful-photographers', 'other');
  CREATE TYPE "public"."model_exp_level" AS ENUM('aspiring', 'developing', 'experienced', 'professional');
  CREATE TYPE "public"."enum_model_applications_travel_availability" AS ENUM('local-only', 'regional', 'domestic', 'international', 'case-by-case');
  CREATE TYPE "public"."enum_model_applications_application_status" AS ENUM('new', 'reviewing', 'accepted', 'declined', 'waitlist');
  CREATE TYPE "public"."enum__model_applications_v_version_creative_interests" AS ENUM('fashion', 'editorial', 'glamour', 'swimwear', 'lingerie', 'boudoir', 'artistic-nude', 'fine-art-nude', 'beauty-close-up', 'conceptual-creative', 'other');
  CREATE TYPE "public"."enum__model_applications_v_version_comfort_levels" AS ENUM('fully-clothed', 'fashion', 'swimwear', 'lingerie', 'implied-nude', 'artistic-nude', 'fine-art-nude');
  CREATE TYPE "public"."enum__model_applications_v_version_retreat_goals" AS ENUM('network-with-photographers', 'long-term-collaborations', 'paid-shooting-opportunities', 'expand-portfolio', 'publication-opportunities', 'professional-event-travel', 'meet-professional-models', 'professional-respectful-photographers', 'other');
  CREATE TYPE "public"."enum__model_applications_v_version_travel_availability" AS ENUM('local-only', 'regional', 'domestic', 'international', 'case-by-case');
  CREATE TYPE "public"."enum__model_applications_v_version_application_status" AS ENUM('new', 'reviewing', 'accepted', 'declined', 'waitlist');
  CREATE TYPE "public"."enum_photographer_applications_genres_interests" AS ENUM('glamour', 'boudoir', 'editorial', 'artistic-nude', 'fashion', 'swimwear', 'beauty', 'other');
  CREATE TYPE "public"."photo_exp_level" AS ENUM('developing', 'intermediate', 'advanced', 'professional');
  CREATE TYPE "public"."enum_photographer_applications_application_status" AS ENUM('new', 'reviewing', 'accepted', 'declined', 'waitlist');
  CREATE TYPE "public"."enum__photographer_applications_v_version_genres_interests" AS ENUM('glamour', 'boudoir', 'editorial', 'artistic-nude', 'fashion', 'swimwear', 'beauty', 'other');
  CREATE TYPE "public"."enum__photographer_applications_v_version_application_status" AS ENUM('new', 'reviewing', 'accepted', 'declined', 'waitlist');
  CREATE TABLE "model_applications_creative_interests" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_model_applications_creative_interests",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "model_applications_comfort_levels" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_model_applications_comfort_levels",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "model_applications_retreat_goals" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_model_applications_retreat_goals",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "model_applications" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"legal_name" varchar NOT NULL,
  	"stage_name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"phone" varchar NOT NULL,
  	"city" varchar NOT NULL,
  	"state" varchar NOT NULL,
  	"country" varchar NOT NULL,
  	"instagram_u_r_l" varchar,
  	"website_u_r_l" varchar,
  	"portfolio_u_r_l" varchar,
  	"agency_representation" varchar,
  	"modeling_experience_level" "model_exp_level" NOT NULL,
  	"travel_availability" "enum_model_applications_travel_availability" NOT NULL,
  	"home_airport" varchar,
  	"availability_notes" varchar,
  	"other_creative_interest" varchar,
  	"other_retreat_goal" varchar,
  	"preferred_hero_image_id" integer,
  	"short_biography" varchar NOT NULL,
  	"artist_statement" varchar,
  	"application_status" "enum_model_applications_application_status" DEFAULT 'new' NOT NULL,
  	"linked_model_profile_id" integer,
  	"private_admin_notes" varchar,
  	"consent_image_usage_confirmed" boolean DEFAULT false NOT NULL,
  	"code_of_conduct_confirmed" boolean DEFAULT false NOT NULL,
  	"submitted_at" timestamp(3) with time zone NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "model_applications_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "_model_applications_v_version_creative_interests" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__model_applications_v_version_creative_interests",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_model_applications_v_version_comfort_levels" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__model_applications_v_version_comfort_levels",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_model_applications_v_version_retreat_goals" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__model_applications_v_version_retreat_goals",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_model_applications_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_legal_name" varchar NOT NULL,
  	"version_stage_name" varchar NOT NULL,
  	"version_email" varchar NOT NULL,
  	"version_phone" varchar NOT NULL,
  	"version_city" varchar NOT NULL,
  	"version_state" varchar NOT NULL,
  	"version_country" varchar NOT NULL,
  	"version_instagram_u_r_l" varchar,
  	"version_website_u_r_l" varchar,
  	"version_portfolio_u_r_l" varchar,
  	"version_agency_representation" varchar,
  	"version_modeling_experience_level" "model_exp_level" NOT NULL,
  	"version_travel_availability" "enum__model_applications_v_version_travel_availability" NOT NULL,
  	"version_home_airport" varchar,
  	"version_availability_notes" varchar,
  	"version_other_creative_interest" varchar,
  	"version_other_retreat_goal" varchar,
  	"version_preferred_hero_image_id" integer,
  	"version_short_biography" varchar NOT NULL,
  	"version_artist_statement" varchar,
  	"version_application_status" "enum__model_applications_v_version_application_status" DEFAULT 'new' NOT NULL,
  	"version_linked_model_profile_id" integer,
  	"version_private_admin_notes" varchar,
  	"version_consent_image_usage_confirmed" boolean DEFAULT false NOT NULL,
  	"version_code_of_conduct_confirmed" boolean DEFAULT false NOT NULL,
  	"version_submitted_at" timestamp(3) with time zone NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_model_applications_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "photographer_applications_genres_interests" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_photographer_applications_genres_interests",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "photographer_applications" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"legal_name" varchar NOT NULL,
  	"display_name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"phone" varchar NOT NULL,
  	"city" varchar NOT NULL,
  	"state" varchar NOT NULL,
  	"country" varchar NOT NULL,
  	"instagram_u_r_l" varchar,
  	"website_u_r_l" varchar,
  	"portfolio_u_r_l" varchar,
  	"photography_experience_level" "photo_exp_level" NOT NULL,
  	"equipment_summary" varchar NOT NULL,
  	"other_genre_interest" varchar,
  	"what_they_hope_to_create" varchar NOT NULL,
  	"retreat_goals" varchar NOT NULL,
  	"collaboration_style_notes" varchar,
  	"application_status" "enum_photographer_applications_application_status" DEFAULT 'new' NOT NULL,
  	"linked_photographer_profile_id" integer,
  	"private_admin_notes" varchar,
  	"code_of_conduct_confirmed" boolean DEFAULT false NOT NULL,
  	"submitted_at" timestamp(3) with time zone NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_photographer_applications_v_version_genres_interests" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__photographer_applications_v_version_genres_interests",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_photographer_applications_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_legal_name" varchar NOT NULL,
  	"version_display_name" varchar NOT NULL,
  	"version_email" varchar NOT NULL,
  	"version_phone" varchar NOT NULL,
  	"version_city" varchar NOT NULL,
  	"version_state" varchar NOT NULL,
  	"version_country" varchar NOT NULL,
  	"version_instagram_u_r_l" varchar,
  	"version_website_u_r_l" varchar,
  	"version_portfolio_u_r_l" varchar,
  	"version_photography_experience_level" "photo_exp_level" NOT NULL,
  	"version_equipment_summary" varchar NOT NULL,
  	"version_other_genre_interest" varchar,
  	"version_what_they_hope_to_create" varchar NOT NULL,
  	"version_retreat_goals" varchar NOT NULL,
  	"version_collaboration_style_notes" varchar,
  	"version_application_status" "enum__photographer_applications_v_version_application_status" DEFAULT 'new' NOT NULL,
  	"version_linked_photographer_profile_id" integer,
  	"version_private_admin_notes" varchar,
  	"version_code_of_conduct_confirmed" boolean DEFAULT false NOT NULL,
  	"version_submitted_at" timestamp(3) with time zone NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "model_applications_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "photographer_applications_id" integer;
  ALTER TABLE "model_applications_creative_interests" ADD CONSTRAINT "model_applications_creative_interests_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."model_applications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "model_applications_comfort_levels" ADD CONSTRAINT "model_applications_comfort_levels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."model_applications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "model_applications_retreat_goals" ADD CONSTRAINT "model_applications_retreat_goals_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."model_applications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "model_applications" ADD CONSTRAINT "model_applications_preferred_hero_image_id_media_id_fk" FOREIGN KEY ("preferred_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "model_applications" ADD CONSTRAINT "model_applications_linked_model_profile_id_model_profiles_id_fk" FOREIGN KEY ("linked_model_profile_id") REFERENCES "public"."model_profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "model_applications_rels" ADD CONSTRAINT "model_applications_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."model_applications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "model_applications_rels" ADD CONSTRAINT "model_applications_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_model_applications_v_version_creative_interests" ADD CONSTRAINT "_model_applications_v_version_creative_interests_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_model_applications_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_model_applications_v_version_comfort_levels" ADD CONSTRAINT "_model_applications_v_version_comfort_levels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_model_applications_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_model_applications_v_version_retreat_goals" ADD CONSTRAINT "_model_applications_v_version_retreat_goals_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_model_applications_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_model_applications_v" ADD CONSTRAINT "_model_applications_v_parent_id_model_applications_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."model_applications"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_model_applications_v" ADD CONSTRAINT "_model_applications_v_version_preferred_hero_image_id_media_id_fk" FOREIGN KEY ("version_preferred_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_model_applications_v" ADD CONSTRAINT "_model_applications_v_version_linked_model_profile_id_model_profiles_id_fk" FOREIGN KEY ("version_linked_model_profile_id") REFERENCES "public"."model_profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_model_applications_v_rels" ADD CONSTRAINT "_model_applications_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_model_applications_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_model_applications_v_rels" ADD CONSTRAINT "_model_applications_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "photographer_applications_genres_interests" ADD CONSTRAINT "photographer_applications_genres_interests_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."photographer_applications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "photographer_applications" ADD CONSTRAINT "photographer_applications_linked_photographer_profile_id_photographer_profiles_id_fk" FOREIGN KEY ("linked_photographer_profile_id") REFERENCES "public"."photographer_profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_photographer_applications_v_version_genres_interests" ADD CONSTRAINT "_photographer_applications_v_version_genres_interests_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_photographer_applications_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_photographer_applications_v" ADD CONSTRAINT "_photographer_applications_v_parent_id_photographer_applications_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."photographer_applications"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_photographer_applications_v" ADD CONSTRAINT "_photographer_applications_v_version_linked_photographer_profile_id_photographer_profiles_id_fk" FOREIGN KEY ("version_linked_photographer_profile_id") REFERENCES "public"."photographer_profiles"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "model_applications_creative_interests_order_idx" ON "model_applications_creative_interests" USING btree ("order");
  CREATE INDEX "model_applications_creative_interests_parent_idx" ON "model_applications_creative_interests" USING btree ("parent_id");
  CREATE INDEX "model_applications_comfort_levels_order_idx" ON "model_applications_comfort_levels" USING btree ("order");
  CREATE INDEX "model_applications_comfort_levels_parent_idx" ON "model_applications_comfort_levels" USING btree ("parent_id");
  CREATE INDEX "model_applications_retreat_goals_order_idx" ON "model_applications_retreat_goals" USING btree ("order");
  CREATE INDEX "model_applications_retreat_goals_parent_idx" ON "model_applications_retreat_goals" USING btree ("parent_id");
  CREATE INDEX "model_applications_preferred_hero_image_idx" ON "model_applications" USING btree ("preferred_hero_image_id");
  CREATE INDEX "model_applications_linked_model_profile_idx" ON "model_applications" USING btree ("linked_model_profile_id");
  CREATE INDEX "model_applications_updated_at_idx" ON "model_applications" USING btree ("updated_at");
  CREATE INDEX "model_applications_created_at_idx" ON "model_applications" USING btree ("created_at");
  CREATE INDEX "model_applications_rels_order_idx" ON "model_applications_rels" USING btree ("order");
  CREATE INDEX "model_applications_rels_parent_idx" ON "model_applications_rels" USING btree ("parent_id");
  CREATE INDEX "model_applications_rels_path_idx" ON "model_applications_rels" USING btree ("path");
  CREATE INDEX "model_applications_rels_media_id_idx" ON "model_applications_rels" USING btree ("media_id");
  CREATE INDEX "_model_applications_v_version_creative_interests_order_idx" ON "_model_applications_v_version_creative_interests" USING btree ("order");
  CREATE INDEX "_model_applications_v_version_creative_interests_parent_idx" ON "_model_applications_v_version_creative_interests" USING btree ("parent_id");
  CREATE INDEX "_model_applications_v_version_comfort_levels_order_idx" ON "_model_applications_v_version_comfort_levels" USING btree ("order");
  CREATE INDEX "_model_applications_v_version_comfort_levels_parent_idx" ON "_model_applications_v_version_comfort_levels" USING btree ("parent_id");
  CREATE INDEX "_model_applications_v_version_retreat_goals_order_idx" ON "_model_applications_v_version_retreat_goals" USING btree ("order");
  CREATE INDEX "_model_applications_v_version_retreat_goals_parent_idx" ON "_model_applications_v_version_retreat_goals" USING btree ("parent_id");
  CREATE INDEX "_model_applications_v_parent_idx" ON "_model_applications_v" USING btree ("parent_id");
  CREATE INDEX "_model_applications_v_version_version_preferred_hero_ima_idx" ON "_model_applications_v" USING btree ("version_preferred_hero_image_id");
  CREATE INDEX "_model_applications_v_version_version_linked_model_profi_idx" ON "_model_applications_v" USING btree ("version_linked_model_profile_id");
  CREATE INDEX "_model_applications_v_version_version_updated_at_idx" ON "_model_applications_v" USING btree ("version_updated_at");
  CREATE INDEX "_model_applications_v_version_version_created_at_idx" ON "_model_applications_v" USING btree ("version_created_at");
  CREATE INDEX "_model_applications_v_created_at_idx" ON "_model_applications_v" USING btree ("created_at");
  CREATE INDEX "_model_applications_v_updated_at_idx" ON "_model_applications_v" USING btree ("updated_at");
  CREATE INDEX "_model_applications_v_rels_order_idx" ON "_model_applications_v_rels" USING btree ("order");
  CREATE INDEX "_model_applications_v_rels_parent_idx" ON "_model_applications_v_rels" USING btree ("parent_id");
  CREATE INDEX "_model_applications_v_rels_path_idx" ON "_model_applications_v_rels" USING btree ("path");
  CREATE INDEX "_model_applications_v_rels_media_id_idx" ON "_model_applications_v_rels" USING btree ("media_id");
  CREATE INDEX "photographer_applications_genres_interests_order_idx" ON "photographer_applications_genres_interests" USING btree ("order");
  CREATE INDEX "photographer_applications_genres_interests_parent_idx" ON "photographer_applications_genres_interests" USING btree ("parent_id");
  CREATE INDEX "photographer_applications_linked_photographer_profile_idx" ON "photographer_applications" USING btree ("linked_photographer_profile_id");
  CREATE INDEX "photographer_applications_updated_at_idx" ON "photographer_applications" USING btree ("updated_at");
  CREATE INDEX "photographer_applications_created_at_idx" ON "photographer_applications" USING btree ("created_at");
  CREATE INDEX "_photographer_applications_v_version_genres_interests_order_idx" ON "_photographer_applications_v_version_genres_interests" USING btree ("order");
  CREATE INDEX "_photographer_applications_v_version_genres_interests_parent_idx" ON "_photographer_applications_v_version_genres_interests" USING btree ("parent_id");
  CREATE INDEX "_photographer_applications_v_parent_idx" ON "_photographer_applications_v" USING btree ("parent_id");
  CREATE INDEX "_photographer_applications_v_version_version_linked_phot_idx" ON "_photographer_applications_v" USING btree ("version_linked_photographer_profile_id");
  CREATE INDEX "_photographer_applications_v_version_version_updated_at_idx" ON "_photographer_applications_v" USING btree ("version_updated_at");
  CREATE INDEX "_photographer_applications_v_version_version_created_at_idx" ON "_photographer_applications_v" USING btree ("version_created_at");
  CREATE INDEX "_photographer_applications_v_created_at_idx" ON "_photographer_applications_v" USING btree ("created_at");
  CREATE INDEX "_photographer_applications_v_updated_at_idx" ON "_photographer_applications_v" USING btree ("updated_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_model_applications_fk" FOREIGN KEY ("model_applications_id") REFERENCES "public"."model_applications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_photographer_applications_fk" FOREIGN KEY ("photographer_applications_id") REFERENCES "public"."photographer_applications"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_model_applications_id_idx" ON "payload_locked_documents_rels" USING btree ("model_applications_id");
  CREATE INDEX "payload_locked_documents_rels_photographer_applications__idx" ON "payload_locked_documents_rels" USING btree ("photographer_applications_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "model_applications_creative_interests" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "model_applications_comfort_levels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "model_applications_retreat_goals" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "model_applications" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "model_applications_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_model_applications_v_version_creative_interests" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_model_applications_v_version_comfort_levels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_model_applications_v_version_retreat_goals" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_model_applications_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_model_applications_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "photographer_applications_genres_interests" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "photographer_applications" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_photographer_applications_v_version_genres_interests" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_photographer_applications_v" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "model_applications_creative_interests" CASCADE;
  DROP TABLE "model_applications_comfort_levels" CASCADE;
  DROP TABLE "model_applications_retreat_goals" CASCADE;
  DROP TABLE "model_applications" CASCADE;
  DROP TABLE "model_applications_rels" CASCADE;
  DROP TABLE "_model_applications_v_version_creative_interests" CASCADE;
  DROP TABLE "_model_applications_v_version_comfort_levels" CASCADE;
  DROP TABLE "_model_applications_v_version_retreat_goals" CASCADE;
  DROP TABLE "_model_applications_v" CASCADE;
  DROP TABLE "_model_applications_v_rels" CASCADE;
  DROP TABLE "photographer_applications_genres_interests" CASCADE;
  DROP TABLE "photographer_applications" CASCADE;
  DROP TABLE "_photographer_applications_v_version_genres_interests" CASCADE;
  DROP TABLE "_photographer_applications_v" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_model_applications_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_photographer_applications_fk";
  
  DROP INDEX "payload_locked_documents_rels_model_applications_id_idx";
  DROP INDEX "payload_locked_documents_rels_photographer_applications__idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "model_applications_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "photographer_applications_id";
  DROP TYPE "public"."enum_model_applications_creative_interests";
  DROP TYPE "public"."enum_model_applications_comfort_levels";
  DROP TYPE "public"."enum_model_applications_retreat_goals";
  DROP TYPE "public"."model_exp_level";
  DROP TYPE "public"."enum_model_applications_travel_availability";
  DROP TYPE "public"."enum_model_applications_application_status";
  DROP TYPE "public"."enum__model_applications_v_version_creative_interests";
  DROP TYPE "public"."enum__model_applications_v_version_comfort_levels";
  DROP TYPE "public"."enum__model_applications_v_version_retreat_goals";
  DROP TYPE "public"."enum__model_applications_v_version_travel_availability";
  DROP TYPE "public"."enum__model_applications_v_version_application_status";
  DROP TYPE "public"."enum_photographer_applications_genres_interests";
  DROP TYPE "public"."photo_exp_level";
  DROP TYPE "public"."enum_photographer_applications_application_status";
  DROP TYPE "public"."enum__photographer_applications_v_version_genres_interests";
  DROP TYPE "public"."enum__photographer_applications_v_version_application_status";`)
}
