import { z } from "zod";

export const createOrModifyGallerySchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters long")
    .max(128, "Name must be at most 128 characters long"),
  description: z
    .string()
    .max(256, "Description must be at most 256 characters long")
    .optional(),
});

export const galleryByIdSchema = z.object({
  galleryId: z.coerce.number(),
});

export const imageByIdSchema = z.object({
  imageId: z.coerce.number(),
});

export const collectionByIdSchema = z.object({
  collectionId: z.coerce.number(),
});

export const accessKeySchema = z.object({
  accessKey: z.string(),
});

export const createAccessKeySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long").max(
    256,
    "Name must be at most 256 characters long",
  ),
  canDownload: z.boolean(),
  canUseCollections: z.boolean(),
});

export const createCollectionSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long").max(
    256,
    "Name must be at most 256 characters long",
  ),
  isShared: z.boolean(),
});
