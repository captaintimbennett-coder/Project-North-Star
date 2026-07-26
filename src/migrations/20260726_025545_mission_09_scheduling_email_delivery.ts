import { MigrateDownArgs, MigrateUpArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_scheduling_email_deliveries_notification_type"
      AS ENUM('booking-confirmed', 'booking-cancelled', 'booking-rescheduled');
    CREATE TYPE "public"."enum_scheduling_email_deliveries_recipient_role"
      AS ENUM('photographer', 'model');
    CREATE TYPE "public"."enum_scheduling_email_deliveries_status"
      AS ENUM('pending', 'sending', 'sent', 'failed');

    CREATE TABLE "scheduling_email_deliveries" (
      "id" serial PRIMARY KEY NOT NULL,
      "booking_id" integer NOT NULL,
      "notification_type" "enum_scheduling_email_deliveries_notification_type" NOT NULL,
      "recipient_role" "enum_scheduling_email_deliveries_recipient_role" NOT NULL,
      "recipient_name" varchar NOT NULL,
      "recipient_email" varchar NOT NULL,
      "delivery_key" varchar NOT NULL,
      "status" "enum_scheduling_email_deliveries_status" DEFAULT 'pending' NOT NULL,
      "attempts" numeric DEFAULT 0 NOT NULL,
      "last_attempt_at" timestamp(3) with time zone,
      "sent_at" timestamp(3) with time zone,
      "last_error" varchar,
      "template_data" jsonb NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN "scheduling_email_deliveries_id" integer;
    ALTER TABLE "scheduling_email_deliveries"
      ADD CONSTRAINT "scheduling_email_deliveries_booking_id_retreat_bookings_id_fk"
      FOREIGN KEY ("booking_id") REFERENCES "public"."retreat_bookings"("id")
      ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "payload_locked_documents_rels"
      ADD CONSTRAINT "payload_locked_documents_rels_scheduling_email_deliveries_fk"
      FOREIGN KEY ("scheduling_email_deliveries_id")
      REFERENCES "public"."scheduling_email_deliveries"("id")
      ON DELETE cascade ON UPDATE no action;

    CREATE INDEX "scheduling_email_deliveries_booking_idx"
      ON "scheduling_email_deliveries" USING btree ("booking_id");
    CREATE INDEX "scheduling_email_deliveries_notification_type_idx"
      ON "scheduling_email_deliveries" USING btree ("notification_type");
    CREATE INDEX "scheduling_email_deliveries_recipient_role_idx"
      ON "scheduling_email_deliveries" USING btree ("recipient_role");
    CREATE INDEX "scheduling_email_deliveries_recipient_email_idx"
      ON "scheduling_email_deliveries" USING btree ("recipient_email");
    CREATE UNIQUE INDEX "scheduling_email_deliveries_delivery_key_idx"
      ON "scheduling_email_deliveries" USING btree ("delivery_key");
    CREATE INDEX "scheduling_email_deliveries_status_idx"
      ON "scheduling_email_deliveries" USING btree ("status");
    CREATE INDEX "scheduling_email_deliveries_updated_at_idx"
      ON "scheduling_email_deliveries" USING btree ("updated_at");
    CREATE INDEX "scheduling_email_deliveries_created_at_idx"
      ON "scheduling_email_deliveries" USING btree ("created_at");
    CREATE INDEX "payload_locked_documents_rels_scheduling_email_deliverie_idx"
      ON "payload_locked_documents_rels" USING btree ("scheduling_email_deliveries_id");
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels"
      DROP CONSTRAINT "payload_locked_documents_rels_scheduling_email_deliveries_fk";
    DROP INDEX "payload_locked_documents_rels_scheduling_email_deliverie_idx";
    ALTER TABLE "payload_locked_documents_rels"
      DROP COLUMN "scheduling_email_deliveries_id";

    DROP TABLE "scheduling_email_deliveries" CASCADE;
    DROP TYPE "public"."enum_scheduling_email_deliveries_notification_type";
    DROP TYPE "public"."enum_scheduling_email_deliveries_recipient_role";
    DROP TYPE "public"."enum_scheduling_email_deliveries_status";
  `);
}
