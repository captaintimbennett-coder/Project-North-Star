import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "retreat_events" ADD COLUMN "time_zone" varchar DEFAULT 'America/Chicago';
  ALTER TABLE "_retreat_events_v" ADD COLUMN "version_time_zone" varchar DEFAULT 'America/Chicago';`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "retreat_events" DROP COLUMN "time_zone";
  ALTER TABLE "_retreat_events_v" DROP COLUMN "version_time_zone";`)
}
