import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."event_artist_status" AS ENUM('invited', 'confirmed', 'approved', 'withdrawn');
  CREATE TABLE "event_artists" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"artist_id" integer,
  	"participation_status" "event_artist_status" DEFAULT 'invited',
  	"display_order" numeric DEFAULT 100
  );
  
  CREATE TABLE "_event_artists_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"artist_id" integer,
  	"participation_status" "event_artist_status" DEFAULT 'invited',
  	"display_order" numeric DEFAULT 100,
  	"_uuid" varchar
  );
  
  ALTER TABLE "event_artists" ADD CONSTRAINT "event_artists_artist_id_model_profiles_id_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."model_profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_artists" ADD CONSTRAINT "event_artists_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."retreat_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_event_artists_v" ADD CONSTRAINT "_event_artists_v_artist_id_model_profiles_id_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."model_profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_artists_v" ADD CONSTRAINT "_event_artists_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_retreat_events_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "event_artists_order_idx" ON "event_artists" USING btree ("_order");
  CREATE INDEX "event_artists_parent_id_idx" ON "event_artists" USING btree ("_parent_id");
  CREATE INDEX "event_artists_artist_idx" ON "event_artists" USING btree ("artist_id");
  CREATE INDEX "_event_artists_v_order_idx" ON "_event_artists_v" USING btree ("_order");
  CREATE INDEX "_event_artists_v_parent_id_idx" ON "_event_artists_v" USING btree ("_parent_id");
  CREATE INDEX "_event_artists_v_artist_idx" ON "_event_artists_v" USING btree ("artist_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "event_artists" CASCADE;
  DROP TABLE "_event_artists_v" CASCADE;
  DROP TYPE "public"."event_artist_status";`)
}
