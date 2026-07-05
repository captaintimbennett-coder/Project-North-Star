import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "photographer_applications" ALTER COLUMN "display_name" DROP NOT NULL;
  ALTER TABLE "_photographer_applications_v" ALTER COLUMN "version_display_name" DROP NOT NULL;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "photographer_applications" ALTER COLUMN "display_name" SET NOT NULL;
  ALTER TABLE "_photographer_applications_v" ALTER COLUMN "version_display_name" SET NOT NULL;`)
}
