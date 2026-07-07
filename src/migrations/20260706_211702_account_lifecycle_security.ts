import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_account_invitations_roles" AS ENUM('administrator', 'photographer', 'model');
  CREATE TYPE "public"."enum_account_invitations_staff_permission" AS ENUM('owner', 'editor', 'reviewer');
  CREATE TYPE "public"."enum_account_invitations_status" AS ENUM('pending', 'accepted', 'revoked', 'expired');
  CREATE TYPE "public"."enum_security_audit_events_severity" AS ENUM('info', 'warning', 'critical');
  CREATE TABLE "account_invitations_roles" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_account_invitations_roles",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "account_invitations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL,
  	"staff_permission" "enum_account_invitations_staff_permission",
  	"status" "enum_account_invitations_status" DEFAULT 'pending' NOT NULL,
  	"token_hash" varchar NOT NULL,
  	"token_expires_at" timestamp(3) with time zone NOT NULL,
  	"invited_by_id" integer,
  	"accepted_account_id" integer,
  	"accepted_at" timestamp(3) with time zone,
  	"revoked_at" timestamp(3) with time zone,
  	"related_model_profile_id" integer,
  	"related_photographer_profile_id" integer,
  	"admin_notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "security_audit_events" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"event_type" varchar NOT NULL,
  	"severity" "enum_security_audit_events_severity" DEFAULT 'info' NOT NULL,
  	"actor_id" integer,
  	"target_account_id" integer,
  	"target_invitation_id" integer,
  	"metadata" jsonb,
  	"occurred_at" timestamp(3) with time zone NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "users" ADD COLUMN "invited_at" timestamp(3) with time zone;
  ALTER TABLE "users" ADD COLUMN "invitation_accepted_at" timestamp(3) with time zone;
  ALTER TABLE "users" ADD COLUMN "last_login_at" timestamp(3) with time zone;
  ALTER TABLE "users" ADD COLUMN "suspended_at" timestamp(3) with time zone;
  ALTER TABLE "users" ADD COLUMN "suspension_reason" varchar;
  ALTER TABLE "users" ADD COLUMN "session_version" numeric DEFAULT 1;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "account_invitations_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "security_audit_events_id" integer;
  ALTER TABLE "account_invitations_roles" ADD CONSTRAINT "account_invitations_roles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."account_invitations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "account_invitations" ADD CONSTRAINT "account_invitations_invited_by_id_users_id_fk" FOREIGN KEY ("invited_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "account_invitations" ADD CONSTRAINT "account_invitations_accepted_account_id_users_id_fk" FOREIGN KEY ("accepted_account_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "account_invitations" ADD CONSTRAINT "account_invitations_related_model_profile_id_model_profiles_id_fk" FOREIGN KEY ("related_model_profile_id") REFERENCES "public"."model_profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "account_invitations" ADD CONSTRAINT "account_invitations_related_photographer_profile_id_photographer_profiles_id_fk" FOREIGN KEY ("related_photographer_profile_id") REFERENCES "public"."photographer_profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "security_audit_events" ADD CONSTRAINT "security_audit_events_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "security_audit_events" ADD CONSTRAINT "security_audit_events_target_account_id_users_id_fk" FOREIGN KEY ("target_account_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "security_audit_events" ADD CONSTRAINT "security_audit_events_target_invitation_id_account_invitations_id_fk" FOREIGN KEY ("target_invitation_id") REFERENCES "public"."account_invitations"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "account_invitations_roles_order_idx" ON "account_invitations_roles" USING btree ("order");
  CREATE INDEX "account_invitations_roles_parent_idx" ON "account_invitations_roles" USING btree ("parent_id");
  CREATE INDEX "account_invitations_email_idx" ON "account_invitations" USING btree ("email");
  CREATE INDEX "account_invitations_status_idx" ON "account_invitations" USING btree ("status");
  CREATE INDEX "account_invitations_token_hash_idx" ON "account_invitations" USING btree ("token_hash");
  CREATE INDEX "account_invitations_token_expires_at_idx" ON "account_invitations" USING btree ("token_expires_at");
  CREATE INDEX "account_invitations_invited_by_idx" ON "account_invitations" USING btree ("invited_by_id");
  CREATE INDEX "account_invitations_accepted_account_idx" ON "account_invitations" USING btree ("accepted_account_id");
  CREATE INDEX "account_invitations_related_model_profile_idx" ON "account_invitations" USING btree ("related_model_profile_id");
  CREATE INDEX "account_invitations_related_photographer_profile_idx" ON "account_invitations" USING btree ("related_photographer_profile_id");
  CREATE INDEX "account_invitations_updated_at_idx" ON "account_invitations" USING btree ("updated_at");
  CREATE INDEX "account_invitations_created_at_idx" ON "account_invitations" USING btree ("created_at");
  CREATE INDEX "security_audit_events_actor_idx" ON "security_audit_events" USING btree ("actor_id");
  CREATE INDEX "security_audit_events_target_account_idx" ON "security_audit_events" USING btree ("target_account_id");
  CREATE INDEX "security_audit_events_target_invitation_idx" ON "security_audit_events" USING btree ("target_invitation_id");
  CREATE INDEX "security_audit_events_occurred_at_idx" ON "security_audit_events" USING btree ("occurred_at");
  CREATE INDEX "security_audit_events_updated_at_idx" ON "security_audit_events" USING btree ("updated_at");
  CREATE INDEX "security_audit_events_created_at_idx" ON "security_audit_events" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_account_invitations_fk" FOREIGN KEY ("account_invitations_id") REFERENCES "public"."account_invitations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_security_audit_events_fk" FOREIGN KEY ("security_audit_events_id") REFERENCES "public"."security_audit_events"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_account_invitations_id_idx" ON "payload_locked_documents_rels" USING btree ("account_invitations_id");
  CREATE INDEX "payload_locked_documents_rels_security_audit_events_id_idx" ON "payload_locked_documents_rels" USING btree ("security_audit_events_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "account_invitations_roles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "account_invitations" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "security_audit_events" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "account_invitations_roles" CASCADE;
  DROP TABLE "account_invitations" CASCADE;
  DROP TABLE "security_audit_events" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_account_invitations_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_security_audit_events_fk";
  
  DROP INDEX "payload_locked_documents_rels_account_invitations_id_idx";
  DROP INDEX "payload_locked_documents_rels_security_audit_events_id_idx";
  ALTER TABLE "users" DROP COLUMN "invited_at";
  ALTER TABLE "users" DROP COLUMN "invitation_accepted_at";
  ALTER TABLE "users" DROP COLUMN "last_login_at";
  ALTER TABLE "users" DROP COLUMN "suspended_at";
  ALTER TABLE "users" DROP COLUMN "suspension_reason";
  ALTER TABLE "users" DROP COLUMN "session_version";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "account_invitations_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "security_audit_events_id";
  DROP TYPE "public"."enum_account_invitations_roles";
  DROP TYPE "public"."enum_account_invitations_staff_permission";
  DROP TYPE "public"."enum_account_invitations_status";
  DROP TYPE "public"."enum_security_audit_events_severity";`)
}
