import { z } from 'zod';

export const createGallerySchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters long')
    .max(128, 'Name must be at most 128 characters long'),
  description: z
    .string()
    .min(2, 'Description must be at least 2 characters long')
    .max(256, 'Description must be at most 256 characters long')
});

export const createAccessKeySchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters long')
    .max(256, 'Name must be at most 256 characters long'),
  canDownload: z.boolean()
});
