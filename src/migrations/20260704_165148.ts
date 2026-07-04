import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "model_profiles" ADD COLUMN "artist_statement" varchar;
  ALTER TABLE "model_profiles" ADD COLUMN "public_display_biography" boolean DEFAULT false;
  ALTER TABLE "model_profiles" ADD COLUMN "public_display_artist_statement" boolean DEFAULT false;
  ALTER TABLE "model_profiles" ADD COLUMN "public_display_location" boolean DEFAULT false;
  ALTER TABLE "model_profiles" ADD COLUMN "public_display_categories" boolean DEFAULT false;
  ALTER TABLE "model_profiles" ADD COLUMN "public_display_instagram" boolean DEFAULT false;
  ALTER TABLE "model_profiles" ADD COLUMN "public_display_website" boolean DEFAULT false;
  ALTER TABLE "_model_profiles_v" ADD COLUMN "version_artist_statement" varchar;
  ALTER TABLE "_model_profiles_v" ADD COLUMN "version_public_display_biography" boolean DEFAULT false;
  ALTER TABLE "_model_profiles_v" ADD COLUMN "version_public_display_artist_statement" boolean DEFAULT false;
  ALTER TABLE "_model_profiles_v" ADD COLUMN "version_public_display_location" boolean DEFAULT false;
  ALTER TABLE "_model_profiles_v" ADD COLUMN "version_public_display_categories" boolean DEFAULT false;
  ALTER TABLE "_model_profiles_v" ADD COLUMN "version_public_display_instagram" boolean DEFAULT false;
  ALTER TABLE "_model_profiles_v" ADD COLUMN "version_public_display_website" boolean DEFAULT false;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "model_profiles" DROP COLUMN "artist_statement";
  ALTER TABLE "model_profiles" DROP COLUMN "public_display_biography";
  ALTER TABLE "model_profiles" DROP COLUMN "public_display_artist_statement";
  ALTER TABLE "model_profiles" DROP COLUMN "public_display_location";
  ALTER TABLE "model_profiles" DROP COLUMN "public_display_categories";
  ALTER TABLE "model_profiles" DROP COLUMN "public_display_instagram";
  ALTER TABLE "model_profiles" DROP COLUMN "public_display_website";
  ALTER TABLE "_model_profiles_v" DROP COLUMN "version_artist_statement";
  ALTER TABLE "_model_profiles_v" DROP COLUMN "version_public_display_biography";
  ALTER TABLE "_model_profiles_v" DROP COLUMN "version_public_display_artist_statement";
  ALTER TABLE "_model_profiles_v" DROP COLUMN "version_public_display_location";
  ALTER TABLE "_model_profiles_v" DROP COLUMN "version_public_display_categories";
  ALTER TABLE "_model_profiles_v" DROP COLUMN "version_public_display_instagram";
  ALTER TABLE "_model_profiles_v" DROP COLUMN "version_public_display_website";`)
}
