import { CollectionCards as CollectionCards_f9c02e79a4aed9a3924487c0cd4cafb1 } from "@payloadcms/next/rsc";
import { VercelBlobClientUploadHandler as VercelBlobClientUploadHandler_16c82c5e25f430251a3e3ba57219ff4e } from "@payloadcms/storage-vercel-blob/client";
import {
  ModelApplicationReviewGuide as ModelApplicationReviewGuide_a79c18f7cb19d2c7a366ab9643061bff,
  PhotographerApplicationReviewGuide as PhotographerApplicationReviewGuide_a79c18f7cb19d2c7a366ab9643061bff,
} from "../../../payload/admin/ApplicationReviewGuide";
import type { ImportMap } from "payload";

export const importMap: ImportMap = {
  "/payload/admin/ApplicationReviewGuide#ModelApplicationReviewGuide":
    ModelApplicationReviewGuide_a79c18f7cb19d2c7a366ab9643061bff,
  "/payload/admin/ApplicationReviewGuide#PhotographerApplicationReviewGuide":
    PhotographerApplicationReviewGuide_a79c18f7cb19d2c7a366ab9643061bff,
  "@payloadcms/storage-vercel-blob/client#VercelBlobClientUploadHandler":
    VercelBlobClientUploadHandler_16c82c5e25f430251a3e3ba57219ff4e,
  "@payloadcms/next/rsc#CollectionCards": CollectionCards_f9c02e79a4aed9a3924487c0cd4cafb1,
};
