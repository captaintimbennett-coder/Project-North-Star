import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "path";
import { buildConfig } from "payload";
import sharp from "sharp";
import { fileURLToPath } from "url";
import { withVerifyFullSslMode } from "./lib/database/connection-string";
import { AccountInvitations } from "./payload/collections/AccountInvitations";
import { Media } from "./payload/collections/Media";
import { ArtistAvailability } from "./payload/collections/ArtistAvailability";
import { ModelApplications } from "./payload/collections/ModelApplications";
import { ModelProfiles } from "./payload/collections/ModelProfiles";
import { PhotographerApplications } from "./payload/collections/PhotographerApplications";
import { PhotographerProfiles } from "./payload/collections/PhotographerProfiles";
import { RetreatEvents } from "./payload/collections/RetreatEvents";
import { RetreatBookings } from "./payload/collections/RetreatBookings";
import { SecurityAuditEvents } from "./payload/collections/SecurityAuditEvents";
import { Users } from "./payload/collections/Users";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: "— Project North Star",
    },
    user: Users.slug,
  },
  collections: [
    Users,
    AccountInvitations,
    SecurityAuditEvents,
    Media,
    RetreatEvents,
    ModelProfiles,
    PhotographerProfiles,
    ModelApplications,
    PhotographerApplications,
    ArtistAvailability,
    RetreatBookings,
  ],
  db: postgresAdapter({
    pool: {
      connectionString: withVerifyFullSslMode(process.env.DATABASE_URL || ""),
    },
  }),
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
});
